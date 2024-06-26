import { Box, Divider, List, ListItem, Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import css from './styles.module.css'
import type { ApprovalInfo } from './hooks/useApprovalInfos'

import { useMemo } from 'react'
import EditableApprovalItem from './EditableApprovalItem'
import { groupBy } from 'lodash'
import { SpenderField } from './SpenderField'

export type ApprovalEditorFormData = {
  approvals: string[]
}

export const ApprovalEditorForm = ({
  approvalInfos,
  updateApprovals,
}: {
  approvalInfos: ApprovalInfo[]
  updateApprovals: (newApprovals: string[]) => void
}) => {
  const groupedApprovals = useMemo(() => groupBy(approvalInfos, (approval) => approval.spender), [approvalInfos])

  const initialApprovals = useMemo(() => approvalInfos.map((info) => info.amountFormatted), [approvalInfos])

  const formMethods = useForm<ApprovalEditorFormData>({
    defaultValues: {
      approvals: initialApprovals,
    },
    mode: 'onChange',
  })

  const { getValues, reset } = formMethods

  const onSave = () => {
    const formData = getValues('approvals')
    updateApprovals(formData)
    reset({ approvals: formData })
  }

  let fieldIndex = 0

  return (
    <FormProvider {...formMethods}>
      <List className={css.approvalsList}>
        {Object.entries(groupedApprovals).map(([spender, approvals], spenderIdx) => (
          <Box key={spender}>
            <Stack gap={2}>
              {approvals.map((tx) => (
                <ListItem
                  key={tx.tokenAddress + tx.spender}
                  className={0n === tx.amount ? css.zeroValueApproval : undefined}
                  disablePadding
                  data-testid="approval-item"
                >
                  <EditableApprovalItem approval={tx} name={`approvals.${fieldIndex++}`} onSave={onSave} />
                </ListItem>
              ))}
              <SpenderField address={spender} />

              {spenderIdx !== Object.keys(groupedApprovals).length - 1 && <Divider />}
            </Stack>
          </Box>
        ))}
      </List>
    </FormProvider>
  )
}
