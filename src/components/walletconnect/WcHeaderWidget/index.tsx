import { type ReactNode, useRef } from 'react'
import type { SessionTypes } from '@walletconnect/types'
import Popup from '@/components/common/Popup'
import WcIcon from './WcIcon'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'

type WcHeaderWidgetProps = {
  children: ReactNode
  sessions: SessionTypes.Struct[]
  isError: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const TOOLTIP_TEXT = 'Connect Safe{Wallet} to any dApp with WalletConnect'
const TOOLTIP_ID = 'native_wc_onboarding'

const WcHeaderWidget = ({ sessions, ...props }: WcHeaderWidgetProps) => {
  const iconRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <OnboardingTooltip text={TOOLTIP_TEXT} widgetLocalStorageId={TOOLTIP_ID}>
        <div ref={iconRef}>
          <WcIcon
            onClick={props.onOpen}
            sessionCount={sessions.length}
            sessionIcon={sessions[0]?.peer.metadata.icons[0]}
            isError={props.isError}
          />
        </div>
      </OnboardingTooltip>

      <Popup keepMounted anchorEl={iconRef.current} open={props.isOpen} onClose={props.onClose}>
        {props.children}
      </Popup>
    </>
  )
}

export default WcHeaderWidget
