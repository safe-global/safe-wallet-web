import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { AppRoutes } from '@/config/routes'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { SWAP_EVENTS, SWAP_LABELS } from '@/services/analytics/events/swaps'
import { Button } from '@mui/material'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import SwapIcon from '@/public/images/common/swap.svg'

const SwapButton = ({ tokenInfo, amount }: { tokenInfo: TokenInfo; amount: string }): ReactElement => {
  const spendingLimit = useSpendingLimit(tokenInfo)
  const router = useRouter()

  return (
    <CheckWallet allowSpendingLimit={!!spendingLimit}>
      {(isOk) => (
        <Track {...SWAP_EVENTS.OPEN_SWAPS} label={SWAP_LABELS.asset}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<SwapIcon />}
            onClick={() => {
              router.push({
                pathname: AppRoutes.swap,
                query: {
                  ...router.query,
                  token: tokenInfo.symbol,
                  amount,
                },
              })
            }}
            disabled={!isOk}
          >
            Swap
          </Button>
        </Track>
      )}
    </CheckWallet>
  )
}

export default SwapButton
