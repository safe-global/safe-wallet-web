#!/bin/bash

set -ev

if [[ -n $CHECKSUM_FILE ]]; then
  cp ./$CHECKSUM_FILE ./out/$CHECKSUM_FILE
fi

cd out

# First, upload the new files w/o deleting the old ones
aws s3 sync . $BUCKET

# Second, upload them again but delete the old files this time
# This allows for a no-downtime deployment
aws s3 sync . $BUCKET --delete

# Finally, upload all HTML files again but w/o an extention so that URLs like /welcome open the right page
for file in $(find . -name '*.html' | sed 's|^\./||'); do
    aws s3 cp ${file%} $BUCKET/${file%.*} --content-type 'text/html'
done

cd -
