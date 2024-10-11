import { Image, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/src/components/ParallaxScrollView";
import { Button, Text } from "react-native-paper";
import styled from "@emotion/native";

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.colors?.primary};
`;

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.titleContainer}>
        <Text variant="titleLarge" testID="welcome-title">
          Welcome!
        </Text>

        <Button icon="camera">Press me</Button>
      </View>

      <StyledText>Here is my styled component</StyledText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
