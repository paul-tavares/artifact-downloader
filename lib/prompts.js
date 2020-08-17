import prompts from 'prompts'

export const getQuestionList = () => ([
    {
        type: 'text',
        name: 'policyConfig',
        message: 'Endpoint Policy'
    }
]);

/**
 * Prompt user for manifest informatio to download
 * @param {Kibana} kibana
 * @returns {Promise<void>}
 */
export const promptUser = async (kibana) => {
    // get list of enpoint Policies
    const questions = getQuestionList();
    const policies = await kibana.fetchEndpointPolicies();

    return await prompts(questions);
}
