import { styled, Theme, YStack, YStackProps } from 'tamagui'

const StyledYStack = styled(YStack, {
  variants: {
    bordered: {
      true: {
        borderColor: '#303033',
        borderWidth: 1,
      },
      false: {
        backgroundColor: '$background',
      },
    },
  } as const,
})

export const Container = (props: YStackProps & { bordered?: boolean }) => {
  const { children, bordered, ...rest } = props
  return (
    <Theme name={'container'}>
      <StyledYStack bordered={!!bordered} borderRadius={'$3'} paddingHorizontal={'$4'} paddingVertical={'$4'} {...rest}>
        {children}
      </StyledYStack>
    </Theme>
  )
}
