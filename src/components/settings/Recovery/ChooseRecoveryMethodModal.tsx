import { FEEDBACK_FORM, HelpCenterArticle } from '@/config/constants'
import { type ChangeEvent, type ReactElement, useContext } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { UpsertRecoveryFlow } from '@/components/tx-flow/flows/UpsertRecovery'
import ExternalLink from '@/components/common/ExternalLink'
import RecoveryCustomIcon from '@/public/images/common/recovery_custom.svg'
import { TxModalContext } from '@/components/tx-flow'
import css from './styles.module.css'

const SYGNUM_WAITLIST_LINK = 'https://wn2n6ocviur.typeform.com/to/cJbJW0KR'
const COINCOVER_WAITLIST_LINK = 'https://wn2n6ocviur.typeform.com/to/ijqSzOkr'

enum RecoveryMethod {
  SelfCustody = 'SelfCustody',
  Sygnum = 'Sygnum',
  Coincover = 'Coincover',
}

type Fields = {
  recoveryMethod: RecoveryMethod
}

export function ChooseRecoveryMethodModal({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)

  const methods = useForm<Fields>({
    defaultValues: {
      recoveryMethod: RecoveryMethod.SelfCustody,
    },
    mode: 'onChange',
  })
  const { register, watch } = methods

  const currentType = watch('recoveryMethod')

  const trackOptionChoice = (e: ChangeEvent<HTMLInputElement>) => {
    // TODO: Track this event with e.target.value
  }

  return (
    <Dialog open={open} onClose={onClose} className={css.dialog}>
      <DialogTitle display="flex" alignItems="center" sx={{ mb: 2 }}>
        Set up account recovery
        <IconButton onClick={onClose} className={css.closeIcon}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2, px: 3 }}>
        <DialogContentText color="text.primary" mb={4}>
          Ensure that you never lose access to your funds by selecting one of the options below. Want to know how the
          recovery works? Learn more in our <ExternalLink href={HelpCenterArticle.RECOVERY}>Help Center</ExternalLink>
        </DialogContentText>
        <FormControl>
          <RadioGroup defaultValue={RecoveryMethod.SelfCustody} className={css.buttonGroup}>
            <FormControlLabel
              value={RecoveryMethod.SelfCustody}
              control={<Radio {...register('recoveryMethod')} onChange={trackOptionChoice} />}
              label={
                <div className={css.method}>
                  <RecoveryCustomIcon style={{ display: 'block' }} />
                  <Typography fontWeight="bold" mb={1} mt={2}>
                    Self-custodial recovery
                  </Typography>
                  <Typography>Allow your friends and family to recovery your Safe by enabling a module.</Typography>
                </div>
              }
            />

            <FormControlLabel
              value={RecoveryMethod.Sygnum}
              control={<Radio {...register('recoveryMethod')} onChange={trackOptionChoice} />}
              label={
                <div className={css.method}>
                  <RecoveryCustomIcon style={{ display: 'block' }} />
                  <Typography fontWeight="bold" mb={1} mt={2}>
                    Sygnum
                  </Typography>
                  <Typography>Allow your friends and family to recovery your Safe by enabling a module.</Typography>
                </div>
              }
            />

            <FormControlLabel
              value={RecoveryMethod.Coincover}
              control={<Radio {...register('recoveryMethod')} onChange={trackOptionChoice} />}
              label={
                <div className={css.method}>
                  <RecoveryCustomIcon style={{ display: 'block' }} />
                  <Typography fontWeight="bold" mb={1} mt={2}>
                    Coincover
                  </Typography>
                  <Typography>Allow your friends and family to recovery your Safe by enabling a module.</Typography>
                </div>
              }
            />
          </RadioGroup>
        </FormControl>

        <Typography color="primary.light" mt="12px">
          Unhappy with the provided options? <ExternalLink href={FEEDBACK_FORM}>Give us feedback</ExternalLink>
        </Typography>

        <Box display="flex" justifyContent="center" mt={3}>
          {currentType === RecoveryMethod.SelfCustody ? (
            <Button
              variant="contained"
              onClick={() => {
                // TODO: Track an event
                setTxFlow(<UpsertRecoveryFlow />)
                onClose()
              }}
            >
              Set up
            </Button>
          ) : (
            <Link
              href={currentType === RecoveryMethod.Sygnum ? SYGNUM_WAITLIST_LINK : COINCOVER_WAITLIST_LINK}
              target="_blank"
              passHref
            >
              <Button
                variant="contained"
                onClick={() => {
                  // TODO: Track an event
                }}
              >
                Join waitlist
              </Button>
            </Link>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
