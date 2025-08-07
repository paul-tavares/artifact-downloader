import packageJson from "../package.json" with { type: 'json' };

export const getHelp = (commandName, cliOptions) => {
  const optionKeys = Object.keys(cliOptions.default || {});
  return (`
${commandName} [options]

Options:
${optionKeys.map(opt => `    --${opt}`).join("\n")}
`)
};

export const getVersion = (commandName = packageJson.name) => {
  return `${commandName} ${packageJson.version}`;
}
