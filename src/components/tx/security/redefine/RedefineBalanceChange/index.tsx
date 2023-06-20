import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { useHasFeature } from '@/hooks/useChains'
import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { FEATURES } from '@/utils/chains'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Chip, Grid, SvgIcon, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { ErrorBoundary } from '@sentry/react'
import { useContext } from 'react'
import { LoadingLabel } from '../../shared/LoadingLabel'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import RedefineLogo from '@/public/images/transactions/redefine.svg'
import RedefineLogoDark from '@/public/images/transactions/redefine-dark-mode.svg'
import ArrowOutwardIcon from '@/public/images/transactions/outgoing.svg'
import ArrowDownwardIcon from '@/public/images/transactions/incoming.svg'

import css from './styles.module.css'
import { useDarkMode } from '@/hooks/useDarkMode'

const FungibleBalanceChange = ({
  change,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number] & { type: 'ERC20' | 'NATIVE' }
}) => {
  const { balances } = useBalances()

  const logoUri = balances.items.find((item) => {
    return change.type === 'NATIVE'
      ? item.tokenInfo.type === TokenType.NATIVE_TOKEN
      : sameAddress(item.tokenInfo.address, change.address)
  })?.tokenInfo.logoUri

  return (
    <>
      <Typography variant="body2" mx={1}>
        {formatVisualAmount(change.amount.value, change.decimals)}
      </Typography>
      <TokenIcon size={16} logoUri={logoUri} tokenSymbol={change.symbol} />
      <Typography variant="body2" fontWeight={700} display="inline" ml={0.5}>
        {change.symbol}
      </Typography>
      <Chip className={css.categoryChip} label={change.type} />
    </>
  )
}

const NFTBalanceChange = ({
  change,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number] & { type: 'ERC721' }
}) => {
  const chainId = useChainId()

  return (
    <>
      {change.symbol ? (
        <Typography variant="body2" fontWeight={700} display="inline" ml={1}>
          {change.symbol}
        </Typography>
      ) : (
        <Typography variant="body2" ml={1}>
          <EthHashInfo
            address={change.address}
            chainId={chainId}
            showCopyButton={false}
            showPrefix={false}
            hasExplorer
            showAvatar={false}
            shortAddress
          />
        </Typography>
      )}
      <Typography variant="subtitle2" className={css.nftId} ml={1}>
        #{change.tokenId}
      </Typography>
      <Chip className={css.categoryChip} label="NFT" />
    </>
  )
}

const BalanceChange = ({
  change,
  positive = false,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number]
  positive?: boolean
}) => {
  return (
    <Grid item xs={12} md={12}>
      <Box className={css.balanceChange}>
        {positive ? <ArrowDownwardIcon /> : <ArrowOutwardIcon />}
        {change.type === 'ERC721' ? <NFTBalanceChange change={change} /> : <FungibleBalanceChange change={change} />}
      </Box>
    </Grid>
  )
}

const BalanceChanges = () => {
  const { balanceChange, isLoading } = useContext(TransactionSecurityContext)
  const totalBalanceChanges = balanceChange ? balanceChange.in.length + balanceChange.out.length : 0

  if (isLoading && !balanceChange) {
    return <LoadingLabel />
  }

  if (totalBalanceChanges === 0) {
    return (
      <Typography color="text.secondary" p={2}>
        None
      </Typography>
    )
  }

  return (
    <Grid container className={css.balanceChanges}>
      <>
        {balanceChange?.in.map((change, idx) => (
          <BalanceChange change={change} key={idx} positive />
        ))}
        {balanceChange?.out.map((change, idx) => (
          <BalanceChange change={change} key={idx} />
        ))}
      </>
    </Grid>
  )
}

export const RedefineBalanceChanges = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)
  const isDarkMode = useDarkMode()

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <Box className={css.box}>
      <Box className={css.head}>
        <Typography variant="subtitle2" fontWeight={700}>
          Balance change
        </Typography>
        <SvgIcon
          inheritViewBox
          sx={{ height: '40px', width: '52px' }}
          component={isDarkMode ? RedefineLogoDark : RedefineLogo}
        />
      </Box>
      <ErrorBoundary fallback={<div>Error showing balance changes</div>}>
        <BalanceChanges />
      </ErrorBoundary>
    </Box>
  )
}
