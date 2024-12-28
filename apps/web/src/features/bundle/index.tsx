import EthHashInfo from '@/components/common/EthHashInfo'
import FiatValue from '@/components/common/FiatValue'
import Identicon from '@/components/common/Identicon'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import { TxModalContext } from '@/components/tx-flow'
import TokenTransferFlow from '@/components/tx-flow/flows/TokenTransfer'
import { AppRoutes } from '@/config/routes'
import type { SafeItem } from '@/features/myAccounts/hooks/useAllSafes'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxQueue from '@/hooks/useTxQueue'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { useGetMultipleSafeOverviewsQuery } from '@/store/api/gateway'
import { selectCurrency } from '@/store/settingsSlice'
import { parsePrefixedAddress, sameAddress } from '@/utils/addresses'
import {
  Box,
  Card,
  Grid,
  IconButton,
  List,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import Button from '@mui/material/Button'
import ListItemButton from '@mui/material/ListItemButton'
import { networks } from '@safe-global/protocol-kit/dist/src/utils/eip-3770/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import css from './styles.module.css'
import IosShareIcon from '@mui/icons-material/IosShare'

type Chains = Record<string, string>

const chains = networks.reduce<Chains>((result, { shortName, chainId }) => {
  result[chainId.toString()] = shortName.toString()
  return result
}, {})

const Bundle = () => {
  const [tooltipText, setTooltipText] = useState<string>('Share Safe Bundle')
  const currency = useAppSelector(selectCurrency)
  const { setTxFlow, setFullWidth } = useContext(TxModalContext)
  const { safe: safeInfo } = useSafeInfo()

  const currentSafeOwners = safeInfo.owners

  const wallet = useWallet()
  const router = useRouter()
  const { name = '', safes = '', safe = '' } = router.query
  const safesQuery = Array.isArray(safes) ? safes[0] : safes
  const safesList = safesQuery.split(',')
  const parsedSafes: SafeItem[] = safesList
    .map((safe) => parsePrefixedAddress(safe))
    .map((safe) => ({
      chainId: safe.prefix || '1',
      address: safe.address,
      isWatchlist: false,
      isReadOnly: false,
      isPinned: false,
      lastVisited: 0,
      name: '',
    }))

  const selectedSafeAddress = Array.isArray(safe) ? safe[0] : safe
  const { address: selectedSafe } = parsePrefixedAddress(selectedSafeAddress)

  const { data: safeOverviews } = useGetMultipleSafeOverviewsQuery({
    currency,
    walletAddress: wallet?.address,
    safes: parsedSafes,
  })

  const totalBalance = safeOverviews?.reduce((prev, current) => prev + Number(current.fiatTotal), Number(0))

  const onNewTxClick = async () => {
    setFullWidth(true)
    setTxFlow(<TokenTransferFlow />, undefined, false)
  }

  const onSelectSafe = (index: number) => {
    const shortname = chains[parsedSafes[index].chainId]

    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        safe: `${shortname}:${parsedSafes[index].address}`,
        chain: shortname,
      },
    })
  }

  const copyBundleLink = () => {
    let timeout: NodeJS.Timeout | undefined

    try {
      const link = window.location.href
      navigator.clipboard.writeText(link).then(() => setTooltipText('Copied'))

      timeout = setTimeout(() => {
        setTooltipText('Share Safe Bundle')
      }, 2000)
    } catch (e) {}

    return () => clearTimeout(timeout)
  }

  return (
    <>
      <Link href={AppRoutes.welcome.bundles} passHref>
        <Button sx={{ mb: 2 }}>{'< Back to Bundles'}</Button>
      </Link>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" mb={2} gap={2}>
              <Stack
                direction="row"
                gap={1}
                maxWidth={104}
                maxHeight={104}
                flexWrap="wrap"
                borderRadius={2}
                bgcolor="border.background"
                p={1}
                sx={{ overflow: 'hidden' }}
              >
                {parsedSafes.map((safe) => {
                  return <Identicon key={safe.address} address={safe.address} size={40} />
                })}
              </Stack>

              <Box>
                <Typography variant="h2" fontWeight="bold">
                  {name}
                </Typography>
                <Typography>{parsedSafes.length} Safe Accounts</Typography>
                {totalBalance && (
                  <Typography mt={1} variant="h3" fontWeight="bold">
                    <FiatValue value={totalBalance.toString()} maxLength={20} precise />
                  </Typography>
                )}
              </Box>

              <Tooltip title={tooltipText}>
                <IconButton onClick={copyBundleLink} sx={{ alignSelf: 'flex-end', ml: 'auto', mb: 'auto' }}>
                  <IosShareIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            <List className={css.list}>
              {parsedSafes.map((safe, index) => {
                return (
                  <ListItemButton
                    key={safe.address}
                    selected={sameAddress(selectedSafe, safe.address)}
                    onClick={() => onSelectSafe(index)}
                    className={css.listItem}
                    disableRipple
                  >
                    <EthHashInfo
                      address={safe.address}
                      prefix={safe.chainId ? chains[safe.chainId] : undefined}
                      copyAddress={false}
                      avatarSize={40}
                      shortAddress={false}
                    />
                  </ListItemButton>
                )
              })}
            </List>

            <Button variant="contained" onClick={onNewTxClick} disabled={!selectedSafe} sx={{ mt: 2 }}>
              Create transaction
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography fontWeight="bold" mb={2}>
              Queue
            </Typography>

            <PaginatedTxns useTxns={useTxQueue} />
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography fontWeight="bold" mb={2}>
              Signers
            </Typography>

            {currentSafeOwners.length > 0 ? (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="Table of signers">
                  <TableBody>
                    {currentSafeOwners.map((owner) => {
                      return (
                        <TableRow key={owner.value} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <EthHashInfo
                              key={owner.value}
                              address={owner.value}
                              showPrefix={false}
                              shortAddress={false}
                              showName={false}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Select a Safe to see the signers</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default Bundle
