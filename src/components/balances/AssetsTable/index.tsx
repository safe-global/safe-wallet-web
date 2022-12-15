import { useState, type ReactElement, useMemo, useContext, useCallback } from 'react'
import { Button, Tooltip, Typography, SvgIcon, IconButton, Box } from '@mui/material'
import type { SafeBalanceResponse, TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
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
import useHiddenAssets from '@/hooks/useHiddenAssets'

interface AssetsTableProps {
  items?: SafeBalanceResponse['items']
}

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

const AssetsTable = ({ items }: AssetsTableProps): ReactElement => {
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>()
  const isGranted = useIsGranted()
  const { showHiddenAssets, toggleAsset, saveChanges, assetsToHide, assetsToUnhide, reset } =
    useContext(HiddenAssetsContext)
  const hiddenAssets = useHiddenAssets()

  const visibleItems = useMemo(
    () =>
      showHiddenAssets
        ? items
        : items?.filter(
            (item) => isNativeToken(item.tokenInfo) || typeof hiddenAssets?.[item.tokenInfo.address] === 'undefined',
          ),
    [hiddenAssets, items, showHiddenAssets],
  )

  // Assets are selected if they are either hidden or marked for hiding
  const isAssetSelected = useCallback(
    (address: string) =>
      (hiddenAssets && typeof hiddenAssets[address] !== 'undefined' && !assetsToUnhide.includes(address)) ||
      assetsToHide.includes(address),
    [assetsToHide, assetsToUnhide, hiddenAssets],
  )

  const selectedAssetCount = visibleItems?.filter((item) => isAssetSelected(item.tokenInfo.address)).length || 0

  const shouldHideSend = !isGranted

  const rows = (visibleItems || []).map((item) => {
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
      {(assetsToHide.length > 0 || showHiddenAssets) && (
        <Box display="flex" flexWrap="wrap" flexDirection="row" alignItems="center" gap={1} mb={2}>
          <Box className={css.hideTokensHeader}>
            <VisibilityOffOutlined />
            <Typography>
              {selectedAssetCount} {selectedAssetCount === 1 ? 'token' : 'tokens'} selected
            </Typography>
          </Box>
          <div>
            <Button onClick={reset} className={css.tinyButton} variant="outlined">
              Cancel
            </Button>
            <Button onClick={saveChanges} className={css.tinyButton} variant="contained">
              Apply
            </Button>
          </div>
        </Box>
      )}
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
