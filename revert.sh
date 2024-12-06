#!/bin/bash

# Run `git diff` and parse the changed files
echo "Fetching changed files..."
changed_files=$(git diff --name-only)

# Loop through each changed file
for file in $changed_files; do
  echo "Processing file: $file"

  # Check if the file exists in the working directory
  if [[ -f "$file" ]]; then
    # Extract added/removed lines (lines starting with + or -)
    diff_changes=$(git diff "$file" | grep -E '^\+|^\-')

    # Check if the changes include invalid components (any letter except B and T)
    invalid_changes=$(echo "$diff_changes" | grep -E '^\+.*<[^BT]|^\-.*<[^BT]')
    valid_changes=$(echo "$diff_changes" | grep -E '^\+.*<(B|T)|^\-.*<(B|T)')

    # Revert file if it contains invalid changes
    if [[ -n "$invalid_changes" ]]; then
      echo "Reverting changes in: $file (contains invalid components)"
      git checkout -- "$file"
    else
      echo "Keeping changes in: $file (only modifies <B* or <T*)"
    fi
  else
    echo "File does not exist in working directory: $file"
  fi
done

echo "Done processing changes."