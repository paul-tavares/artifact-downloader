import fetch from 'node-fetch'
import {promisify} from 'util'
import {unzip as zlibUnzip} from 'zlib'
import {URLSearchParams} from "url";
import {decodeArtifactContent} from "./decode_artifact_content";

const unzip = promisify(zlibUnzip);

const commonHttpHeaders = Object.freeze({
  'kbn-xsrf': 'xxx',
  'Content-Type': 'application/json'
});

class ApiResponseError extends Error {
  constructor(message, meta) {
    super(message);
    this.meta = meta;
  }
}

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
    await this.request(INGEST_API.FLEET_SETUP, {method: 'POST'});
    this._fleetSetupDone = true;
  }

  async downloadArtifact(artifactRelativeUrl) {
    /** @type Response */
    const artifactSearchResponse = await this.request(`/api/console/proxy?${(new URLSearchParams({
      path: '.fleet-artifacts/_search',
      method: 'GET'
    })).toString()}`, {
      method: 'POST',
      body: JSON.stringify({
        "query": {
          "bool": {
            "filter": [
              {
                "bool": {
                  "must": {
                    "match": {
                      "relative_url": artifactRelativeUrl
                    }
                  }
                }
              }
            ]
          }
        }
      })
    });

    if (!artifactSearchResponse.ok) {
      throw new ApiResponseError(
        `${artifactSearchResponse.status}: ${artifactSearchResponse.statusText}`,
        artifactSearchResponse
      );
    }

    const responseJson = await artifactSearchResponse.json();
    return decodeArtifactContent(responseJson.hits.hits["0"]._source.body);
  }
}
