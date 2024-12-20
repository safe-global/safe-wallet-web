import { Text, View, YStack } from 'tamagui'

export type CarouselItem = {
  title: string | React.ReactNode
  name: string
  description?: string
  image?: React.ReactNode
}

interface CarouselItemProps {
  item: CarouselItem
}

export const CarouselItem = ({ item: { title, description, image } }: CarouselItemProps) => {
  return (
    <View gap="$8" alignItems="center" justifyContent="center">
      {image}

      <YStack gap="$8" paddingHorizontal="$5">
        <YStack>{title}</YStack>

        <Text textAlign="center" fontSize={'$4'}>
          {description}
        </Text>
      </YStack>
    </View>
  )
}
