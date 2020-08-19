import minimist from 'minimist'
import {Kibana, promptUser} from "../lib";


const run = async () => {
    console.log(getHeader());

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
        return;
    }

    const agentAccessKey = await kibana.getAnyFleetAgentAccessApiKey(userSelections.policy.config_id);

    console.log(userSelections);
};

const getHeader = () => {
    return `-[ ENDPOINT KIBANA ARTIFACT DOWNLOADER ]---------------------------`;
}

//==========[ RUN ]=================================
run();
