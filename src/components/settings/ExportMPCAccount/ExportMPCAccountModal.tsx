import { MpcWalletContext } from '@/components/common/ConnectWallet/MPCWalletProvider'
import CopyButton from '@/components/common/CopyButton'
import ModalDialog from '@/components/common/ModalDialog'
import { Box, Button, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Visibility, VisibilityOff, Close } from '@mui/icons-material'
import css from './styles.module.css'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { logError } from '@/services/exceptions'
import ErrorMessage from '@/components/tx/ErrorMessage'

enum ExportFieldNames {
  password = 'password',
  pk = 'pk',
}

type ExportFormData = {
  [ExportFieldNames.password]: string
  [ExportFieldNames.pk]: string | undefined
}

const ExportMPCAccountModal = ({ onClose, open }: { onClose: () => void; open: boolean }) => {
  const { exportPk } = useContext(MpcWalletContext)
  const [error, setError] = useState<string>()

  const [showPassword, setShowPassword] = useState(false)
  const formMethods = useForm<ExportFormData>({
    mode: 'all',
    defaultValues: {
      [ExportFieldNames.password]: '',
    },
  })
  const { register, formState, handleSubmit, setValue, watch, reset } = formMethods

  const exportedKey = watch(ExportFieldNames.pk)

  const onSubmit = async (data: ExportFormData) => {
    try {
      setError(undefined)
      const pk = await exportPk(data[ExportFieldNames.password])
      setValue(ExportFieldNames.pk, pk)
    } catch (err) {
      logError(ErrorCodes._305, err)
      setError('Error exporting account. Your entered password might be invalid.')
    }
  }

  const handleClose = () => {
    setError(undefined)
    reset()
    onClose()
  }
  return (
    <ModalDialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Export your account
        </Typography>
      </DialogTitle>
      <IconButton className={css.close} aria-label="close" onClick={handleClose} size="small">
        <Close fontSize="large" />
      </IconButton>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start" sx={{ width: '100%' }}>
            <Typography>For security reasons you have to enter your password to reveal your account key.</Typography>

            {exportedKey ? (
              <Box display="flex" flexDirection="row" alignItems="center" gap={1} width="100%">
                <TextField
                  fullWidth
                  multiline={showPassword}
                  maxRows={3}
                  label="Private key"
                  type="password"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <>
                        <IconButton size="small" onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                        <CopyButton text={exportedKey} />
                      </>
                    ),
                  }}
                  {...register(ExportFieldNames.pk)}
                />
              </Box>
            ) : (
              <>
                <TextField
                  placeholder="Password"
                  label="Password"
                  type="password"
                  fullWidth
                  error={!!formState.errors[ExportFieldNames.password]}
                  helperText={formState.errors[ExportFieldNames.password]?.message}
                  {...register(ExportFieldNames.password, {
                    required: true,
                  })}
                />
              </>
            )}
            {error && <ErrorMessage className={css.modalError}>{error}</ErrorMessage>}

            <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
              <Button variant="outlined" onClick={handleClose}>
                Close
              </Button>
              {exportedKey === undefined && (
                <Button color="primary" variant="contained" disabled={formState.isSubmitting} type="submit">
                  Export
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </DialogContent>
    </ModalDialog>
  )
}

export default ExportMPCAccountModal
