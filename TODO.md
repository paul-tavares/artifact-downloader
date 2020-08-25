# TODO

- [ ] Cache Agent Access API keys so that we don't keep creating new agents
- [ ] `kibana.request()` should be refactored to return the value of the `await response.json()` instead of having that done on every use of it.
- [ ] Rename `manifest` property returned from `prompts` to `artifact` (its the artifact selected by the user)



______


## Design Notes:

Notes from @madirey on the process:

https://gist.github.com/madirey/b86073bb86e86e4fe1e1caabb29349f5

## Usage:
```
artifact-download
    --kibana-url=url_here
    --kibana-user=elastic
    --kibana-password=changeme
``` 

### If no params are used

1.  prompt user for endpoint package config
    Fetch all endpoint related package_configs, and present the user with a list to pick from
    
2.  Display all artificats available from the selected package config, have have user pick one

2. Output the artifact to STDOUT
