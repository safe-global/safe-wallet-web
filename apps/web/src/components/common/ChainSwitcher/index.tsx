import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import { Button, CircularProgress, Typography } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard from '@/hooks/wallets/useOnboard'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'

const ChainSwitcher = ({
  fullWidth,
  primaryCta = false,
}: {
  fullWidth?: boolean
  primaryCta?: boolean
}): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()
  const [loading, setIsLoading] = useState<boolean>(false)

  const handleChainSwitch = useCallback(async () => {
    if (!onboard || !chain) return
    setIsLoading(true)
    await switchWalletChain(onboard, chain.chainId)
    setIsLoading(false)
  }, [chain, onboard])

  if (!isWrongChain) return null

  return (
    <Button
      onClick={handleChainSwitch}
      variant={primaryCta ? 'contained' : 'outlined'}
      sx={{ minWidth: '200px' }}
      size={primaryCta ? 'medium' : 'small'}
      fullWidth={fullWidth}
      color="primary"
      disabled={loading}
    >
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <>
          <Typography noWrap>Switch to&nbsp;</Typography>
          <img
            src={chain?.chainLogoUri ?? undefined}
            alt={`${chain?.chainName} Logo`}
            width={24}
            height={24}
            loading="lazy"
          />
          <Typography noWrap>&nbsp;{chain?.chainName}</Typography>
        </>
      )}
    </Button>
  )
}

export default ChainSwitcher
