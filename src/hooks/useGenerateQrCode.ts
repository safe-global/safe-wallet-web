import QRCode from 'qrcode'
import useAsync from './useAsync'

const useGenerateQrCode = (text: string): string => {
  const [data] = useAsync(async () => {
    return QRCode.toDataURL(text)
  }, [text])
  return data || ''
}

export default useGenerateQrCode
