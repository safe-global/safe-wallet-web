import { styled, Text, View } from 'tamagui'

export const StyledTransactionsTabs = styled(View, {
  flexDirection: 'row',
  gap: 24,
})

export const StyledTransactionTabItem = styled(View, {
  paddingBottom: 10,
  variants: {
    selected: {
      true: {
        borderBottomColor: '$primary',
        borderBottomWidth: 3,
      },
    },
  },
})

export const StyledTransactionTabText = styled(Text, {
  variants: {
    selected: {
      true: {
        color: '$primary',
        fontWeight: 600,
        fontSize: '$5',
      },
      false: {
        color: '$colorSecondary',
        fontWeight: 600,
        fontSize: '$5',
      },
    },
  } as const,
})
