import minimist from 'minimist'
import {getHelp, getVersion} from "./utils";
import {decodeArtifactContent} from "../lib/decode_artifact_content";

const COMMAND_NAME = 'decode-artifact'

const cliOptions = {
  string: ['content'],
  boolean: ['help', 'version'],
  alias: {
    c: 'content',
    h: 'help',
    v: 'version'
  }
};

const runDecodeArtifact = async () => {
  const runOptions = minimist(process.argv.slice(2), cliOptions);

  if (runOptions.help) {
    console.log(getHelp(COMMAND_NAME, cliOptions));
    process.exit(0);
  }

  if (runOptions.version) {
    console.log(getVersion(COMMAND_NAME));
    process.exit(0);
  }

  if (!runOptions.content) {
    console.error('[ERROR] No content provided to the `--content` option');
    process.exit(1);
    return;
  }

  console.log(JSON.stringify(await decodeArtifactContent(runOptions.content), null, 2));
}


//==========[ RUN ]=================================
runDecodeArtifact();
