# TODO

- [x] Delete Agent after use of access_api_key
- [ ] Add kibana version compatibility checks (if run against a version of kibana tool does not support, output warning)
- [ ] Cache Agent Access API keys so that we don't keep creating new agents
- [ ] `kibana.request()` should be refactored to return the value of the `await response.json()` instead of having that
  done on every use of it.
- [ ] Rename `manifest` property returned from `prompts` to `artifact` (its the artifact selected by the user)


