import { useState, type ReactElement, useMemo } from 'react'
import { Button, Tooltip, Typography, SvgIcon } from '@mui/material'
import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import FiatValue from '@/components/common/FiatValue'
import TokenAmount from '@/components/common/TokenAmount'
import TokenIcon from '@/components/common/TokenIcon'
import EnhancedTable from '@/components/common/EnhancedTable'
import TokenExplorerLink from '@/components/common/TokenExplorerLink'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import useIsGranted from '@/hooks/useIsGranted'
import Track from '@/components/common/Track'
import { ASSETS_EVENTS } from '@/services/analytics/events/assets'
import InfoIcon from '@/public/images/notifications/info.svg'

interface AssetsTableProps {
  items?: SafeBalanceResponse['items']
}

const AssetsTable = ({ items }: AssetsTableProps): ReactElement => {
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>()
  const isGranted = useIsGranted()

  const shouldHideActions = !isGranted

  const headCells = useMemo(
    () => [
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
        hide: shouldHideActions,
        sticky: true,
      },
    ],
    [shouldHideActions],
  )

  const rows = (items || []).map((item) => {
    const rawFiatValue = parseFloat(item.fiatBalance)

    return {
      asset: {
        rawValue: item.tokenInfo.name,
        content: (
          <div className={css.token}>
            <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

            <Typography>{item.tokenInfo.name}</Typography>

            {item.tokenInfo.type !== TokenType.NATIVE_TOKEN && <TokenExplorerLink address={item.tokenInfo.address} />}
          </div>
        ),
      },
      balance: {
        rawValue: Number(item.balance) / 10 ** item.tokenInfo.decimals,
        content: (
          <TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} tokenSymbol={item.tokenInfo.symbol} />
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
        hide: shouldHideActions,
        content: (
          <Track {...ASSETS_EVENTS.SEND}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setSelectedAsset(item.tokenInfo.address)}
            >
              Send
            </Button>
          </Track>
        ),
      },
    }
  })

  return (
    <div className={css.container}>
      <EnhancedTable rows={rows} headCells={headCells} />
      {selectedAsset && (
        <TokenTransferModal
          onClose={() => setSelectedAsset(undefined)}
          initialData={[{ tokenAddress: selectedAsset }]}
        />
      )}
    </div>
  )
}

export default AssetsTable
