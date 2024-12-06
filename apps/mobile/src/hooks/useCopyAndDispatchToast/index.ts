import { useToastController } from '@tamagui/toast'
import Clipboard from '@react-native-clipboard/clipboard'

export const useCopyAndDispatchToast = () => {
  const toast = useToastController()
  return (value: string) => {
    Clipboard.setString(value)
    toast.show('Address copied.', {
      native: false,
      duration: 2000,
    })
  }
}
