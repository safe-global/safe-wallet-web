import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import NumberField from '@/components/common/NumberField'
import TokenIcon from '@/components/common/TokenIcon'
import { shortenAddress } from '@/utils/formatters'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import { Grid, Typography, Box, IconButton, SvgIcon } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import css from './styles.module.css'
import EditIcon from '@/public/images/common/edit.svg'
import CheckIcon from '@mui/icons-material/Check'
import type { ApprovalInfo } from '.'

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
    <Grid container direction="column">
      {approvalInfos.map((tx, idx) => (
        <Grid
          container
          key={tx.tokenAddress + tx.spender}
          className={css.approval}
          gap={1}
          justifyContent="space-between"
        >
          <Grid item display="flex" xs={12} md={3} flexDirection="column">
            <Typography variant="overline">Token</Typography>
            <Box display="flex" flexDirection="row" alignItems="center" gap="4px">
              <TokenIcon logoUri={tx.tokenInfo?.logoUri} tokenSymbol={tx.tokenInfo?.symbol} />
              <Typography>{tx.tokenInfo?.symbol || shortenAddress(tx.tokenAddress)}</Typography>
            </Box>
          </Grid>
          <Grid item display="flex" xs={12} md flexDirection="column">
            {readonly ? (
              <>
                <Typography variant="overline">Amount</Typography>
                <Typography>{tx.amountFormatted}</Typography>
              </>
            ) : (
              <NumberField
                label={errors.approvals?.[idx]?.message || 'Amount'}
                error={!!errors.approvals?.[idx]}
                size="small"
                disabled={editIDx !== idx}
                InputProps={{
                  endAdornment:
                    (editIDx === -1 || idx === editIDx) &&
                    (editIDx === idx ? (
                      <IconButton size="small" onClick={onSave} disabled={!!errors.approvals}>
                        <SvgIcon component={CheckIcon} />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={() => onSetEditing(idx)}>
                        <SvgIcon component={EditIcon} />
                      </IconButton>
                    )),
                }}
                {...register(`approvals.${idx}`, {
                  required: true,
                  validate: (val) => {
                    const decimals = tx.tokenInfo?.decimals
                    return validateAmount(val, true) || validateDecimalLength(val, decimals)
                  },
                })}
              />
            )}
          </Grid>

          <Grid item display="flex" xs={4} flexDirection="column">
            <Typography variant="overline">Spender</Typography>

            <Typography>
              <PrefixedEthHashInfo address={tx.spender} hasExplorer showAvatar={false} />{' '}
            </Typography>
          </Grid>
        </Grid>
      ))}
    </Grid>
  )
}
