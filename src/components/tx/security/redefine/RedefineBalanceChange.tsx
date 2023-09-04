import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { useHasFeature } from '@/hooks/useChains'
import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { FEATURES } from '@/utils/chains'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Chip, CircularProgress, Grid, SvgIcon, Tooltip, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { ErrorBoundary } from '@sentry/react'
import { useContext } from 'react'
import { TxSecurityContext } from '../shared/TxSecurityContext'
import ArrowOutwardIcon from '@/public/images/transactions/outgoing.svg'
import ArrowDownwardIcon from '@/public/images/transactions/incoming.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { REDEFINE_ARTICLE } from '@/config/constants'

import css from './styles.module.css'

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
      <span style={{ margin: 'auto' }} />
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
      <span style={{ margin: 'auto' }} />
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
  const { balanceChange, isLoading } = useContext(TxSecurityContext)
  const totalBalanceChanges = balanceChange ? balanceChange.in.length + balanceChange.out.length : undefined

  if (isLoading && !balanceChange) {
    return (
      <div className={css.loader}>
        <CircularProgress
          size={22}
          sx={{
            color: ({ palette }) => palette.text.secondary,
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Calculating...
        </Typography>
      </div>
    )
  }

  if (totalBalanceChanges && totalBalanceChanges === 0) {
    return (
      <Typography variant="body2" color="text.secondary" justifySelf="flex-end">
        No balance change detected
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

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <div className={css.box}>
      <Typography variant="subtitle2" fontWeight={700} flexShrink={0}>
        Balance change
        <Tooltip
          title={
            <>
              The balance change gives an overview of the implications of a transaction. You can see which assets will
              be sent and received after the transaction is executed.&nbsp;
              <ExternalLink href={REDEFINE_ARTICLE} title="Learn more about balance change">
                Learn more about balance change
              </ExternalLink>
              .
            </>
          }
          arrow
          placement="top"
        >
          <span>
            <SvgIcon
              component={InfoIcon}
              inheritViewBox
              color="border"
              fontSize="small"
              sx={{
                verticalAlign: 'middle',
                ml: 0.5,
              }}
            />
          </span>
        </Tooltip>
      </Typography>
      <ErrorBoundary fallback={<div>Error showing balance changes</div>}>
        <BalanceChanges />
      </ErrorBoundary>
    </div>
  )
}
