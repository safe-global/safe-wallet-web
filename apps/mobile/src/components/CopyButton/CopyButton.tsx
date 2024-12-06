import { Button, TextProps } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { useCopyAndDispatchToast } from '@/src/hooks/useCopyAndDispatchToast'

export const CopyButton = ({ value, color }: { value: string; color: TextProps['color'] }) => {
  const copyAndDispatchToast = useCopyAndDispatchToast()
  return (
    <Button
      onPress={() => {
        copyAndDispatchToast(value)
      }}
      height={20}
      backgroundColor={'transparent'}
    >
      <SafeFontIcon name={'copy'} size={13} color={color as string} />
    </Button>
  )
}
