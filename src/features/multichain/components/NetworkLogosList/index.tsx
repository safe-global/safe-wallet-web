import ChainIndicator from '@/components/common/ChainIndicator'
import { Box } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

const NetworkLogosList = ({ networks }: { networks: ChainInfo[] }) => {
  return (
    <Box className={css.networks}>
      {networks.map((chain) => (
        <ChainIndicator key={chain.chainId} chainId={chain.chainId} onlyLogo inline />
      ))}
    </Box>
  )
}

export default NetworkLogosList
