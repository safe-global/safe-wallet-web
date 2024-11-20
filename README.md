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

currently our app have redux, rtk-query and react devtools support. To run one of them is pretty straightforward, you just need to run the app, and then in the terminal where expo server is runnig, you press `shift + m` and the devtools options will apper for you.
Then select one of them and happy debugging 👨‍💻👩‍💻

## Running the storybook

1. run the storybook command on your terminal

```bash
   npm run storybook
```

2. press `i` for ios or `a` for android

## How to run the e2e tests

We're using DETOX for e2e. Before run the tests script, you shuold first install DETOX by following this steps bellow:

### 1. install DETOX cli:

```bash
npm install detox-cli --global
```

### 2. [MacOS Only] applesimutils

This tool is required by Detox to work with iOS simulators. The recommended way to install applesimutils is via Homebrew:

```bash
brew tap wix/brew
brew install applesimutils
```

### 3. Build the detox configs

for IOS:

```bash
detox build --configuration ios.sim.debug
```

or for Android:

```bash
detox build --configuration android.emu.debug
```

### 4. Run the tests

Since this is a debug configuration, you need to have React Native packager running in parallel before you start Detox tests:

```bash
npx expo start
```

in another terminal, you can run:

for ios:

```bash
detox test --configuration ios.sim.debug
```

or for android:

```bash
detox test --configuration android.emu.debug
```

## Unit tests

We use Jest for running our unit/component/hook tests and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) to manipulate them.

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
