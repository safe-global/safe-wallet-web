import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { useHasFeature } from '@/hooks/useChains'
import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { FEATURES } from '@/utils/chains'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Chip, Grid, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { ErrorBoundary } from '@sentry/react'
import { useContext } from 'react'
import { LoadingLabel } from '../../shared/LoadingLabel'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import css from './styles.module.css'

const FungibleBalanceChange = ({
  change,
  positive = false,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number] & { type: 'ERC20' | 'NATIVE' }
  positive?: boolean
}) => {
  const { balances } = useBalances()

  const logoUri = balances.items.find((item) => {
    return change.type === 'NATIVE'
      ? item.tokenInfo.type === TokenType.NATIVE_TOKEN
      : sameAddress(item.tokenInfo.address, change.address)
  })?.tokenInfo.logoUri

  return (
    <>
      <Typography>
        {positive && '+'}
        {formatVisualAmount(change.amount.value, change.decimals)}
      </Typography>
      <TokenIcon size={24} logoUri={logoUri} tokenSymbol={change.symbol} />
      <Typography fontWeight={700} display="inline">
        {change.symbol}
      </Typography>
      <Chip sx={{ borderRadius: '4px' }} label={change.type} />
    </>
  )
}

const NFTBalanceChange = ({
  change,
  positive = false,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number] & { type: 'ERC721' }
  positive?: boolean
}) => {
  const chainId = useChainId()

  return (
    <>
      <Typography mr={-1}>{positive ? '+' : '-'}</Typography>
      {change.symbol ? (
        <Typography fontWeight={700} display="inline">
          {change.symbol}
        </Typography>
      ) : (
        <EthHashInfo
          name={change.symbol ?? 'NFT'}
          address={change.address}
          chainId={chainId}
          showCopyButton={false}
          showPrefix={false}
          hasExplorer
          showAvatar={false}
          shortAddress
        />
      )}
      <Typography variant="subtitle2" fontWeight={700} className={css.nftId}>
        #{change.tokenId}
      </Typography>
      <Chip sx={{ borderRadius: '4px' }} label="NFT" />
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
    <Grid item xs={12} md={6}>
      <Box
        className={css.balanceChange}
        sx={{ borderColor: ({ palette }) => `${positive ? palette.success.light : palette.warning.light} !important` }}
      >
        {change.type === 'ERC721' ? (
          <NFTBalanceChange change={change} positive={positive} />
        ) : (
          <FungibleBalanceChange change={change} positive={positive} />
        )}
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
      <Typography color="text.secondary" pl={1}>
        None
      </Typography>
    )
  }

  return (
    <Grid container direction="row" alignItems="center" spacing={1}>
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

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <Box className={css.box}>
      <Box className={css.head}>
        <Grid container direction="row">
          <Typography variant="subtitle2" fontWeight={700}>
            Balance change
          </Typography>
        </Grid>
      </Box>
      <ErrorBoundary fallback={<div>Error showing balance changes</div>}>
        <BalanceChanges />
      </ErrorBoundary>
    </Box>
  )
}
