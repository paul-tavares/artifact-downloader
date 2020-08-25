# artifact-downloader
Download and view Endpoint Security user generated artifacts

## Usage

Use `npx` to run the utility with no installation required:

```bash
npx paul-tavares/artifact-downloader
```

By default the tool runs against `localstorage` using the default dev credentials. Run the tool with `--help` to get a list of options available. When setting the `kibana-url` value, ensure that credentials are NOT included in the URL.

## Install

Install globally and use the registered `artifact-downloader` executable

```bash
npm i -g paul-tavares/artifact-downloader
```

Run it:

```bash
artifact-downloader
```

## Uninstall

Uninstall it from the global space:

```bash
npm uninstall -g artifact-downloader
```
