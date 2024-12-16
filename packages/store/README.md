# @safe-global/store

This is a utility package that deals with the state management of the application. It uses the [Redux Toolkit](https://redux-toolkit.js.org/) to manage the state of the application.

## Usage

The use the generated API you first need to initialiize the baseURL of the API.

```typescript
import { setBaseUrl } from '@safe-global/store'

setBaseUrl('YOUR_API_BASE_URL')
```

## Automatic code generation from the Client's Gateway OpenAPI

This package includes a script to generate the necessary boilerplate API code from the Client-Gateway(CGW)'s OpenAPI specification using @rtk-query/codegen-openapi.

## Prerequisites

1. You've initialized the monorepo and installed all dependencies.
2. The openapi-config.ts file is correctly configured in this package with your OpenAPI specification details.
3. You've updated the scripts/api-schema/schema.json file with the latest OpenAPI specification.

> [!NOTE]
> To get the latest OpenAPI schema look at the output from the `/api-json` endpoint of the CGW.

## Running the Code Generation Script

From the mono-repo root directory, run the following command:

```bash
yarn workspace @safe-global/store generate-api
```

This will:

- Use the configuration provided in the openapi-config.ts file.
- Gerate the API code using @rtk-query/codegen-openapi.
