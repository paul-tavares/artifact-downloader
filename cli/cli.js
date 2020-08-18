import minimist from 'minimist'
import {Kibana, promptUser} from "../lib";


const run = async () => {
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


    console.log(userSelections);
};


//==========[ RUN ]=================================
run();