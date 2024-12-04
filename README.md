# Safe Mobile App 👋

## Setup the project

1. install the npm dependencies

```bash
npm install
```

2. run expo install to make sure no package is missing

```bash
npx expo install
```

## Running the App

```bash
   npx expo run:ios --device
```

or for android

```bash
   npx expo run:android --device
```

### How to open custom devtools menu

currently our app have redux, rtk-query and react devtools support. To run one of them is pretty straightforward, you
just need to run the app, and then in the terminal where expo server is runnig, you press `shift + m` and the devtools
options will apper for you.
Then select one of them and happy debugging 👨‍💻👩‍💻

## Running the storybook

1. run the storybook command on your terminal

```bash
   npm run storybook
```

2. press `i` for ios or `a` for android

## How to run the e2e tests

We're using [Maestro](https://maestro.mobile.dev/) for e2e. Before run the tests you should install Maestro according to
the documentation steps for your OS.

### How to run a dev build and e2e tests

To build the dev version of the app for tests, depending on the platform
you are building for, you can run either:

```bash
npm run e2e:metro-ios
```

or

```bash
npm run e2e:metro-android
```

This commands will build the app for e2e tests - the difference to a normal dev/production build is that files ending
with `.e2e.ts|.e2e.tsx` will be included in the build and they take precedence over the normal files. This is useful to 
mock some services or to add some test specific code.

in a second terminal run the e2e tests:

```bash
npm run e2e:run
```

### Use maestro studio to write tests

You can use maestro studio to write tests, to do that you can run the following command:

```bash
maestro studio
```

Once the tests are written you can export the yaml to the e2e folder and run the new flow together with the other tests.

### Run the e2e tests in CI
To run the tests in CI you can add the `eas-build-ios:build-and-maestro-test` label to a PR and the tests will run in 
Expo CI.

## Unit tests

We use Jest for running our unit/component/hook tests
and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) to manipulate them.

To run the tests you can just type in your terminal:

```bash
npm run test
```

#### Running in watch mode

```bash
npm run test:watch
```

#### checking the coverage

```bash
npm run test
```

navigate inside the coverage folder and open the index.html file in your browser

## Running Eslint & Prettier

This project uses eslint + prettier + tsconfig. To run lint you can paste the following command on your terminal:

```bash
npm run lint
```

this will not only validate the files with tslint, but also validate them with eslint and prettier configs.
