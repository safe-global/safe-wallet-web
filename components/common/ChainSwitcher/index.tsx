import { ReactElement } from 'react'
import { Button } from '@mui/material'
import { hexValue } from 'ethers/lib/utils'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard from '@/hooks/wallets/useOnboard'
import useIsWrongChain from '@/hooks/useIsWrongChain'

const Circle = ({ color }: { color: string }): ReactElement => {
  return (
    <span
      style={{
        width: '0.8em',
        height: '0.8em',
        borderRadius: '50%',
        backgroundColor: color,
        marginLeft: 1,
      }}
    />
  )
}

const ChainSwitcher = (): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = () => {
    if (!chain) return
    const chainId = hexValue(parseInt(chain.chainId))
    onboard?.setChain({ chainId })
  }

  return isWrongChain ? (
    <Button onClick={handleChainSwitch} variant="outlined" size="small">
      Switch to&nbsp;
      <Circle color={chain?.theme?.backgroundColor || ''} />
      &nbsp;{chain?.chainName}
    </Button>
  ) : null
}

export default ChainSwitcher
