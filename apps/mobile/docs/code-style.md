# Code style guidelines

## Code structure

### General components

- Components that are used across multiple features should reside in the `src/components/` folder.
- Each component should have its own folder, structured as follows:
  ```
  Alert/
  - Alert.tsx
  - Alert.test.tsx
  - Alert.stories.tsx
  - index.tsx
  ```
- The main component implementation should be in a named file (e.g., `Alert.tsx`), and `index.tsx` should only be used
  for exporting the component.
- **Reason**: Using `index.tsx` allows for cleaner imports, e.g.,
  ```
  import { Alert } from 'src/components/Alert';
  ```
  instead of:
  ```
  import { Alert } from 'src/components/Alert/Alert';
  ```

### Exporting components

- **Always prefer named exports over default exports.**
  - Named exports make it easier to refactor and identify exports in a codebase.

### Features and screens

- Feature-specific components and screens should be implemented inside the `src/features/` folder.

#### Example: feature file structure

For a feature called **Assets**, the file structure might look like this:

```
// src/features/Assets
- Assets.container.tsx
- index.tsx
```

- `index.tsx` should only export the **Assets** component/container.

#### Subcomponents for features

- If a feature depends on multiple subcomponents unique to that feature, place them in a `components` subfolder. For
  example:

```
// src/features/Assets/components/AssetHeader
- AssetHeader.tsx
- AssetHeader.container.tsx
- index.tsx
```

### Presentation vs. container components

- **Presentation Components**:

  - Responsible only for rendering the UI.
  - Receive data and callbacks via props.
  - Avoid direct manipulation of business logic.
  - Simple business logic can be included but should generally be extracted into hooks.

- **Container Components**:
  - Handle business logic (e.g., state management, API calls, etc.).
  - Pass necessary data and callbacks to the corresponding Presentation component.

### Commit message guidelines

We follow the Semantic [https://www.conventionalcommits.org/en/v1.0.0/](Commit Messages convention).

#### Format

Each commit message should consist of a header, an optional body, and an optional footer. The header has a specific
format that includes a type, an optional scope, and a subject:

```
<type>(<scope>): <subject>
```

**Types**

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit
