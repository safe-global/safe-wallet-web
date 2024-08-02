import { List, ListItem, Stack } from '@mui/material'

import { type ApprovalInfo } from '@/components/tx/ApprovalEditor/hooks/useApprovalInfos'
import css from './styles.module.css'
import ApprovalItem from '@/components/tx/ApprovalEditor/ApprovalItem'
import { groupBy } from 'lodash'
import { useMemo } from 'react'
import { SpenderField } from './SpenderField'

const Approvals = ({ approvalInfos }: { approvalInfos: ApprovalInfo[] }) => {
  const groupedApprovals = useMemo(() => groupBy(approvalInfos, (approval) => approval.spender), [approvalInfos])

  return (
    <List className={css.approvalsList}>
      {Object.entries(groupedApprovals).map(([spender, approvals]) => (
        <Stack key={spender} gap={2}>
          <SpenderField address={spender} />
          {approvals.map((tx) => {
            if (!tx.tokenInfo) return <></>

            return (
              <ListItem
                key={tx.tokenAddress + tx.spender}
                className={BigInt(0) === BigInt(tx.amount) ? css.zeroValueApproval : undefined}
                disablePadding
                data-testid="approval-item"
              >
                <ApprovalItem
                  spender={tx.spender}
                  method={tx.method}
                  amount={tx.amountFormatted}
                  rawAmount={tx.amount}
                  tokenInfo={tx.tokenInfo}
                />
              </ListItem>
            )
          })}
        </Stack>
      ))}
    </List>
  )
}

export default Approvals
