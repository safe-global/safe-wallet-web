import { MpcWalletContext } from '@/components/common/ConnectWallet/MPCWalletProvider'
import CopyButton from '@/components/common/CopyButton'
import ModalDialog from '@/components/common/ModalDialog'
import { Box, Button, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Visibility, VisibilityOff, Close } from '@mui/icons-material'
import css from './styles.module.css'

enum ExportFieldNames {
  password = 'password',
}

type ExportFormData = {
  [ExportFieldNames.password]: string
}

const ExportMPCAccountModal = ({ onClose, open }: { onClose: () => void; open: boolean }) => {
  const { exportPk } = useContext(MpcWalletContext)

  const [pk, setPk] = useState<string | undefined>()
  const [isExporting, setIsExporting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const formMethods = useForm<ExportFormData>({
    mode: 'all',
    defaultValues: {
      [ExportFieldNames.password]: '',
    },
  })
  const { register, formState, handleSubmit, setValue } = formMethods

  const onSubmit = async (data: ExportFormData) => {
    try {
      setIsExporting(true)
      const pk = await exportPk(data[ExportFieldNames.password])
      setPk(pk)
    } catch (err) {
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setValue(ExportFieldNames.password, '')
    setPk(undefined)
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

            {pk ? (
              <Box display="flex" flexDirection="row" alignItems="center" gap={1} width="100%">
                <TextField
                  fullWidth
                  multiline={showPassword}
                  maxRows={3}
                  label="Private key"
                  value={pk}
                  type="password"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <>
                        <IconButton size="small" onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                        <CopyButton text={pk} />
                      </>
                    ),
                  }}
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
            <Box
              mt={3}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Button variant="outlined" onClick={handleClose}>
                Close
              </Button>
              {pk === undefined && (
                <Button color="primary" variant="contained" disabled={isExporting} type="submit">
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
