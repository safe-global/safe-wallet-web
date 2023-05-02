import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import { Grid, Typography, IconButton, SvgIcon, Divider, List, ListItem } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import css from './styles.module.css'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import { ApprovalValueField } from './ApprovalValueField'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import { useMemo } from 'react'

export type ApprovalEditorFormData = {
  approvals: string[]
}

export const ApprovalEditorForm = ({
  approvalInfos,
  updateApprovals,
}: {
  approvalInfos: ApprovalInfo[]
  updateApprovals?: (newApprovals: string[]) => void
}) => {
  const isReadonly = updateApprovals === undefined
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
    if (isReadonly) return
    const formData = getValues('approvals')
    updateApprovals(formData)
    reset({ approvals: formData })
  }

  return (
    <List className={css.approvalsList}>
      <FormProvider {...formMethods}>
        {approvalInfos.map((tx, idx) => (
          <div key={tx.tokenAddress + tx.spender}>
            {idx > 0 && <Divider component="li" variant="middle" />}
            <ListItem disableGutters>
              <Grid container className={css.approval} gap={1} justifyContent="space-between">
                <Grid item display="flex" xs={12} flexDirection="row" alignItems="center" gap={1}>
                  {/* Input */}
                  <ApprovalValueField name={`approvals.${idx}`} tx={tx} readonly={isReadonly} />

                  {/* Save button */}
                  {!isReadonly && (
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
                  )}
                </Grid>

                <Grid item display="flex" xs={12} flexDirection="column">
                  <Typography color="text.secondary" variant="body2">
                    Spender
                  </Typography>

                  <Typography fontSize="14px">
                    <PrefixedEthHashInfo address={tx.spender} hasExplorer showAvatar={false} />{' '}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          </div>
        ))}
      </FormProvider>
    </List>
  )
}
