import { MpcWalletContext } from '@/components/common/ConnectWallet/MPCWalletProvider'
import CopyButton from '@/components/common/CopyButton'
import { Alert, Box, Button, TextField, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'

enum ExportFieldNames {
  password = 'password',
}

type ExportFormData = {
  [ExportFieldNames.password]: string
}

const ExportMPCAccount = () => {
  const { exportPk, walletState } = useContext(MpcWalletContext)

  const [pk, setPk] = useState<string | undefined>()
  const [isExporting, setIsExporting] = useState(false)
  const formMethods = useForm<ExportFormData>({
    mode: 'all',
    defaultValues: {
      [ExportFieldNames.password]: '',
    },
  })
  const { register, formState, handleSubmit } = formMethods

  const onSubmit = async (data: ExportFormData) => {
    try {
      setIsExporting(true)
      const pk = await exportPk(data[ExportFieldNames.password])
      setPk(pk)
    } catch (err) {
    } finally {
      setIsExporting(false)
    }
  }

  const hidePK = () => {
    setPk(undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
        <Typography>
          Accounts created via Google can be exported and imported to any non-custodial wallet outside of Safe.
        </Typography>
        <Alert severity="warning" sx={{ mt: 3, mb: 3 }}>
          Never disclose your keys or seed phrase to anyone. If someone gains access to them, they have full access over
          your signer account.
        </Alert>
        {pk ? (
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            <TextField
              label="Signer account key"
              value={pk}
              type="password"
              InputProps={{ readOnly: true, endAdornment: <CopyButton text={pk} /> }}
            ></TextField>
            <Button color="primary" variant="contained" onClick={hidePK}>
              Hide
            </Button>
          </Box>
        ) : (
          <>
            <TextField
              placeholder="Enter recovery password"
              label="Password"
              type="password"
              error={!!formState.errors[ExportFieldNames.password]}
              helperText={formState.errors[ExportFieldNames.password]?.message}
              {...register(ExportFieldNames.password, {
                required: true,
              })}
            />
            <Button color="primary" variant="contained" disabled={isExporting} type="submit" sx={{ mt: 3 }}>
              Export
            </Button>
          </>
        )}
      </Box>
    </form>
  )
}

export default ExportMPCAccount
