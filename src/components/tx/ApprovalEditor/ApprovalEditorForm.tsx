import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import NumberField from '@/components/common/NumberField'
import TokenIcon from '@/components/common/TokenIcon'
import { shortenAddress } from '@/utils/formatters'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import { Grid, Typography, Box, IconButton, SvgIcon, Divider, List, ListItem } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import css from './styles.module.css'
import EditIcon from '@/public/images/common/edit.svg'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from '.'
import classnames from 'classnames'

type FormData = {
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
  const [editIDx, setEditIdx] = useState(-1)

  const formMethods = useForm<FormData>({
    defaultValues: {
      approvals: approvalInfos.map((info) => info.amountFormatted),
    },
    mode: 'onChange',
  })

  const {
    register,
    formState: { errors },
    getValues,
  } = formMethods

  const onSetEditing = (idx: number) => {
    setEditIdx(idx)
  }

  const onSave = () => {
    const formData = getValues('approvals')
    !readonly && updateApprovals(formData)
    setEditIdx(-1)
  }

  return (
    <List>
      {approvalInfos.map((tx, idx) => (
        <>
          {idx > 0 && <Divider component="li" variant="middle" />}
          <ListItem disableGutters key={tx.tokenAddress + tx.spender}>
            <Grid container className={css.approval} gap={1} justifyContent="space-between">
              <Grid item display="flex" xs={12} flexDirection="row" alignItems="center" gap={1}>
                <NumberField
                  label={errors.approvals?.[idx]?.message || 'Token'}
                  error={!!errors.approvals?.[idx]}
                  size="small"
                  fullWidth
                  InputProps={{
                    sx: {
                      paddingTop: '4px',
                      paddingBottom: '4px',
                    },
                    readOnly: readonly || editIDx !== idx,
                    startAdornment: (
                      <Box display="flex" flexDirection="row" alignItems="center" gap="4px">
                        <TokenIcon size={32} logoUri={tx.tokenInfo?.logoUri} tokenSymbol={tx.tokenInfo?.symbol} />
                        <Typography>{tx.tokenInfo?.symbol || shortenAddress(tx.tokenAddress)}</Typography>
                      </Box>
                    ),
                  }}
                  inputProps={{
                    className: css.approvalAmount,
                  }}
                  {...register(`approvals.${idx}`, {
                    required: true,
                    validate: (val) => {
                      const decimals = tx.tokenInfo?.decimals
                      return validateAmount(val, true) || validateDecimalLength(val, decimals)
                    },
                  })}
                />
                {readonly ? null : editIDx === idx ? (
                  <IconButton
                    className={classnames(css.iconButton, css.applyIconButton)}
                    onClick={onSave}
                    disabled={!!errors.approvals}
                  >
                    <SvgIcon component={CheckIcon} />
                  </IconButton>
                ) : (
                  <IconButton className={css.iconButton} disabled={editIDx !== -1} onClick={() => onSetEditing(idx)}>
                    <SvgIcon component={EditIcon} />
                  </IconButton>
                )}
              </Grid>

              <Grid item display="flex" xs={12} flexDirection="column">
                <Typography color="text.secondary" variant="body2">
                  Spender
                </Typography>

                <Typography>
                  <PrefixedEthHashInfo address={tx.spender} hasExplorer showAvatar={false} />{' '}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        </>
      ))}
    </List>
  )
}
