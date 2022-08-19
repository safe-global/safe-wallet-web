# Local storage migration
This service is for migrating locally stored user data from the old safe-react app to web-core (the new app).

## What we migrate
We migrate the Address Book and Added Safes.
It can be potentially extended to more pieces of stored data, as each piece is a separate module.

## How it works
The new app will be deployed on a new domain, so we have to use an iframe + [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

Here's how we do it.

#### On safe-react's side:

 * safe-react exposes a special public HTML file named `migrate.html`
 * this file is listening to window messages
 * it ignores anything that is not on a trusted domain list that includes only web-core domains
 * if the sender domain is in the trusted list, safe-react sends back the entire contents of the local storage (LS)

#### On web-core's side:

 * it checks if a migration has already been performed by reading a flag in the LS
 * if it hasn't been done, it tries to migrate
 * it loads `migrate.html` from safe-react in an iframe (e.g. on prod it loads `https://gnosis-safe.io/app/migrate.html`)
 * it listens to messages from the iframe and only trusts the safe-react domain
 * it posts a message to the iframe window saying `ready`, so that the iframe knows where to send the data
 * when web-core receives the LS data, it transforms it to a new format
 * it dispatches parts of the data to corresponding Redux slices
