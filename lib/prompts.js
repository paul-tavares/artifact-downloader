import prompts from 'prompts'

/**
 * Prompt user for manifest informatio to download
 * @param {Kibana} kibana
 * @returns {Promise<{
 *     policy: {
 *         id: string,
 *         name: string,
 *         version: string,
 *         description: string,
 *         config_id: string,
 *         inputs: [
 *             {
 *                  config: {
 *                      artifact_manifest: {
 *                          value: {}
 *                      }
 *                  }
 *             }
 *         ]
 *     },
 *     manifest: {
 *          name: string,
 *          value: {
 *              encryption_algorithm: string,
 *              decoded_size: number,
 *              encoded_sha256: string,
 *              encoced_size: number,
 *              relative_url: string,
 *              compression_algorithm: string
 *
 *          }
 *     }
 * } | {}>}
 */
export const promptUser = async (kibana) => {
    const questions = [
        {
            name: 'policy',
            message: 'Select Endpoint Policy',
            type: 'select',
            choices: (await kibana.fetchEndpointPolicies())
                .items
                .map(policy => ({
                    title: policy.name,
                    value: policy,
                    description: policy.description,
                })),
            initial: 0
        },
        {
            name: 'manifest',
            message: 'Select Manifest',
            type: 'select',
            choices(prevAnswer) {
                const manifests = []
                for (const [title, value] of Object.entries(prevAnswer.inputs[0].config.artifact_manifest.value.artifacts)) {
                    manifests.push({
                        title,
                        value: {
                            name: title,
                            value
                        },
                    })
                }
                return manifests;
            },
            initial: 0
        }
    ];

    // If no policies exist, exit
    if (questions[0].choices.length === 0) {
        return {};
    }

    return await prompts(questions);
}