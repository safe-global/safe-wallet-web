import { IconButton, SvgIcon, List, ListItem } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import css from './styles.module.css'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import { ApprovalValueField } from './ApprovalValueField'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import { useMemo } from 'react'
import ApprovalItem from '@/components/tx/ApprovalEditor/ApprovalItem'

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
  const initialApprovals = useMemo(() => approvalInfos.map((info) => info.amountFormatted), [approvalInfos])

  const formMethods = useForm<ApprovalEditorFormData>({
    defaultValues: {
      approvals: initialApprovals,
    },
    mode: 'onChange',
  })

  const {
    formState: { errors, dirtyFields },
    getValues,
    reset,
  } = formMethods

  const onSave = () => {
    const formData = getValues('approvals')
    updateApprovals(formData)
    reset({ approvals: formData })
  }

  return (
    <FormProvider {...formMethods}>
      <List className={css.approvalsList}>
        {approvalInfos.map((tx, idx) => (
          <ListItem
            key={tx.tokenAddress + tx.spender}
            className={0n === tx.amount ? css.zeroValueApproval : undefined}
            disablePadding
            data-testid="approval-item"
          >
            <ApprovalItem spender={tx.spender} method={tx.method}>
              <>
                <ApprovalValueField name={`approvals.${idx}`} tx={tx} />
                <Track {...MODALS_EVENTS.EDIT_APPROVALS}>
                  <IconButton
                    className={css.iconButton}
                    onClick={onSave}
                    disabled={!!errors.approvals || !dirtyFields.approvals?.[idx]}
                    title="Save"
                  >
                    <SvgIcon component={CheckIcon} />
                  </IconButton>
                </Track>
              </>
            </ApprovalItem>
          </ListItem>
        ))}
      </List>
    </FormProvider>
  )
}
