#!/bin/bash

# Only:
# - Tagged commits
# - Security env variables are available.
if [ -n "$VERSION_TAG" ] && [ -n "$AWS_ACCESS_KEY_ID" ]
then
  # Only alphanumeric characters. Example v1.0.0 -> v100
  VERSION_TAG_ALPHANUMERIC=$(echo $VERSION_TAG | sed 's/[^a-zA-Z0-9]//g')

  REVIEW_RELEASE_FOLDER="$REPO_NAME_ALPHANUMERIC/$VERSION_TAG_ALPHANUMERIC"

  # Deploy safe-team release project
  aws s3 sync build s3://${REVIEW_BUCKET_NAME}/${REVIEW_RELEASE_FOLDER}/app --delete --exclude "*.html" --exclude "/page-data" --cache-control max-age=31536000,public

  aws s3 sync build s3://${REVIEW_BUCKET_NAME}/${REVIEW_RELEASE_FOLDER}/app --delete --exclude "*" --include "*.html" --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html
fi
