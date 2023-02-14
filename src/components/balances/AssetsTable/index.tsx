import { useState, type ReactElement, useMemo } from 'react'
import { Button, Tooltip, Typography, SvgIcon, IconButton, Box, Checkbox } from '@mui/material'
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
import { VisibilityOutlined } from '@mui/icons-material'
import TokenMenu from '../TokenMenu'
import useBalances from '@/hooks/useBalances'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import { useHideAssets } from './useHideAssets'

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

const AssetsTable = ({
  showHiddenAssets,
  setShowHiddenAssets,
}: {
  showHiddenAssets: boolean
  setShowHiddenAssets: (hidden: boolean) => void
}): ReactElement => {
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>()
  const isGranted = useIsGranted()
  const hiddenAssets = useHiddenTokens()
  const { balances } = useBalances()

  const { isAssetSelected, toggleAsset, hidingAsset, hideAsset, cancel, deselectAll, saveChanges } = useHideAssets(() =>
    setShowHiddenAssets(false),
  )

  const visibleAssets = useMemo(
    () =>
      showHiddenAssets
        ? balances.items
        : balances.items?.filter((item) => !hiddenAssets.includes(item.tokenInfo.address)),
    [hiddenAssets, balances.items, showHiddenAssets],
  )

  const selectedAssetCount = visibleAssets?.filter((item) => isAssetSelected(item.tokenInfo.address)).length || 0

  const shouldHideSend = !isGranted

  const rows = (visibleAssets || []).map((item) => {
    const rawFiatValue = parseFloat(item.fiatBalance)
    const isNative = isNativeToken(item.tokenInfo)
    const isSelected = isAssetSelected(item.tokenInfo.address)

    return {
      key: item.tokenInfo.address,
      selected: isSelected,
      collapsed: item.tokenInfo.address === hidingAsset,
      cells: {
        asset: {
          rawValue: item.tokenInfo.name,
          collapsed: item.tokenInfo.address === hidingAsset,
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
          collapsed: item.tokenInfo.address === hidingAsset,
          content: (
            <TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} tokenSymbol={item.tokenInfo.symbol} />
          ),
        },
        value: {
          rawValue: rawFiatValue,
          collapsed: item.tokenInfo.address === hidingAsset,
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
          collapsed: item.tokenInfo.address === hidingAsset,
          content: (
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <>
                {!shouldHideSend && (
                  <Track {...ASSETS_EVENTS.SEND}>
                    <Button
                      sx={{ visibility: showHiddenAssets ? 'hidden' : 'visible' }}
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setSelectedAsset(item.tokenInfo.address)}
                    >
                      Send
                    </Button>
                  </Track>
                )}
                {showHiddenAssets ? (
                  <Checkbox size="small" checked={isSelected} onClick={() => toggleAsset(item.tokenInfo.address)} />
                ) : (
                  <Track {...ASSETS_EVENTS.HIDE_TOKEN}>
                    <Tooltip title="Hide asset" arrow disableInteractive>
                      <IconButton
                        disabled={hidingAsset !== undefined}
                        size="medium"
                        onClick={() => hideAsset(item.tokenInfo.address)}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Track>
                )}
              </>
            </Box>
          ),
        },
      },
    }
  })

  return (
    <>
      <TokenMenu
        saveChanges={saveChanges}
        cancel={cancel}
        deselectAll={deselectAll}
        selectedAssetCount={selectedAssetCount}
        showHiddenAssets={showHiddenAssets}
      />

      <div className={css.container}>
        <EnhancedTable rows={rows} headCells={headCells} />
        {selectedAsset && (
          <TokenTransferModal
            onClose={() => setSelectedAsset(undefined)}
            initialData={[{ tokenAddress: selectedAsset }]}
          />
        )}
      </div>
    </>
  )
}

export default AssetsTable
