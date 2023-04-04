# <img src="https://user-images.githubusercontent.com/381895/186411381-e05075ff-7565-4b4e-925e-bb1e85cb165b.png" height="60" width="60" valign="middle" /> Safe Web Core

[![License](https://img.shields.io/github/license/safe-global/web-core)](https://github.com/safe-global/web-core/blob/main/LICENSE)
![Tests](https://img.shields.io/github/actions/workflow/status/safe-global/web-core/test.yml?branch=main&label=tests)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/safe-global/web-core)
[![GitPOAP Badge](https://public-api.gitpoap.io/v1/repo/safe-global/web-core/badge)](https://www.gitpoap.io/gh/safe-global/web-core)

The default Safe web interface.

## Contributing

Contributions, be it a bug report or a pull request, are very welcome. Please check our [contribution guidelines](CONTRIBUTING.md) beforehand.

## Getting started with local development

### Environment variables

Create a `.env` file with environment variables. You can use the `.env.example` file as a reference.

Here's the list of all the required and optional variables:

| Env variable                                           |              | Description                                                                                                                         |
| ------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_IS_PRODUCTION`                            | optional     | Set to `true` to build a minified production app                                                                                    |
| `NEXT_PUBLIC_GATEWAY_URL_PRODUCTION`                   | optional     | The base URL for the [Safe Client Gateway](https://github.com/safe-global/safe-client-gateway)                                      |
| `NEXT_PUBLIC_GATEWAY_URL_STAGING`                      | optional     | The base CGW URL on staging                                                                                                         |
| `NEXT_PUBLIC_SAFE_VERSION`                             | optional     | The latest version of the Safe contract, defaults to 1.3.0                                                                          |
| `NEXT_PUBLIC_INFURA_TOKEN`                             | **required** | [Infura](https://docs.infura.io/infura/networks/ethereum/how-to/secure-a-project/project-id) RPC API token                          |
| `NEXT_PUBLIC_SAFE_APPS_INFURA_TOKEN`                   | optional     | Infura token for Safe Apps, falls back to `NEXT_PUBLIC_INFURA_TOKEN`                                                                |
| `NEXT_PUBLIC_WC_BRIDGE`                                | optional     | [WalletConnect](https://docs.walletconnect.com/1.0/bridge-server) bridge URL, falls back to the public WC bridge                    |
| `NEXT_PUBLIC_TENDERLY_ORG_NAME`                        | optional     | [Tenderly](https://tenderly.co) org name for Transaction Simulation                                                                 |
| `NEXT_PUBLIC_TENDERLY_PROJECT_NAME`                    | optional     | Tenderly project name                                                                                                               |
| `NEXT_PUBLIC_TENDERLY_SIMULATE_ENDPOINT_URL`           | optional     | Tenderly simulation URL                                                                                                             |
| `NEXT_PUBLIC_BEAMER_ID`                                | optional     | [Beamer](https://www.getbeamer.com) is a news feed for in-app announcements                                                         |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`                    | optional     | [GTM](https://tagmanager.google.com) project id                                                                                     |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH`      | optional     | Dev GTM key                                                                                                                         |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_LATEST_AUTH`           | optional     | Preview GTM key                                                                                                                     |
| `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_LIVE_AUTH`             | optional     | Production GTM key                                                                                                                  |
| `NEXT_PUBLIC_SENTRY_DSN`                               | optional     | [Sentry](https://sentry.io) id for tracking runtime errors                                                                          |
| `NEXT_PUBLIC_SAFE_GELATO_RELAY_SERVICE_URL_PRODUCTION` | optional     | [Safe Gelato Relay Service](https://github.com/safe-global/safe-gelato-relay-service) URL to allow relaying transactions via Gelato |
| `NEXT_PUBLIC_SAFE_GELATO_RELAY_SERVICE_URL_STAGING`    | optional     | Relay URL on staging                                                                                                                |

If you don't provide some of the optional vars, the corresponding features will be disabled in the UI.

### Running the app locally

Install the dependencies:

```bash
yarn
```

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

- [Safe Core SDK](https://github.com/safe-global/safe-core-sdk)
- [Safe Gateway SDK](https://github.com/safe-global/safe-gateway-typescript-sdk)
- Next.js
- React
- Redux
- MUI
- ethers.js
- web3-onboard
