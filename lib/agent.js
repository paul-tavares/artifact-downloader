

class Agent {
    /**
     * Enrolls a new agent and returns an instance of `Agent`
     *
     * @param {Kibana} kibana
     * @param {string} agentConfigId
     *
     * @returns {Promise<Agent>}
     */
    static async enroll(kibana, agentConfigId) {}

    /**
     * Returns a new agent using cached information if available, and if not, then a new
     * agent will be enrolled if an agentConfigId is defined
     *
     * @param {Kibana} kibana
     * @param {Cache} cache
     * @param {string} [agentConfigId] used to create to enroll a new agent if none are found in cache
     *
     * @returns {Promise<Agent>}
     */
    static async fromCache(kibana, cache, agentConfigId) {}

    /**
     *
     * @param {Kibana} kibana
     * @param {Cache} cache
     */
    constructor(kibana, cache) {
    }


}