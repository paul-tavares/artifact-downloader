# TODO

## BUGS

- [ ] Strip out any trailing forward-slash from the `kibana-url` param (will cause an error)


## TASKS
- [ ] Cache Agent Access API keys so that we don't keep creating new agents
- [ ] `kibana.request()` should be refactored to return the value of the `await response.json()` instead of having that done on every use of it.
- [ ] Rename `manifest` property returned from `prompts` to `artifact` (its the artifact selected by the user)


