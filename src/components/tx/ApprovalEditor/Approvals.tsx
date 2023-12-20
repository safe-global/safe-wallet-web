import { Grid, List, ListItem } from '@mui/material'

import { type ApprovalInfo } from '@/components/tx/ApprovalEditor/hooks/useApprovalInfos'
import css from './styles.module.css'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import ApprovalItem from '@/components/tx/ApprovalEditor/ApprovalItem'
import { BigNumber } from 'ethers'

const Approvals = ({ approvalInfos }: { approvalInfos: ApprovalInfo[] }) => {
  return (
    <List className={css.approvalsList}>
      {approvalInfos.map((tx) => {
        if (!tx.tokenInfo) return <></>

        return (
          <ListItem
            key={tx.tokenAddress + tx.spender}
            className={BigNumber.from(0).eq(tx.amount) ? css.zeroValueApproval : undefined}
            disablePadding
            data-testid="approval-item"
          >
            <ApprovalItem spender={tx.spender} method={tx.method}>
              <Grid container gap={1} alignItems="center">
                <SendAmountBlock amount={tx.amountFormatted} tokenInfo={tx.tokenInfo} title="Token" />
              </Grid>
            </ApprovalItem>
          </ListItem>
        )
      })}
    </List>
  )
}

export default Approvals
