import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import { Grid, Typography, IconButton, SvgIcon, List, ListItem, Alert } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import css from './styles.module.css'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import { ApprovalValueField } from './ApprovalValueField'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import { useMemo } from 'react'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'

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
    <FormProvider {...formMethods}>
      <List className={css.approvalsList}>
        {approvalInfos.map((tx, idx) => (
          <ListItem key={tx.tokenAddress + tx.spender} disablePadding data-testid="approval-item">
            <Alert icon={false} variant="outlined" severity="warning" className={css.alert}>
              <Grid container gap={1} justifyContent="space-between">
                <Grid item display="flex" xs={12} flexDirection="row" alignItems="center" gap={1}>
                  {isReadonly ? (
                    tx.tokenInfo && (
                      <SendAmountBlock amount={initialApprovals[idx]} tokenInfo={tx.tokenInfo} title="Token" />
                    )
                  ) : (
                    <>
                      <ApprovalValueField name={`approvals.${idx}`} tx={tx} readonly={isReadonly} />
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
                  )}
                </Grid>

                <Grid item container display="flex" xs={12} alignItems="center" gap={1}>
                  <Grid item xs={2}>
                    <Typography color="text.secondary" variant="body2">
                      Spender
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Typography fontSize="14px">
                      <PrefixedEthHashInfo address={tx.spender} hasExplorer showAvatar={false} shortAddress={false} />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Alert>
          </ListItem>
        ))}
      </List>
    </FormProvider>
  )
}
