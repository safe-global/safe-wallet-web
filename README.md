# <img src="https://user-images.githubusercontent.com/381895/186411381-e05075ff-7565-4b4e-925e-bb1e85cb165b.png" height="60" width="60" valign="middle" /> Safe Web Core

[![GitHub license](https://img.shields.io/github/license/safe-global/web-core)](https://github.com/safe-global/web-core/blob/main/LICENSE.md)
![Tests](https://img.shields.io/github/actions/workflow/status/safe-global/web-core/test.yml?branch=main&label=tests)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/safe-global/web-core)
[![GitPOAP Badge](https://public-api.gitpoap.io/v1/repo/safe-global/web-core/badge)](https://www.gitpoap.io/gh/safe-global/web-core)

The default Safe web interface.

## Contributing

Contributions, be it a bug report or a pull request, are very welcome. Please check our [contribution guidelines](CONTRIBUTING.md) beforehand.

## Getting started with local development

Install the dependencies:

```bash
yarn
```

Create a `.env` file with the environment variables. You can use the `.env.example` file as a reference.

Run the development server:

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Lint

ESLint:
```
yarn lint --fix
```

Prettier:
```
yarn prettier
```

## Tests

Unit tests:
```
yarn test --watch
```

### Cypress tests
Build and generarate a static site:
```
yarn build && yarn export
```

Serve the static files:
```
yarn serve
```

Launch the Cypress UI:
```
yarn cypress:open
```

You can then choose which e2e tests to run.

## Component template
To create a new component from a template:
```
yarn cmp MyNewComponent
```

## Frameworks
 * Next.js
 * React
 * Redux
 * MUI
 * ethers.js
 * web3-onboard
 * [Safe Core SDK](https://github.com/safe-global/safe-core-sdk)
 * [Gateway SDK](https://github.com/safe-global/safe-react-gateway-sdk)
