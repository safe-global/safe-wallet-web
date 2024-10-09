import { Theme, YStack, YStackProps } from 'tamagui'

export const Container = (props: YStackProps) => {
  const { children, ...rest } = props
  return (
    <Theme name={'container'}>
      <YStack
        backgroundColor="$background"
        borderRadius={'$2'}
        paddingHorizontal={'$4'}
        paddingVertical={'$1'}
        {...rest}
      >
        {children}
      </YStack>
    </Theme>
  )
}
