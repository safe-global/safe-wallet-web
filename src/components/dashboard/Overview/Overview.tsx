import QrCodeButton from '@/components/sidebar/QrCodeButton'
import { TxModalContext } from '@/components/tx-flow'
import { NewTxFlow } from '@/components/tx-flow/flows'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { formatCurrency } from '@/utils/formatNumber'
import { ReactElement, useEffect, useState } from 'react'
import { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Box, Button, Divider, Grid, Skeleton, Typography } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import ChainIndicator from '@/components/common/ChainIndicator'
import { AppRoutes } from '@/config/routes'
import useCollectibles from '@/hooks/useCollectibles'
import type { UrlObject } from 'url'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import ArrowIconNW from '@/public/images/common/arrow-top-right.svg'
import ArrowIconSE from '@/public/images/common/arrow-se.svg'
import BuyCryproButton from '@/components/common/BuyCryproButton'

import { CowSwapWidget, CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-react'
import { useWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getConnectedWallet } from '@/hooks/wallets/useOnboard'
import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { JsonRpcProvider } from 'ethers'
import { getPeerName } from '@/features/walletconnect/services/utils'
import { EventEmitter } from 'events'
import { SafeWalletProvider } from '@/services/safe-wallet-provider'

const ValueSkeleton = () => <Skeleton variant="text" width={20} />

const SkeletonOverview = (
  <Card>
    <Grid container>
      <Grid item xs={12}>
        <Box mb={2}>
          <Skeleton variant="text" width={100} height={21} />
          <Skeleton variant="text" width={120} height={40} />
        </Box>

        <Box position="absolute" right="24px" top="24px">
          <Skeleton variant="text" width="80px" />
        </Box>

        <Divider sx={{ mb: '12px' }} />
      </Grid>
    </Grid>
    <Grid container>
      <Grid item container xs={6} gap={2}>
        <Typography
          color="border.main"
          variant="caption"
          fontWeight="bold"
          display="flex"
          gap={1}
          textTransform="uppercase"
        >
          <ValueSkeleton /> Tokens
        </Typography>
        <Typography
          color="border.main"
          variant="caption"
          fontWeight="bold"
          display="flex"
          gap={1}
          textTransform="uppercase"
        >
          <ValueSkeleton /> NFTs
        </Typography>
      </Grid>
    </Grid>
    <Grid container mt={3} gap={1}>
      <Skeleton variant="rounded" width="115px" height="40px" />
      <Skeleton variant="rounded" width="115px" height="40px" />
    </Grid>
  </Card>
)

//  Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"

class MyProvider extends EventEmitter {
  walletProvider: SafeWalletProvider
  chainId: number

  constructor(walletProvider: SafeWalletProvider) {
    super()
    this.walletProvider = walletProvider
    this.chainId = walletProvider.safe.chainId
  }

  async connect(): Promise<void> {
    console.log('connnnneeeeect =====================')
    this.emit('connect', { chainId: this.chainId })
    return
  }

  async request(request) {
    console.log('SWAP request =============================', request)
    if (request.method === 'eth_requestAccounts') {

      console.log('swap request eth_requestAccounts =============================', (await this.walletProvider.eth_accounts()))

      request.method = 'eth_accounts'
      // return await walletProvider.eth_accounts()[0]
    }
    return await this.walletProvider.request(request.id, request, {
      id: -1,
      url: '',
      name: 'Built-inswap',
      description: 'description',
      iconUrl: 'icon',
    })
  }

  async on(event, blah) {
    console.log('swap on =============================', event, blah)
  }

  async enable() {
    console.log('swap enable =============================', (await this.walletProvider.eth_accounts())[0])
    // return (await walletProvider.eth_accounts())[0]
    return new Promise(async (resolve, reject) => {
      resolve((await this.walletProvider.eth_accounts()))
    })
  }
}

const MySwap = () => {

  // const walletProvider = useSafeWalletProvider()
  // const web3ReadOnly = useWeb3ReadOnly()
  // const provider = useWeb3ReadOnly()
  const walletProvider = useWallet().provider
  // console.log('web3 wallet', provider)
  const [params, setParams] = useState<CowSwapWidgetParams>({})
  // const connectedWallet = getConnectedWallet(web3Provider)
  // const [signer] = useAsync(async () => {
  //   const signer = await web3Provider.getSigner()
  //   // await signer.sendTransaction({ to: wallet.address, value: 0 })
  //   return signer
  // }, web3Provider)

  useEffect(() => {

    console.log('swap provider', walletProvider)
    if (!walletProvider) return


    const provider = walletProvider
    // const provider = new MyProvider(walletProvider)
    setParams({
      'appCode': 'My Cool App', // Name of your app (max 50 characters)
      'width': '450px', // Width in pixels (or 100% to use all available space)
      'height': '640px',
      'provider': provider, // Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
      'chainId': 1, // 1 (Mainnet), 5 (Goerli), 100 (Gnosis)
      'tokenLists': [ // All default enabled token lists. Also see https://tokenlists.org
        'https://files.cow.fi/tokens/CowSwap.json',
        'https://tokens.coingecko.com/uniswap/all.json',
      ],
      'tradeType': TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
      'sell': { // Sell token. Optionally add amount for sell orders
        'asset': 'USDC',
        'amount': '10',
      },
      'buy': { // Buy token. Optionally add amount for buy orders
        'asset': 'COW',
        'amount': '0',
      },
      'enabledTradeTypes': [ // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.SWAP,
        TradeType.LIMIT,
        TradeType.ADVANCED,
      ],
      'theme': 'dark', // light/dark or provide your own color palette
      'interfaceFeeBips': '50', // 0.5% - COMING SOON! Fill the form above if you are interested
    })
  }, [walletProvider])
  // useEffect(() => {
  //
  // })
  // console.log('web3Provider', signer)

  // if(!provider) return (<div>loading</div>)

  if (!params.provider) {
    console.log('swap params are null')
    return null
  }
  console.log('swap params', params, params.provider.enable())
  return (
    <div>
      <CowSwapWidget params={params} key={Math.random(1)} />
    </div>
  )
}
const Overview = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const router = useRouter()
  const { safeLoading, safeLoaded } = useSafeInfo()
  const { balances, loading: balancesLoading } = useVisibleBalances()
  const [nfts, , nftsLoading] = useCollectibles()
  const chain = useCurrentChain()
  const { chainId } = chain || {}
  const { setTxFlow } = useContext(TxModalContext)

  const fiatTotal = useMemo(
    () => (balances.fiatTotal ? formatCurrency(balances.fiatTotal, currency) : ''),
    [currency, balances.fiatTotal],
  )

  const assetsLink: UrlObject = {
    pathname: AppRoutes.balances.index,
    query: { safe: router.query.safe },
  }
  const nftsLink: UrlObject = {
    pathname: AppRoutes.balances.nfts,
    query: { safe: router.query.safe },
  }

  // Native token is always returned even when its balance is 0
  const tokenCount = useMemo(() => balances.items.filter((token) => token.balance !== '0').length, [balances])
  const nftsCount = useMemo(() => (nfts ? `${nfts.next ? '>' : ''}${nfts.results.length}` : ''), [nfts])

  const isInitialState = !safeLoaded && !safeLoading
  const isLoading = safeLoading || balancesLoading || nftsLoading || isInitialState

  const handleOnSend = () => {
    setTxFlow(<NewTxFlow />, undefined, false)
    trackEvent(OVERVIEW_EVENTS.NEW_TRANSACTION)
  }

  const handleSwap = () => {
    setTxFlow(<MySwap />, undefined, false)
    // trackEvent(OVERVIEW_EVENTS.NEW_TRANSACTION)
  }
  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Overview
      </Typography>

      <WidgetBody>
        {isLoading ? (
          SkeletonOverview
        ) : (
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container pb={2}>
              <Grid item>
                <Typography variant="body2" color="primary.light">
                  Total asset value
                </Typography>
                <Typography variant="h2">{fiatTotal}</Typography>
              </Grid>
              <Grid item xs />

              <Grid item>
                <ChainIndicator chainId={chainId} inline />
              </Grid>
            </Grid>

            <Divider />

            <Grid container pt="12px">
              <Grid item container xs={6} gap={1}>
                <Link href={assetsLink} passHref>
                  <Box
                    sx={{
                      display: 'flex',
                      borderRight: '1px solid',
                      borderColor: ({ palette }) => palette.border.light,
                      gap: 0.5,
                      pr: 1,
                    }}
                  >
                    <Typography variant="caption" component="span">
                      {balancesLoading ? <ValueSkeleton /> : tokenCount}
                    </Typography>{' '}
                    <Typography
                      variant="caption"
                      component="span"
                      color="border.main"
                      textTransform="uppercase"
                      fontWeight="bold"
                    >
                      Tokens
                    </Typography>
                  </Box>
                </Link>

                <Link href={nftsLink} passHref>
                  <Box display="flex" pr={1} gap={0.5}>
                    <Typography variant="caption" component="span">
                      {nftsCount || <ValueSkeleton />}
                    </Typography>{' '}
                    <Typography
                      variant="caption"
                      component="span"
                      color="border.main"
                      textTransform="uppercase"
                      fontWeight="bold"
                    >
                      NFTs
                    </Typography>
                  </Box>
                </Link>
              </Grid>
            </Grid>
            <Grid item mt="auto">
              <Grid container mt={3} spacing={1} flexWrap="wrap">
                <Grid item xs={12} sm="auto">
                  <BuyCryproButton />
                </Grid>

                <Grid item xs={6} sm="auto">
                  <Button
                    onClick={handleOnSend}
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<ArrowIconNW />}
                    fullWidth
                  >
                    Send
                  </Button>
                </Grid>
                <Grid item xs={6} sm="auto">
                  <QrCodeButton>
                    <Button size="small" variant="outlined" color="primary" startIcon={<ArrowIconSE />} fullWidth>
                      Receive
                    </Button>
                  </QrCodeButton>
                </Grid>

                <Grid item xs={6} sm="auto">
                  <Button
                    onClick={handleSwap}
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<ArrowIconNW />}
                    fullWidth
                  >
                    Swap
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        )}
      </WidgetBody>
    </WidgetContainer>
  )
}

export default Overview
