import { useContext, useState } from 'react'
import { Link, TextField, Box, Paper, Button } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

const SafeTxGasForm = () => {
  const { safeTx, safeTxGas, setSafeTxGas } = useContext(SafeTxContext)
  const isEditable = safeTx?.signatures.size === 0
  const [editing, setEditing] = useState(false)

  const formMethods = useForm<{ safeTxGas: number }>({
    defaultValues: {
      safeTxGas,
    },
    mode: 'onChange',
  })

  const onSubmit = (values: { safeTxGas: number }) => {
    setSafeTxGas(values.safeTxGas || 0)
    setEditing(false)
  }

  return (
    <Box display="flex" alignItems="center" gap={1} position="relative">
      <>
        {safeTxGas}

        {isEditable && (
          <Link component="button" onClick={() => setEditing(true)} fontSize="small">
            Edit
          </Link>
        )}
      </>

      {editing && (
        <Paper sx={{ position: 'absolute', zIndex: 2, p: 1, ml: -3 }} elevation={3}>
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} style={{ display: 'flex' }}>
              <TextField
                size="small"
                autoComplete="off"
                autoFocus
                type="number"
                error={!!formMethods.formState.errors.safeTxGas}
                sx={{ width: '7em' }}
                {...formMethods.register('safeTxGas', {
                  valueAsNumber: true,
                  min: 0,
                  setValueAs: Math.round,
                })}
              />
              <Button type="submit" size="small" variant="contained" sx={{ ml: 1 }}>
                Save
              </Button>
            </form>
          </FormProvider>
        </Paper>
      )}
    </Box>
  )
}

export default SafeTxGasForm
