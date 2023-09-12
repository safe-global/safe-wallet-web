import { useEffect, type ReactElement } from 'react'
import classnames from 'classnames'
import type { CheckboxProps } from '@mui/material'
import { Grid, Button, Checkbox, FormControlLabel, Typography, Paper, SvgIcon, Box } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/store'
import { closeCeloDisclaimer, openCeloDisclaimer, selectCeloDisclaimer } from '@/store/popupSlice'

import css from './styles.module.css'
import ExternalLink from '../ExternalLink'
import { CeloDisclaimerType, saveCeloDisclaimerChoice, selectCeloDisclaimerChoices } from '@/store/celoDisclaimerSlice'
import { useDispatch } from 'react-redux'

const ChoiceCheckbox = ({
  checkboxProps,
  label,
  checked,
}: {
  label: string
  checked: boolean
  checkboxProps: CheckboxProps
}) => <FormControlLabel label={label} checked={checked} control={<Checkbox {...checkboxProps} />} sx={{ mt: '-9px' }} />

export const CeloDisclaimerBanner = ({ inverted }: { inverted?: boolean }): ReactElement => {
  const dispatch = useDispatch()
  const celoDisclaimer = useAppSelector(selectCeloDisclaimer)

  const { register, watch, getValues, setValue } = useForm({
    defaultValues: {
      [CeloDisclaimerType.REMIND_ME]: true,
    },
  })

  const handleAccept = () => {
    dispatch(saveCeloDisclaimerChoice(getValues()))
    dispatch(closeCeloDisclaimer())
  }

  const cta = 'I have read the usage disclaimer'
  const checked = watch(CeloDisclaimerType.REMIND_ME)

  return (
    <Paper className={classnames(css.container, { [css.inverted]: inverted })}>
      <Typography align="center" mb={2} color="warning.background" variant="body2">
        <SvgIcon component={WarningIcon} inheritViewBox fontSize="small" color="error" sx={{ mb: -0.4 }} />
        <span className={classnames(css.error)}>Celo Safe is not actively maintained.</span>
      </Typography>

      <form>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="body2" mb={2}>
              Celo is now supported on the{' '}
              <ExternalLink href="https://app.safe.global/welcome?chain=celo" noIcon>
                official Safe app
              </ExternalLink>
              , we <strong>strongly recommend</strong> using it instead on Celo or{' '}
              <strong>you may risk losing funds</strong> in the future as Celo Safe is being deprecated. The only usage
              we actively support is on <strong>Alfajores</strong>.
            </Typography>

            <Grid container alignItems="center" gap={4}>
              <Grid item xs={12} sm>
                <Box>
                  <ChoiceCheckbox
                    checkboxProps={{ ...register(CeloDisclaimerType.REMIND_ME), id: 'later' }}
                    label={'Remind me tomorrow'}
                    checked={checked}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="center" justifyContent="center" mt={4} gap={2}>
              <Grid item>
                <Typography>
                  <Button onClick={handleAccept} variant="text" size="small" color="inherit" disableElevation>
                    {cta}
                  </Button>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

const CeloDisclaimerBannerPopup = (): ReactElement | null => {
  const popup = useAppSelector(selectCeloDisclaimer)
  const disclaimer = useAppSelector(selectCeloDisclaimerChoices)
  const dispatch = useAppDispatch()

  const value = disclaimer[CeloDisclaimerType.REMIND_ME]
  const neverAgain = value === false
  const olderThan24Hrs = (value as number) <= Date.now() - 24 * 60 * 60 * 1000
  const shouldOpen = value === undefined || (!neverAgain && olderThan24Hrs)

  useEffect(() => {
    if (shouldOpen) {
      dispatch(openCeloDisclaimer())
    } else {
      dispatch(closeCeloDisclaimer())
    }
  }, [dispatch, shouldOpen])

  return popup?.open ? (
    <div className={css.popup}>
      <CeloDisclaimerBanner inverted />
    </div>
  ) : null
}

export default CeloDisclaimerBannerPopup
