import fetch from 'node-fetch'
import {promisify} from 'util'
import {unzip as zlibUnzip} from 'zlib'

const unzip = promisify(zlibUnzip);

const commonHttpHeaders = Object.freeze({
    'kbn-xsrf': 'xxx',
    'Content-Type': 'application/json'
});

// Taken from:
// https://github.com/elastic/kibana/blob/master/x-pack/plugins/ingest_manager/common/constants/routes.ts
const INGEST_API_ROOT = '/api/fleet';
const INGEST_API = {
    PACKAGE_CONFIGS: `${INGEST_API_ROOT}/package_policies`,
    ENROLLMENT_KEY_LIST: `${INGEST_API_ROOT}/enrollment-api-keys`,
    ENROLLMENT_KEY_INFO: `${INGEST_API_ROOT}/enrollment-api-keys/{keyId}`,
    AGENT_LIST: `${INGEST_API_ROOT}/agents`,
    AGENT_ENROLL: `${INGEST_API_ROOT}/agents/enroll`,
    AGENT_UNENROLL: `${INGEST_API_ROOT}/agents/{agentId}/unenroll`,
    FLEET_SETUP: `${INGEST_API_ROOT}/agents/setup`
};

export class Kibana {

    constructor({kibanaUrl, kibanaUser, kibanaPassword}) {
        this._fleetSetupDone = false;
        this._kibanaUser = kibanaUser;
        this._kibanaPassword = kibanaPassword;
        this._kibanaUrlProtocol = /^https?:\/\//.exec(kibanaUrl)[0];
        this._kibanaUrl = kibanaUrl.replace(this._kibanaUrlProtocol, '');
        this._apiRootUrl = `${this._kibanaUrlProtocol}${kibanaUser}:${kibanaPassword}@${this._kibanaUrl}`
        this._version = undefined;
        this._elasticsearch = undefined;
    }

    getUrlWithNoAuth() {
        return `${this._kibanaUrlProtocol}${this._kibanaUrl}`;
    }

    apiPathTo(path) {
        return `${this._apiRootUrl}${path}`;
    }

    async request(uri, fetchInit) {
        // FIXME: this method should throw if `response.ok` is false;
        return fetch(
            uri.startsWith("http") ? uri : this.apiPathTo(uri),
            Object.assign({
                    method: 'GET',
                    headers: {
                        ...commonHttpHeaders
                    }
                },
                fetchInit
            )
        );
    }

    /**
     * retrieves kibana version using the `/api/status`
     * @returns {Promise<{number: string, build_snapshot: boolean, build_number: number, build_hash: string}>}
     */
    async fetchKibanaVersion() {
        if (this._version) {
            return this._version;
        }
        const response = await this.request('/api/status');
        this._version = (await response.json()).version;
        return this._version;
    }

    /**
     * Attempts to get elasticsearch information associated with this Kibana instance using the
     * `console` API
     * @returns {Promise<{
     *     name : string,
     *     cluster_name : string,
     *     cluster_uuid : string,
     *     version : {
     *       number : string,
     *       build_flavor : string,
     *       build_type : string,
     *       build_hash : string,
     *       build_date : string,
     *       build_snapshot : boolean,
     *       lucene_version : string,
     *       minimum_wire_compatibility_version : string,
     *       minimum_index_compatibility_version : string
     *     },
     *     tagline : string
     * }>}
     */
    async fetchElasticsearchInfo() {
        if (this._elasticsearch) {
            return this._elasticsearch;
        }
        const response = await this.request('/api/console/proxy?path=%2F&method=GET');
        this._elasticsearch = (await response.json());
        return this._elasticsearch;
    }

    /**
     * Retrieves list of Endpoint Polices
     *
     * @returns {Promise<{
     *      items: [],
     *      total: number,
     *      page: number,
     *      perPage: number
     * }>}
     */
    async fetchEndpointPolicies() {
        const response = await this.request(`${INGEST_API.PACKAGE_CONFIGS}?perPage=100&kuery=ingest-package-policies.package.name:endpoint`);
        return await response.json();
    }

    async ensureFleetSetup() {
        if (this._fleetSetupDone) {
            return;
        }
        await this.request(INGEST_API.FLEET_SETUP, { method: 'POST'});
        this._fleetSetupDone = true;
    }

    async getAnyFleetAgent(agentConfigId) {
        // Ensure fleet is enabled
        await this.ensureFleetSetup();
        // Enroll new agent (which returns an access key)
        const enrollmentKey = await enrollmentKeyForAgentConfig(this, agentConfigId);
        const enrolledAgent = await enrollAgent(this, enrollmentKey);
        return enrolledAgent;
    }

    async forceAgentUnEnroll(agentId) {
        const response = await this.request(
            INGEST_API.AGENT_UNENROLL.replace('{agentId}', agentId),
            {
                method: 'POST',
                body: JSON.stringify({ force: true }),
            }
        );
        return response.json();
    }

    async downloadArtifact(apiAccessKey, artifactUrl) {
        // download artifact
        const downloadResponse = await this.request(`${this.getUrlWithNoAuth()}${artifactUrl}`, {
            headers: {
                'kbn-xsrf': 'xxx',
                Authorization: `ApiKey ${apiAccessKey}`,
            }
        });
        const contentBuffer = await downloadResponse.buffer();
        const unzippedContent = await unzip(contentBuffer);

        // return JSON from unzipped content
        return JSON.parse(unzippedContent.toString());
    }
}

/**
 * Get enrollment key for agent config
 *
 * @param {Kibana} kibana
 * @param {string} agentConfigId
 * @returns {Promise<*>}
 */
const enrollmentKeyForAgentConfig = async (kibana, agentConfigId) => {
    // Ensure fleet is enabled
    await kibana.ensureFleetSetup();

    // Get enrollment key for agent config
    const enrollmentKeyResponse = await kibana.request(`${INGEST_API.ENROLLMENT_KEY_LIST}?kuery=policy_id:"${agentConfigId}"`);
    const enrollmentKeyResponseJson = await enrollmentKeyResponse.json();
    const enrollmentKey = enrollmentKeyResponseJson.list[0];

    const enrollmentKeyInfoResponse = await kibana.request(INGEST_API.ENROLLMENT_KEY_INFO.replace('{keyId}', enrollmentKey.id));
    return (await enrollmentKeyInfoResponse.json()).item;
}

/**
 * Enrolls a new agent with fleet, which in turn receives a new `access_api_key`
 *
 * @param {Kibana} kibana
 * @param enrollmentKey
 * @returns {Promise<{
 *      id: string,
 *      active: boolean,
 *      "config_id": string,
 *      "type": string,
 *      "enrolled_at": string,
 *      "user_provided_metadata": {
 *        "dev_agent_version": string,
 *        "region": string
 *      },
 *      "local_metadata": {
 *        "host": string,
 *        "elastic": {
 *          "agent": {
 *            "version": string
 *          }
 *        }
 *      },
 *      "current_error_events": [],
 *      "access_api_key": string,
 *      "status": string,
 *      "packages": []
 *  }>}
 */
const enrollAgent = async (kibana, enrollmentKey) => {
    // Ensure fleet is enabled
    await kibana.ensureFleetSetup();
    const versionNumber = (await kibana.fetchKibanaVersion()).number;

    const agentEnrollMsg = {
        type: 'PERMANENT',
        metadata: {
            local: {
                "elastic": {
                  "agent": {
                    "version": versionNumber
                  }
                },
                "host": {
                  "architecture": "x86_64",
                  "hostname": `artifact-downloader.${Math.random().toString(36).substr(2, 5)}.elastic.co`,
                  "name": "artifact-downloader",
                  "id": "1c032ec0-3a94-4d54-9ad2-c5610c0eaba4",
                  "ip": [
                    "fe80::703b:b9e6:887d:7f5/64",
                    "10.0.2.15/24",
                    "::1/128",
                    "127.0.0.1/8"
                  ],
                  "mac": [
                    "08:00:27:d8:c5:c0"
                  ]
                },
                "os": {
                  "family": "windows",
                  "kernel": "10.0.19041.388 (WinBuild.160101.0800)",
                  "platform": "windows",
                  "version": "10.0",
                  "name": "Windows 10 Pro",
                  "full": "Windows 10 Pro(10.0)"
                }
            },
            user_provided: {
                dev_agent_version: '0.0.1',
                region: 'us-east',
            },
        },
    };

    const enrollResponse = await kibana.request(`${kibana.getUrlWithNoAuth()}${INGEST_API.AGENT_ENROLL}`, {
        method: 'POST',
        body: JSON.stringify(agentEnrollMsg),
        headers: {
            ...commonHttpHeaders,
            Authorization: `ApiKey ${enrollmentKey.api_key}`,
        }
    });
    const enrollResponseObj = (await enrollResponse.json());
    if (!enrollResponse.ok) {
        throw new Error(JSON.stringify(enrollResponseObj));
    }
    return enrollResponseObj.item;

}
