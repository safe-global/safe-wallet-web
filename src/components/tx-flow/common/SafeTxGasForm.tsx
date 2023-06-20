import { useContext, useState } from 'react'
import { Link, TextField, Box } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { SafeTxContext } from '../SafeTxProvider'

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
    <Box display="flex" alignItems="center" gap={1}>
      {editing ? (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <TextField
              size="small"
              autoComplete="off"
              sx={{ width: '6em' }}
              {...formMethods.register('safeTxGas')}
              onBlur={formMethods.handleSubmit(onSubmit)}
            />
          </form>
        </FormProvider>
      ) : (
        <>
          {safeTxGas}

          {isEditable && (
            <Link component="button" onClick={() => setEditing(true)} fontSize="small">
              Edit
            </Link>
          )}
        </>
      )}
    </Box>
  )
}

export default SafeTxGasForm
