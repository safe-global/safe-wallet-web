import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import { Grid, Typography, IconButton, SvgIcon, Divider, List, ListItem } from '@mui/material'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import css from './styles.module.css'
import EditIcon from '@/public/images/common/edit.svg'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import classnames from 'classnames'
import { ApprovalValueField } from './ApprovalValueField'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'

const NO_ID_SELECTED = -1

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
  const readonly = updateApprovals === undefined
  const [editIDx, setEditIdx] = useState(NO_ID_SELECTED)

  const formMethods = useForm<ApprovalEditorFormData>({
    defaultValues: {
      approvals: approvalInfos.map((info) => info.amountFormatted),
    },
    mode: 'onChange',
  })

  const {
    formState: { errors },
    getValues,
  } = formMethods

  const onSetEditing = (idx: number) => {
    setEditIdx(idx)
  }

  const onSave = () => {
    const formData = getValues('approvals')
    !readonly && updateApprovals(formData)
    setEditIdx(NO_ID_SELECTED)
  }

  return (
    <List>
      <FormProvider {...formMethods}>
        {approvalInfos.map((tx, idx) => (
          <div key={tx.tokenAddress + tx.spender}>
            {idx > 0 && <Divider component="li" variant="middle" />}
            <ListItem disableGutters>
              <Grid container className={css.approval} gap={1} justifyContent="space-between">
                <Grid item display="flex" xs={12} flexDirection="row" alignItems="center" gap={1}>
                  <ApprovalValueField name={`approvals.${idx}`} tx={tx} readonly={readonly || editIDx !== idx} />
                  {readonly ? null : editIDx === idx ? (
                    <IconButton
                      className={classnames(css.iconButton, css.applyIconButton)}
                      onClick={onSave}
                      disabled={!!errors.approvals}
                    >
                      <SvgIcon component={CheckIcon} />
                    </IconButton>
                  ) : (
                    <Track {...MODALS_EVENTS.EDIT_APPROVALS}>
                      <IconButton
                        className={css.iconButton}
                        disabled={editIDx !== NO_ID_SELECTED}
                        onClick={() => onSetEditing(idx)}
                      >
                        <SvgIcon component={EditIcon} />
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
