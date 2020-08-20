import fetch from 'node-fetch'

const commonHttpHeaders = Object.freeze({
    'kbn-xsrf': 'xxx',
    'Content-Type': 'application/json'
});

// Taken from:
// https://github.com/elastic/kibana/blob/master/x-pack/plugins/ingest_manager/common/constants/routes.ts
const INGEST_API_ROOT = '/api/ingest_manager';
const INGEST_API = {
    PACKAGE_CONFIGS: `${INGEST_API_ROOT}/package_configs`,
    ENROLLMENT_KEY_LIST: `${INGEST_API_ROOT}/fleet/enrollment-api-keys`,
    ENROLLMENT_KEY_INFO: `${INGEST_API_ROOT}/fleet/enrollment-api-keys/{keyId}`,
    AGENT_LIST: `${INGEST_API_ROOT}/fleet/agents`,
    AGENT_ENROLL: `${INGEST_API_ROOT}/fleet/agents/enroll`,
    FLEET_SETUP: `${INGEST_API_ROOT}/fleet/setup`
};


export class Kibana {

    constructor({kibanaUrl, kibanaUser, kibanaPassword}) {
        this._fleetSetupDone = false;
        this._kibanaUser = kibanaUser;
        this._kibanaPassword = kibanaPassword;
        this._kibanaUrlProtocol = /^https?:\/\//.exec(kibanaUrl)[0];
        this._kibanaUrl = kibanaUrl.replace(this._kibanaUrlProtocol, '');
        this._apiRootUrl = `${this._kibanaUrlProtocol}${kibanaUser}:${kibanaPassword}@${this._kibanaUrl}`
    }

    getUrlWithNoAuth() {
        return `${this._kibanaUrlProtocol}${this._kibanaUrl}`;
    }

    apiPathTo(path) {
        return `${this._apiRootUrl}${path}`;
    }

    async request(uri, fetchInit) {
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

        // See if there are any agents and if so, then use the key from the first one found
        const agentListResponse = await fetch(this.apiPathTo(INGEST_API.AGENT_LIST), {headers: {...commonHttpHeaders}});
        const agentList = (await agentListResponse.json());

        if (agentList.list.length) {
            return agentList.list[0];
        }

        // Enroll new agent (which returns an access key)
        const enrollmentKey = await enrollmentKeyForAgentConfig(this, agentConfigId);
        const enrolledAgent = await enrollAgent(this, enrollmentKey);
        return enrolledAgent;
    }

    async downloadArtifact(apiAccessKey, artifactUrl) {
        // download artifact

        // unzip it

        // return JSON from unzipped content

        return {
            something: {
                here: {
                    ok: 1
                }
            }
        }
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
    // Get enrollment key for agent config
    const enrollmentKeyResponse = await kibana.request(`${INGEST_API.ENROLLMENT_KEY_LIST}?kuery=fleet-enrollment-api-keys.config_id:"${agentConfigId}"`);
    const enrollmentKey = (await enrollmentKeyResponse.json()).list[0];

    const enrollmentKeyInfoResponse = await kibana.request(INGEST_API.ENROLLMENT_KEY_INFO.replace('{keyId}', enrollmentKey.id));
    return (await enrollmentKeyInfoResponse.json()).item;
}

/**
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
    const agentEnrollMsg = {
        type: 'PERMANENT',
        metadata: {
            local: {
                host: `artifact-downloader.${Date.now()}.elastic.co`,
                elastic: {
                    agent: {
                        version: '8.0.0',
                    },
                },
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
    if (!enrollResponseObj.success) {
        throw new Error(JSON.stringify(enrollResponseObj));
    }
    return enrollResponseObj.item;

}