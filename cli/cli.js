import minimist from 'minimist'
import {Kibana, promptUser} from "../lib";
import {red} from 'kleur'; // reuse from prompts

const run = async () => {
    console.log(`
${getHeader()}

    ${red().bold('WARNING:')}    USE OF THIS UTILITY WILL CREATE A FLEET AGENT.
                FOR DEVELOPMENT AND TESTING PURPOSES ONLY!

`);

    const runOptions = minimist(process.argv.slice(2), {
        default: {
            'kibana-url': 'http://localhost:5601',
            'kibana-user': 'elastic',
            'kibana-password': 'changeme'
        },
        alias: {
            'kibana-url': 'kibanaUrl',
            'kibana-user': 'kibanaUser',
            'kibana-password': 'kibanaPassword'
        }
    });

    const kibana = new Kibana(runOptions);
    const userSelections = await promptUser(kibana);

    if (!userSelections.policy) {
        console.warn(`No Endpoint Policies found in Ingest`);
        console.info(`Go to here to add some: ${runOptions.kibanaUrl}/app/ingestManager#/configs`);
        return;
    }

    const agentAccessKey = await kibana.getAnyFleetAgent(userSelections.policy.config_id);
    const artifactJson = await kibana.downloadArtifact(
        agentAccessKey.access_api_key,
        userSelections.manifest.value.relative_url
    );
    console.log(`
    
Policy: ${userSelections.policy.name}
Artifact: ${userSelections.manifest.name}
${getSeparator()}

${JSON.stringify(artifactJson, null, 2)}

${getSeparator()}
`)
};

const getSeparator = () => '-------------------------------------------------------------------';

const getHeader = () => '-[ ENDPOINT KIBANA ARTIFACT DOWNLOADER ]---------------------------';

//==========[ RUN ]=================================
run();
