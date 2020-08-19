import fetch from 'node-fetch'

const commonHttpHeaders = Object.freeze({
    'kbn-xsrf': 'xxx',
    'Content-Type': 'application/json'
});

// Taken from: x-pack/plugins/ingest_manager/common/constants/routes.ts
const INGEST_API_ROOT = '/api/ingest_manager';
const INGEST_API = {
    PACKAGE_CONFIGS: `${INGEST_API_ROOT}/package_configs`,
    ENROLLMENT_KEY_INFO: `${INGEST_API_ROOT}/fleet/enrollment-api-keys/{keyId}`,
    AGENT_LIST: `${INGEST_API_ROOT}/fleet/agents`
};


export class Kibana {
    constructor({kibanaUrl, kibanaUser, kibanaPassword}) {
        this._kibanaUser = kibanaUser;
        this._kibanaPassword = kibanaPassword;
        this._kibanaUrlProtocol = /^https?:\/\//.exec(kibanaUrl)[0];
        this._kibanaUrl = kibanaUrl.replace(this._kibanaUrlProtocol, '');
        this._apiRootUrl = `${this._kibanaUrlProtocol}${kibanaUser}:${kibanaPassword}@${this._kibanaUrl}`
    }

    apiPathTo(path) {
        return `${this._apiRootUrl}${path}`;
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
        const response = await fetch(this.apiPathTo(
            `${INGEST_API.PACKAGE_CONFIGS}?perPage=100&kuery=ingest-package-policies.package.name:endpoint`), {
            method: 'GET',
            headers: {
                ...commonHttpHeaders
            }
        });

        return await response.json();
    }


    async enrollAgent(agentConfigId) {

    }

    async getAnyFleetAgentAccessApiKey (agentConfigId) {
        // See if there are any agents and if so, then use the key from the first one found
        const agentListResponse = await fetch(this.apiPathTo(INGEST_API.AGENT_LIST), {headers: {...commonHttpHeaders}});
        const agentList = (await agentListResponse.json());

        if (agentList.list.length) {
            debugger;
        }

        debugger;

        // If no agents, Then get enrollment key

        // Enroll new agent (which returns an access key)

    }

    async downloadArtifact(apiKey, artifactUrl) {
        // download artifact

        // unzip it

        // return JSON from unzipped content
    }
}

