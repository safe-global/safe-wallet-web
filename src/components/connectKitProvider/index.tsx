import { options } from '@/components/connectKitProvider/config'
import { ModalProvider } from '@particle-network/connectkit'
import '@particle-network/connectkit/dist/index.css'

export default function ConnectKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider
      options={{
        ...options,
      }}
      theme="light"
    >
      {children}
    </ModalProvider>
  )
}
