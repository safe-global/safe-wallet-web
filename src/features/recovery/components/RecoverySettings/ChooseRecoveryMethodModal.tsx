import Track from '@/components/common/Track'
import { RECOVERY_FEEDBACK_FORM, HelpCenterArticle, SafeAppsTag } from '@/config/constants'
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
import { TxModalContext } from '@/components/tx-flow'
import css from './styles.module.css'
import CheckIcon from '@/public/images/common/check.svg'
import { AppRoutes } from '@/config/routes'
import { useSearchParams } from 'next/navigation'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import TxStatusChip from '@/components/transactions/TxStatusChip'

enum RecoveryMethod {
  SelfCustody = 'SelfCustody',
  Sygnum = 'Sygnum',
}

enum FieldNames {
  recoveryMethod = 'recoveryMethod',
}

type Fields = {
  [FieldNames.recoveryMethod]: RecoveryMethod
}

export function ChooseRecoveryMethodModal({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)
  const querySafe = useSearchParams().get('safe')
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.RECOVERY_SYGNUM)
  const hasSygnumApp = Boolean(matchingApps?.length)

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
                  disabled={!hasSygnumApp}
                  label={
                    <div className={css.method}>
                      <RecoverySygnumIcon style={{ display: 'block' }} />

                      <Typography fontWeight="bold" mb={1} mt={2}>
                        Sygnum Web3 Recovery
                      </Typography>
                      <List className={css.checkList}>
                        <ListItem>
                          <CheckIcon />
                          Your key. Your crypto. Your recovery
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Account recovery by your identity
                        </ListItem>
                        <ListItem>
                          <CheckIcon />
                          Regulated Swiss digital asset bank
                        </ListItem>
                      </List>

                      {!hasSygnumApp && (
                        <Box mt={2.5} sx={{ oopacity: 0.75 }}>
                          <TxStatusChip color="primary">Not available on this network</TxStatusChip>
                        </Box>
                      )}
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
            <Track {...RECOVERY_EVENTS.SYGNUM_APP} label={currentType}>
              <Link
                href={{
                  pathname: AppRoutes.apps.open,
                  query: {
                    safe: querySafe,
                    appUrl: matchingApps?.[0]?.url,
                  },
                }}
                passHref
              >
                <Button variant="contained">Open App</Button>
              </Link>
            </Track>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
