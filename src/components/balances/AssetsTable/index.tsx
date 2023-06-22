import { type ReactElement, Dispatch, SetStateAction, useCallback } from 'react'
import { Tooltip, Typography, SvgIcon, Box, Skeleton, Checkbox } from '@mui/material'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import FiatValue from '@/components/common/FiatValue'
import TokenAmount from '@/components/common/TokenAmount'
import TokenIcon from '@/components/common/TokenIcon'
import EnhancedTable, { type EnhancedTableProps } from '@/components/common/EnhancedTable'
import TokenExplorerLink from '@/components/common/TokenExplorerLink'
import InfoIcon from '@/public/images/notifications/info.svg'
import useBalances from '@/hooks/useBalances'

const skeletonCells: EnhancedTableProps['rows'][0]['cells'] = {
  asset: {
    rawValue: '0x0',
    content: (
      <div className={css.token}>
        <Skeleton variant="rounded" width="26px" height="26px" />
        <Typography>
          <Skeleton width="80px" />
        </Typography>
      </div>
    ),
  },
  balance: {
    rawValue: '0',
    content: (
      <Typography>
        <Skeleton width="32px" />
      </Typography>
    ),
  },
  value: {
    rawValue: '0',
    content: (
      <Typography>
        <Skeleton width="32px" />
      </Typography>
    ),
  },
  actions: {
    rawValue: '',
    sticky: true,
    content: <div></div>,
  },
}

const skeletonRows: EnhancedTableProps['rows'] = Array(3).fill({ cells: skeletonCells })

const isNativeToken = (tokenInfo: TokenInfo) => {
  return tokenInfo.type === TokenType.NATIVE_TOKEN
}

type AssetsTableProps = {
  selectedTokens: string[]
  setSelectedTokens: Dispatch<SetStateAction<string[]>>
}

const AssetsTable = ({ selectedTokens, setSelectedTokens }: AssetsTableProps): ReactElement => {
  const { balances, loading } = useBalances()
  const allAssets = balances.items || []

  const onCheckboxClick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, item: string) => {
      e.stopPropagation()
      const { checked } = e.target
      setSelectedTokens((prev) => (checked ? prev.concat(item) : prev.filter((el) => el !== item)))
    },
    [setSelectedTokens],
  )

  const onSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedTokens(e.target.checked ? allAssets.map((item) => item.tokenInfo.address) : [])
    },
    [allAssets],
  )

  const headCells = [
    {
      id: 'asset',
      label: 'Asset',
      width: '60%',
    },
    {
      id: 'balance',
      label: 'Balance',
      width: '20%',
    },
    {
      id: 'value',
      label: 'Value',
      width: '20%',
    },
    {
      id: 'actions',
      label: '',
      width: '20%',
      sticky: true,
      content: (
        <Checkbox
          checked={selectedTokens.length > 0 && selectedTokens.length === allAssets.length}
          onChange={onSelectAll}
          title="Select all"
        />
      ),
    },
  ]

  const rows = loading
    ? skeletonRows
    : allAssets.map((item) => {
        const rawFiatValue = parseFloat(item.fiatBalance)
        const isNative = isNativeToken(item.tokenInfo)

        return {
          key: item.tokenInfo.address,
          cells: {
            asset: {
              rawValue: item.tokenInfo.name,
              content: (
                <div className={css.token}>
                  <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

                  <Typography>{item.tokenInfo.name}</Typography>

                  {!isNative && <TokenExplorerLink address={item.tokenInfo.address} />}
                </div>
              ),
            },
            balance: {
              rawValue: Number(item.balance) / 10 ** item.tokenInfo.decimals,
              content: (
                <TokenAmount
                  value={item.balance}
                  decimals={item.tokenInfo.decimals}
                  tokenSymbol={item.tokenInfo.symbol}
                />
              ),
            },
            value: {
              rawValue: rawFiatValue,
              content: (
                <>
                  <FiatValue value={item.fiatBalance} />
                  {rawFiatValue === 0 && (
                    <Tooltip title="Value may be zero due to missing token price information" placement="top" arrow>
                      <span>
                        <SvgIcon
                          component={InfoIcon}
                          inheritViewBox
                          color="error"
                          fontSize="small"
                          sx={{ verticalAlign: 'middle', marginLeft: 0.5 }}
                        />
                      </span>
                    </Tooltip>
                  )}
                </>
              ),
            },
            actions: {
              rawValue: '',
              sticky: true,
              content: (
                <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                  <Checkbox
                    checked={selectedTokens.includes(item.tokenInfo.address)}
                    onChange={(e) => onCheckboxClick(e, item.tokenInfo.address)}
                  />
                </Box>
              ),
            },
          },
        }
      })

  return (
    <>
      <div className={css.container}>
        <EnhancedTable rows={rows} headCells={headCells} />
      </div>
    </>
  )
}

export default AssetsTable
