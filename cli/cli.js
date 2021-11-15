import minimist from 'minimist'
import {Kibana, promptUser} from "../lib";
import {red, bold} from 'kleur'; // reuse from prompts
import packageJson from '../package.json';
import {getHelp, getVersion} from "./utils";

const COMMAND_NAME = packageJson.name;

const cliOptions = {
  default: {
    'kibana-url': 'http://localhost:5601',
    'kibana-user': 'elastic',
    'kibana-password': 'changeme'
  },
  alias: {
    'kibana-url': 'kibanaUrl',
    'kibana-user': 'kibanaUser',
    'kibana-password': 'kibanaPassword',
    'h': 'help',
    'v': 'version'
  },
  boolean: ['help', 'h', 'version', 'v']
};

const run = async () => {
  const runOptions = minimist(process.argv.slice(2), cliOptions);

  if (runOptions.help) {
    console.log(getHelp(COMMAND_NAME, cliOptions));
    process.exit(0);
  }

  if (runOptions.version) {
    console.log(getVersion(COMMAND_NAME));
    process.exit(0);
  }

  console.log(`
${getHeader()}
${red(`
  ${bold('WARNING!')}  USE OF THIS UTILITY WILL CREATE A FLEET AGENT.
            FOR DEVELOPMENT AND TESTING PURPOSES ONLY!`)}
`);

  const kibana = new Kibana(runOptions);
  const userSelections = await promptUser(kibana);

  if (!userSelections.policy) {
    console.warn(`No Endpoint Policies found in Fleet`);
    console.info(`Go to here to add some: ${runOptions.kibanaUrl}/app/fleet#/policies`);
    return;
  }

  const artifactJson = await kibana.downloadArtifact(
    userSelections.manifest.value.relative_url
  );
  const manifest = userSelections.policy.inputs[0].config.artifact_manifest.value;
  const artifact = userSelections.manifest.value;

  console.log(`
${getSeparator()}
Policy:   ${userSelections.policy.name}
Manifest: ${manifest.manifest_version} | ${manifest.schema_version}
Artifact: ${userSelections.manifest.name}
          Relative URL:   ${artifact.relative_url}
          Encoded SHA256: ${artifact.encoded_sha256}
          Decoded SHA256: ${artifact.decoded_sha256}
${getSeparator()}

${JSON.stringify(artifactJson, null, 2)}

${getSeparator()}
`)
};

const getSeparator = () => '-------------------------------------------------------------------';

const getHeader = () => `-[ ENDPOINT KIBANA ARTIFACT DOWNLOADER v${packageJson.version} ]-------------------`;

//==========[ RUN ]=================================
run();
