# artifact-downloader

Download and view Endpoint Security user generated artifacts.

> **NOTE: THIS UTILITY WILL ENROLL AN AGENT WITH FLEET TEMPORARILY IN ORDER TO BE ABLE TO DOWNLOAD THE ARTIFACT. THAT AGENT WILL THEN BE UNENROLLED AFTER THE DOWNLOAD IS COMPLETE**

## Usage

Use `npx` to run the utility with no installation required:

```bash
npx paul-tavares/artifact-downloader
```

or, one of the utilities:

```bash
npx paul-tavares/artifact-downloaded decode-artifact --content="eJyrVkrNKynKTC1WsoqOrQUAJxkFKQ=="
```

By default the tool runs against `localhost` using the default dev credentials. Run the tool with `--help` to get a list
of options available. When setting the `kibana-url` value, ensure that credentials are NOT included in the URL.

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


## Utilities

Different utility scripts can also be used by adding the `-p` option to `npx` and then using the utility name after the repo name.

### `decode-artifact`

```bash
npx -p paul-tavares/artifact-downloader decode-artifact --content="aGVsbG8gd29ybGQ="
```

Decodes the artifact's body, which is normally zipped and based64 encoded


## FAQ

### The current version is only compatible with `master` in Kibana, how can I use it against an older version of Kibana?

Run the tool with `npx` and request a specific version. Example:

```bash
npx paul-tavares/artifact-downloader#1.0.0
```

The above will run `v1.0.0` (a tag in the repo) of the utility. For a list of tagged version
numbers, [see the Releases page in the repo](https://github.com/paul-tavares/artifact-downloader/releases)

A commit hash can also be used, example:

```bash
npx paul-tavares/artifact-downloader#8e8f0e21f
```
