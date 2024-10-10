# Safe Mobile App 👋

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## How to run the e2e tests

We're using DETOX for e2e. Before run the tests script, you shuold first install DETOX by following this steps bellow:

### 1. install DETOX cli:

```sh
npm install detox-cli --global
```

### 2. [MacOS Only] applesimutils

This tool is required by Detox to work with iOS simulators. The recommended way to install applesimutils is via Homebrew:

```sh
brew tap wix/brew
brew install applesimutils
```

### 3. Build the detox configs

for IOS:

```sh
detox build --configuration ios.sim.debug
```

or for Android:

```sh
detox build --configuration android.emu.debug
```

### 4. Run the tests

Since this is a debug configuration, you need to have React Native packager running in parallel before you start Detox tests:

```sh
npx expo start
```

in another terminal, you can run:

for ios:

```sh
detox test --configuration ios.sim.debug
```

or for android:

```sh
detox test --configuration android.emu.debug
```
