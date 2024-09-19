import type { ReactElement } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'
import { shortenAddress } from '@/utils/formatters'
import { useRouter } from 'next/router'
import Disclaimer from '@/components/common/Disclaimer'
import { AppRoutes } from '@/config/routes'

export const BlockedAddress = ({ address, featureTitle }: { address: string; featureTitle: string }): ReactElement => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const displayAddress = address && isMobile ? shortenAddress(address) : address
  const router = useRouter()

  const handleAccept = () => {
    router.push({ pathname: AppRoutes.home, query: router.query })
  }

  return (
    <Disclaimer
      title="Blocked address"
      subtitle={displayAddress}
      content={`The above address is part of the OFAC SDN list and the ${featureTitle} is unavailable for sanctioned addresses.`}
      onAccept={handleAccept}
    />
  )
}

export default BlockedAddress
