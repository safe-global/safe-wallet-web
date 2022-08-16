import { ReactElement } from 'react'
import { Alert, Link } from '@mui/material'
import { tooltipClasses } from '@mui/material/Tooltip'
import css from './styles.module.css'
import CustomTooltip from '@/components/common/CustomTooltip'

const UNEXPECTED_DELEGATE_ARTICLE =
  'https://help.gnosis-safe.io/en/articles/6302452-why-do-i-see-an-unexpected-delegate-call-warning-in-my-transaction'

export const DelegateCallWarning = ({ showWarning }: { showWarning: boolean }): ReactElement => (
  <CustomTooltip
    sx={{
      [`& .${tooltipClasses.arrow}`]: {
        left: '-46px !important', // place the arrow over the Alert icon
      },
    }}
    title={
      <>
        This transaction calls a smart contract that will be able to modify your Safe.
        {showWarning && (
          <>
            <br />
            <Link href={UNEXPECTED_DELEGATE_ARTICLE} rel="noopener noreferrer" target="_blank">
              Learn more
            </Link>
          </>
        )}
      </>
    }
    placement="top-start"
    arrow
  >
    <Alert
      className={css.alert}
      sx={({ palette }) => ({
        color: showWarning ? palette.warning.dark : palette.success.main,
        backgroundColor: `${showWarning ? palette.warning.light : palette.success.background}`,
        border: 0,
        borderLeft: `3px solid ${showWarning ? palette.warning.dark : palette.success.main}`,

        '&.MuiAlert-standardInfo .MuiAlert-icon': {
          marginRight: '8px',
          color: `${showWarning ? palette.warning.dark : palette.success.main}`,
        },
      })}
      severity="info"
    >
      <b>{showWarning ? 'Unexpected Delegate Call' : 'Delegate Call'}</b>
    </Alert>
  </CustomTooltip>
)

export const ThresholdWarning = (): ReactElement => (
  <CustomTooltip
    sx={{
      [`& .${tooltipClasses.arrow}`]: {
        left: '-93px !important', // place the arrow over the Alert icon
      },
    }}
    title="This transaction potentially alters the number of confirmations required to execute a transaction."
    placement="top-start"
    arrow
  >
    <Alert
      className={css.alert}
      sx={({ palette }) => ({
        color: palette.secondary.main,
        background: palette.warning.light,
        borderLeft: `3px solid ${palette.warning.dark}`,

        '&.MuiAlert-standardInfo .MuiAlert-icon': {
          marginRight: '8px',
          color: palette.warning.dark,
        },
      })}
      severity="info"
    >
      <b>Confirmation policy change</b>
    </Alert>
  </CustomTooltip>
)
