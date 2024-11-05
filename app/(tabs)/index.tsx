import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, View } from 'react-native'

import ParallaxScrollView from '@/src/components/ParallaxScrollView'
import { Text } from 'tamagui'

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}
    >
      <View style={styles.titleContainer}>
        <Text testID="explore-title">HomeScreen</Text>
      </View>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
})
