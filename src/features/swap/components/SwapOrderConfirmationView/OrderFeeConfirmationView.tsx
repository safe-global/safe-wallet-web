import type { OrderConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import { getOrderFeeBps } from '@/features/swap/helpers/utils'
import { DataRow } from '@/components/common/Table/DataRow'
import { HelpCenterArticle } from '@/config/constants'
import { HelpIconTooltip } from '@/features/swap/components/HelpIconTooltip'
import MUILink from '@mui/material/Link'

export const OrderFeeConfirmationView = ({ order }: { order: Pick<OrderConfirmationView, 'fullAppData'> }) => {
  const bps = getOrderFeeBps(order)

  if (Number(bps) === 0) {
    return null
  }

  const title = (
    <>
      Widget fee{' '}
      <HelpIconTooltip
        title={
          <>
            The tiered widget fee incurred here is charged by CoW Protocol for the operation of this widget. The fee is
            automatically calculated into this quote. Part of the fee will contribute to a license fee that supports the
            Safe Community. Neither the Safe Ecosystem Foundation nor {`Safe{Wallet}`} operate the CoW Swap Widget
            and/or CoW Swap.
            <MUILink href={HelpCenterArticle.SWAP_WIDGET_FEES} target="_blank" rel="noopener noreferrer">
              Learn more
            </MUILink>
          </>
        }
      />
    </>
  )

  return (
    <DataRow datatestid="widget-fee" title={title} key="widget_fee">
      {Number(bps) / 100} %
    </DataRow>
  )
}
