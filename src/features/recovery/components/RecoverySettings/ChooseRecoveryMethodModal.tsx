import Track from '@/components/common/Track'
import { RECOVERY_FEEDBACK_FORM, HelpCenterArticle } from '@/config/constants'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { type ChangeEvent, type ReactElement, useContext } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { UpsertRecoveryFlow } from '@/components/tx-flow/flows'
import ExternalLink from '@/components/common/ExternalLink'
import RecoveryCustomIcon from '@/public/images/common/recovery_custom.svg'
import RecoverySygnumIcon from '@/public/images/common/recovery_sygnum.svg'
import RecoveryCoincoverIcon from '@/public/images/common/recovery_coincover.svg'
import { TxModalContext } from '@/components/tx-flow'
import css from './styles.module.css'
import CheckIcon from '@/public/images/common/check.svg'

const SYGNUM_WAITLIST_LINK = 'https://wn2n6ocviur.typeform.com/to/cJbJW0KR'
const COINCOVER_WAITLIST_LINK = 'https://wn2n6ocviur.typeform.com/to/ijqSzOkr'

enum RecoveryMethod {
  SelfCustody = 'SelfCustody',
  Sygnum = 'Sygnum',
  Coincover = 'Coincover',
}

enum FieldNames {
  recoveryMethod = 'recoveryMethod',
}

type Fields = {
  [FieldNames.recoveryMethod]: RecoveryMethod
}

export function ChooseRecoveryMethodModal({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)

  const methods = useForm<Fields>({
    defaultValues: {
      recoveryMethod: RecoveryMethod.SelfCustody,
    },
    mode: 'onChange',
  })
  const { watch, control } = methods

  const currentType = watch(FieldNames.recoveryMethod)

  const trackOptionChoice = (e: ChangeEvent<HTMLInputElement>) => {
    trackEvent({ ...RECOVERY_EVENTS.SELECT_RECOVERY_METHOD, label: e.target.value })
  }

  return (
    <Dialog open={open} onClose={onClose} className={css.dialog}>
      <DialogContent dividers sx={{ py: 2, px: 3 }}>
        <Typography variant="h2" mb={1}>
          Set up Account Recovery
        </Typography>
        <IconButton onClick={onClose} className={css.closeIcon}>
          <CloseIcon />
        </IconButton>
        <DialogContentText color="text.primary" mb={4}>
          Ensure that you never lose access to your funds by selecting one of the options below. Want to know how
          recovery works? Learn more in our{' '}
          <Track {...RECOVERY_EVENTS.LEARN_MORE} label="method-modal">
            <ExternalLink href={HelpCenterArticle.RECOVERY}>Help Center</ExternalLink>
          </Track>
        </DialogContentText>
        <FormControl>
          <Controller
            control={control}
            name={FieldNames.recoveryMethod}
            render={({ field }) => (
              <RadioGroup
                {...field}
                className={css.buttonGroup}
                onChange={(e) => {
                  field.onChange(e)
                  trackOptionChoice(e)
                }}
              >
                <FormControlLabel
                  value={RecoveryMethod.SelfCustody}
                  control={<Radio />}
                  label={
                    <div className={css.method}>
                      <RecoveryCustomIcon style={{ display: 'block' }} />
                      <Typography fontWeight="bold" mb={1} mt={2}>
                        Self Custodial Recovery
                      </Typography>
                      <List className={css.checkList}>
                        <ListItem>
                          <CheckIcon />
                          Fully own your recovery setup
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Nominate anyone including friends, family or yourself
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          No additional cost and ensured privacy
                        </ListItem>
                      </List>
                    </div>
                  }
                />

                <FormControlLabel
                  value={RecoveryMethod.Sygnum}
                  control={<Radio />}
                  label={
                    <div className={css.method}>
                      <RecoverySygnumIcon style={{ display: 'block' }} />
                      <Typography fontWeight="bold" mb={1} mt={2}>
                        Sygnum
                      </Typography>
                      <List className={css.checkList}>
                        <ListItem>
                          <CheckIcon />
                          Regulated Swiss digital asset bank
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Ensure you (and only you) can recover
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Simple and efficient
                        </ListItem>
                      </List>
                    </div>
                  }
                />

                <FormControlLabel
                  value={RecoveryMethod.Coincover}
                  control={<Radio />}
                  label={
                    <div className={css.method}>
                      <RecoveryCoincoverIcon style={{ display: 'block' }} />
                      <Typography fontWeight="bold" mb={1} mt={2}>
                        Coincover
                      </Typography>
                      <List className={css.checkList}>
                        <ListItem>
                          <CheckIcon />
                          World&apos;s #1 Recovery Solution
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Protected by Biometrics
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Lloyd’s of London Backed Tech
                        </ListItem>
                      </List>
                    </div>
                  }
                />
              </RadioGroup>
            )}
          />
        </FormControl>
        <Typography color="primary.light" mt="12px">
          Unhappy with the provided options?{' '}
          <Track {...RECOVERY_EVENTS.GIVE_US_FEEDBACK} label="method-modal">
            <ExternalLink href={RECOVERY_FEEDBACK_FORM}>Give us feedback</ExternalLink>
          </Track>
        </Typography>
        <Box display="flex" justifyContent="center" mt={3}>
          {currentType === RecoveryMethod.SelfCustody ? (
            <Track {...RECOVERY_EVENTS.CONTINUE_WITH_RECOVERY} label={currentType}>
              <Button
                data-testid="setup-btn"
                variant="contained"
                onClick={() => {
                  setTxFlow(<UpsertRecoveryFlow />)
                  onClose()
                }}
              >
                Set up
              </Button>
            </Track>
          ) : (
            <Track {...RECOVERY_EVENTS.CONTINUE_TO_WAITLIST} label={currentType}>
              <Link
                href={currentType === RecoveryMethod.Sygnum ? SYGNUM_WAITLIST_LINK : COINCOVER_WAITLIST_LINK}
                target="_blank"
                passHref
              >
                <Button variant="contained">Join waitlist</Button>
              </Link>
            </Track>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
