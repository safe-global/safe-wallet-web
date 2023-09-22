import { useContext } from 'react'
import { Button, Grid, IconButton, SvgIcon, TextField, Typography } from '@mui/material'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import type { ReactElement } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import { EnableRecovery } from '@/components/tx-flow/flows/EnableRecovery'
import { TxModalContext } from '@/components/tx-flow'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'

const enum Fields {
  RECOVERERS = 'recoverers',
}

// RHF does not support primitive arrays so we need to use an object
type Form = {
  [Fields.RECOVERERS]: Array<{ address: string }>
}

export const RecoverySetup = (): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)

  const { handleSubmit, control } = useForm<Form>({
    mode: 'all',
    defaultValues: {
      recoverers: [{ address: '' }],
    },
  })

  const { fields, remove, append } = useFieldArray({
    name: Fields.RECOVERERS,
    control,
  })

  const onEnable = (data: Form) => {
    const recoverers = data[Fields.RECOVERERS].map(({ address }) => address)

    setTxFlow(<EnableRecovery recoverers={recoverers} />)
  }
  return (
    <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
      <Grid item lg={4} xs={12}>
        <Typography variant="h4" fontWeight={700}>
          Recovery
        </Typography>
      </Grid>

      <Grid item xs>
        <form onSubmit={handleSubmit(onEnable)}>
          {fields.map((item, i) => (
            <>
              <Controller
                key={item.id}
                name={`${Fields.RECOVERERS}.${i}.address`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField label={`Recoverer ${i + 1}`} error={!!fieldState.error} {...field} fullWidth />
                )}
              />
              {i > 0 && (
                <IconButton onClick={() => remove(i)} aria-label="Remove recoverer">
                  <SvgIcon component={DeleteIcon} inheritViewBox />
                </IconButton>
              )}
            </>
          ))}

          <Button
            variant="text"
            onClick={() => append({ address: '' }, { shouldFocus: true })}
            startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
            size="large"
          >
            Add new owner
          </Button>

          <CheckWallet>
            {(isOk) => (
              <Button type="submit" variant="contained" disabled={!isOk}>
                Enable
              </Button>
            )}
          </CheckWallet>
        </form>
      </Grid>
    </Grid>
  )
}
