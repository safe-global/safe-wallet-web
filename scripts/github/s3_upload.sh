#!/bin/bash

set -ev

cd out

# First, upload new files w/o deleting the old ones
aws s3 sync . $BUCKET --exclude "*.html"

# Second, upload them again but delete the old files this time
# This allows for a no-downtime deployment
aws s3 sync . $BUCKET --delete --exclude "*.html"

# Finally, upload HTML files but w/o an extention so that URLs like /welcome open the right file
for file in $(find . -name '*.html' | sed 's|^\./||'); do
    aws s3 cp ${file%} $BUCKET/${file%.*} --content-type "text/html"
done

cd -
