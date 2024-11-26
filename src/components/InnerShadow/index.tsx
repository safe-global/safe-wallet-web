import { styled, View } from 'tamagui'

const InnerShadow = styled(View, {
  position: 'absolute',
  bottom: 0,
  height: 10,
  left: 0,
  width: '100%',
  backgroundColor: '$background',
  shadowColor: '$background',
  shadowOffset: { width: -2, height: -4 },
  shadowRadius: 4,
  shadowOpacity: 1,
})

export default InnerShadow
