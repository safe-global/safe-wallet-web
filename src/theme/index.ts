import { ColorSchemeName } from "react-native";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import merge from "deepmerge";

const createSafeTheme = (colorScheme: ColorSchemeName) => {
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  // TODO: MD3LightTheme and MD3DarkTheme
  //  will be replaced when we're going to work in the views
  const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
  const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

  return colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;
};

export default createSafeTheme;
