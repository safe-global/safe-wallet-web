import { useRef } from 'react'
import type { ReactElement } from 'react'

import Popup from '../Popup'
import Icon from './Icon'
import { WalletConnectErrorMessage } from '../SessionManager/ErrorMessage'

export const ErrorFalllback = ({
  onOpen,
  onClose,
  open,
  error,
}: {
  onOpen: () => void
  onClose: () => void
  open: boolean
  error: Error
}): ReactElement => {
  const iconRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={iconRef}>
        <Icon onClick={onOpen} sessionCount={0} error />
      </div>

      <Popup anchorEl={iconRef.current} open={open} onClose={onClose}>
        <WalletConnectErrorMessage error={error} />
      </Popup>
    </>
  )
}
