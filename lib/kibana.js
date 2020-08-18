import fetch from 'node-fetch'

const commonHttpHeaders = Object.freeze({
    'kbn-xsrf': 'xxx',
    'Content-Type': 'application/json'
});

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
        const response = await fetch(this.apiPathTo('/api/ingest_manager/package_configs?perPage=100&kuery=ingest-package-policies.package.name:endpoint'), {
            method: 'GET',
            headers: {
                ...commonHttpHeaders
            }
        });

        return await response.json();
    }


    async getEnrollmentApiKeyforAgentConfig(agentConfigId) {}

    async getAnyFleetAgentAccessApiKey (agentConfigId) {
        // See if there are any agents and if so, then use the key from the first one found

        // If no agents, Then get enrollment key

        // Enroll new agent (which returns an access key

    }

    async downloadArtifact(apiKey, artifactUrl) {
        // download artifact

        // unzip it

        // return JSON from unzipped content
    }
}

