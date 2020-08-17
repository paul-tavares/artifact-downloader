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
        const response = await fetch(this.apiPathTo('/api/ingest_manager/package_configs?kuery=ingest-package-policies.package.name:endpoint'), {
            method: 'GET',
            headers: {
                ...commonHttpHeaders
            }
        });

        return await response.json();
    }


    async getFleetAgentAccessApiKey ({ kibanaUrl, kibanaUser, kibanaPassword, agentConfigId }) {

    }

    async downloadArtifact({ kibanaUrl, kibanaUser, kibanaPassword, apiKey, artifactUrl }) {

    }
}
