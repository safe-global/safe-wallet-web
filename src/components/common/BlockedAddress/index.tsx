import type { ReactElement } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'
import { shortenAddress } from '@/utils/formatters'
import { useRouter } from 'next/router'
import Disclaimer from '@/components/common/Disclaimer'
import { AppRoutes } from '@/config/routes'

export const BlockedAddress = ({ address }: { address?: string }): ReactElement => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const displayAddress = address && isMobile ? shortenAddress(address) : address
  const router = useRouter()

  const handleAccept = () => {
    router.push({ pathname: AppRoutes.home, query: router.query })
  }

  return (
    <Disclaimer
      title="Blocked Address"
      subtitle={displayAddress}
      content="This signer address is blocked by the Safe interface, due to being associated with the blocked activities by 
      the U.S. Department of Treasury in the Specially Designated Nationals (SDN) list."
      onAccept={handleAccept}
    />
  )
}

export default BlockedAddress
