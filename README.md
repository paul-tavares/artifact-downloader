# artifact-downloader
Download and view Endpoint Security user generated artifacts



______


# Design Notes:

Notes from @madirey on the process:

https://gist.github.com/madirey/b86073bb86e86e4fe1e1caabb29349f5

## Usage:
```
artifact-download
    --package-config=UUID_HERE
    --artifact=artifact_name_here
    --kibana-url=url_here
    --kibana-user=elastic
    --kibana-password=changeme
``` 

### If no params are used

1.  prompt user for endpoint package config
    Fetch all endpoint related package_configs, and present the user with a list to pick from
    
2.  Display all artificats available from the selected package config, have have user pick one

2. Output the artifact to STDOUT
