// import { SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'
import { SafeRpcProvider } from '@/services/safe-wallet-provider/rpc'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { useState, useEffect } from 'react'
import { Container, Grid } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import dynamic from 'next/dynamic'
import { INFURA_TOKEN } from '@/config/constants'

// we have to load the widget with ssr false, otherwise nextjs crashes
const Widget = dynamic(() => {
  return import('@uniswap/widgets').then((mod) => mod.SwapWidget)
}, { ssr: false })
const supportedChains = [1, 100, 11155111]

const jsonRpcUrlMap = {
  1: [`https://mainnet.infura.io/v3/${INFURA_TOKEN}`],
  3: ['https://ropsten.infura.io/v3/<YOUR_INFURA_PROJECT_ID>'],
  11155111: [`https://mainnet.infura.io/v3/${INFURA_TOKEN}`],
}
const isSupportedChainForSwap = (chainId: number) => supportedChains.includes(chainId)
export const UniswapWidget = () => {
  const walletProvider = useSafeWalletProvider()
  const chainId = useChainId()
  const [provider, setProvider] = useState<any>()

  const [params, setParams] = useState({})

  useEffect(() => {
    if (!walletProvider) return

    const provider = new SafeRpcProvider(walletProvider)

    console.log('============== provider', provider)
    setProvider(provider)
  }, [walletProvider])


  if (!provider) {
    return null
  }

  if (!isSupportedChainForSwap(Number(chainId))) {
    return (
      <Container>
        <Grid container justifyContent="center">
          <div>Swaps are not supported on this chain</div>
        </Grid>
      </Container>
    )
  }

  return (
    <Container>
      <Grid container justifyContent="center">
        <Widget params={params} provider={provider} jsonRpcUrlMap={jsonRpcUrlMap}/>
      </Grid>
    </Container>
  )
}
