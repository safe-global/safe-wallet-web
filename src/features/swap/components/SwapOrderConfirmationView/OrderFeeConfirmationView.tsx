import type { OrderConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import { getOrderFeeBps } from '@/features/swap/helpers/utils'
import { DataRow } from '@/components/common/Table/DataRow'
import { HelpCenterArticle } from '@/config/constants'
import { HelpIconTooltip } from '@/features/swap/components/HelpIconTooltip'
import MUILink from '@mui/material/Link'

export const OrderFeeConfirmationView = ({
  order,
}: {
  order: Pick<OrderConfirmationView, 'fullAppData'>
  hideWhenNonFulfilled?: boolean
}) => {
  const bps = getOrderFeeBps(order)

  const title = (
    <>
      Widget fee{' '}
      <HelpIconTooltip
        title={
          <>
            The tiered widget fees incurred here will contribute to a license fee that supports the Safe community.
            Neither Safe Ecosystem Foundation nor {`Safe{Wallet}`}
            operate the CoW Swap Widget and/or CoW Swap.{` `}
            <MUILink href={HelpCenterArticle.SWAP_WIDGET_FEES} target="_blank" rel="noopener noreferrer">
              Learn more
            </MUILink>
          </>
        }
      />
    </>
  )

  return (
    <DataRow title={title} key="widget_fee">
      {Number(bps) / 100} %
    </DataRow>
  )
}
