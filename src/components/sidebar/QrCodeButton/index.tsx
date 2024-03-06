import dynamic from 'next/dynamic'
import { Suspense, useState, type ReactElement, type ReactNode } from 'react'

const QrModal = dynamic(() => import('./QrModal'))

const QrCodeButton = ({ children }: { children: ReactNode }): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  return (
    <>
      <div data-sid="95763" data-testid="qr-modal-btn" onClick={() => setModalOpen(true)}>
        {children}
      </div>

      {modalOpen && (
        <Suspense>
          <QrModal onClose={() => setModalOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default QrCodeButton
