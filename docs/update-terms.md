# How to update Terms & Conditions

To update the terms and conditions, follow these steps:

1. Export the terms and conditions from Google Docs as a Markdown file.
2. Replace the content of the src/markdown/terms/terms.md file with the exported content.
3. Update the frontmatter of the file with the new version number and date.

That’s it!

The updated terms and conditions will be displayed in the app with the correct version number and date. A popup banner
will automatically appear for users who haven’t accepted the new terms.

## How does this work?

We rely on the version number from the frontmatter. When the Redux store is rehydrated, we check the version stored in
the store against the version in the frontmatter. If they differ, we reset the accepted terms, forcing the user to
accept the new version.

The Markdown file is automatically converted to HTML and displayed in the app. Note that because the Markdown was
generated
from Google Docs, we require the remark-heading-id plugin. Additionally, since Google Docs uses {# ...} syntax, it will
fail in an MDX file.

For Cypress, we follow a similar process. We read the version from the frontmatter and pass it as an environment
variable.

For Jest tests, we mock the file and read the version from the mock.
