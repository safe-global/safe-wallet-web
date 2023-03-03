#!/bin/bash

set -ev

# Only:
# - Tagged commits
# - Security env variables are available.
if [ -n "$VERSION_TAG" ] && [ -n "$PROD_DEPLOYMENT_HOOK_TOKEN" ] && [ -n "$PROD_DEPLOYMENT_HOOK_URL" ]
then
  curl --silent --output /dev/null --write-out "%{http_code}" -X POST \
     -F token="$PROD_DEPLOYMENT_HOOK_TOKEN" \
     -F ref=master \
     -F "variables[TRIGGER_RELEASE_COMMIT_TAG]=$VERSION_TAG" \
      $PROD_DEPLOYMENT_HOOK_URL
else
  echo "⚠︎ Production deployment could not be prepared"
fi
