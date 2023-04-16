export const fixtureView = {
  "type": "view",
  "description": [
    "This view is used find (for each env/service in the situation)",
    " the difference in tickets between the master branch and the sha deployed"
  ],
  "usage": [
    "Just add the names of the environments and the services to the situation. For example {'prod', 'uat', 'servicename1', 'servicename2}"
  ],
  "preconditions": [
    "The environments and services need to be in the ontology",
    "The domain and statusendpoint need to be in the reference data",
    "the status endpoint needs a 'gitsha' field"
  ],
  "fetchers": {
    "getRepo": {
      "condition": {
        "{ser:service}": { "git": { "url": "{repoUrl}" } }
      },
      "ifTrue": {
        "type": "instrument",
        "name": "getRepo",
        "params": { "service": "{ser}", "repoUrl": "{repoUrl}" },
        "addTo": "{ser}"
      }
    },
    "findDiffs": {
      "condition": {
        "{env:environment}": {},
        "{ser:service}": { "git": { "directory": "{git}" } }
      },
      "ifTrue": {
        "type": "instrument",
        "name": "findDiffs",
        "params": { "git": "{git}", "tag": "{env}" },
        "addTo": "{env}"
      }
    }
  }
};
