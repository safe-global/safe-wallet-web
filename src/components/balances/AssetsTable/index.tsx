import { useState, type ReactElement, useContext } from 'react'
import { Button, Tooltip, Typography, SvgIcon, IconButton, Box } from '@mui/material'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
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
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'

const isNativeToken = (tokenInfo: TokenInfo) => {
  return tokenInfo.type === TokenType.NATIVE_TOKEN
}

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
  },
]

const AssetsTable = (): ReactElement => {
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>()
  const isGranted = useIsGranted()
  const { toggleAsset, isAssetSelected, visibleAssets } = useContext(HiddenAssetsContext)

  const shouldHideSend = !isGranted

  const rows = (visibleAssets || []).map((item) => {
    const rawFiatValue = parseFloat(item.fiatBalance)
    const isNative = isNativeToken(item.tokenInfo)

    return {
      selected: !isNative && isAssetSelected(item.tokenInfo.address),
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
          content: (
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              {!shouldHideSend && (
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
              )}
              {!isNative && (
                <Track {...ASSETS_EVENTS.HIDE}>
                  <IconButton onClick={() => toggleAsset(item.tokenInfo.address)}>
                    {isAssetSelected(item.tokenInfo.address) ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                  </IconButton>
                </Track>
              )}
            </Box>
          ),
        },
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
