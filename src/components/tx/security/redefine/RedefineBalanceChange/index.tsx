import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { formatVisualAmount } from '@/utils/formatters'
import { Box, Chip, Grid, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext } from 'react'
import { LoadingLabel } from '../../shared/LoadingLabel'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import css from './styles.module.css'

const SingleFungibleBalanceChange = ({
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
      <Chip label={change.type} />
    </>
  )
}

const SingleNFTBalanceChange = ({
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
      <Typography className={css.nftId}>#{change.tokenId}</Typography>
      <Chip label="NFT" />
    </>
  )
}

const SingleBalanceChange = ({
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
          <SingleNFTBalanceChange change={change} positive={positive} />
        ) : (
          <SingleFungibleBalanceChange change={change} positive={positive} />
        )}
      </Box>
    </Grid>
  )
}

export const RedefineBalanceChanges = () => {
  const { balanceChange, isLoading } = useContext(TransactionSecurityContext)

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2">Balance change</Typography>
        {isLoading && !balanceChange ? (
          <LoadingLabel />
        ) : (
          <Grid container direction="row" alignItems="center" spacing={1}>
            {balanceChange ? (
              <>
                {balanceChange?.in?.map((change, idx) => (
                  <SingleBalanceChange change={change} key={idx} positive />
                ))}
                {balanceChange?.out?.map((change, idx) => (
                  <SingleBalanceChange change={change} key={idx} />
                ))}
              </>
            ) : (
              <Typography color="text.secondary">None</Typography>
            )}
          </Grid>
        )}
      </Box>
      <Typography mt={1} color="text.secondary">
        Powered by REDEFINE
      </Typography>
    </Box>
  )
}
