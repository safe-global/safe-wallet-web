import type { ReactElement } from 'react'
import { Alert, Link, SvgIcon, Tooltip } from '@mui/material'
import { tooltipClasses } from '@mui/material/Tooltip'
import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

const UNEXPECTED_DELEGATE_ARTICLE =
  'https://help.gnosis-safe.io/en/articles/6302452-why-do-i-see-an-unexpected-delegate-call-warning-in-my-transaction'

export const DelegateCallWarning = ({ showWarning }: { showWarning: boolean }): ReactElement => {
  const severity = showWarning ? 'warning' : 'success'
  return (
    <Tooltip
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
        sx={{ borderLeft: ({ palette }) => `3px solid ${palette[severity].main}` }}
        severity={severity}
        icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color={severity} />}
      >
        <b>{showWarning ? 'Unexpected delegate call' : 'Delegate call'}</b>
      </Alert>
    </Tooltip>
  )
}

export const ThresholdWarning = (): ReactElement => (
  <Tooltip
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
      sx={{ borderLeft: ({ palette }) => `3px solid ${palette.warning.main}` }}
      severity="warning"
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color="warning" />}
    >
      <b>Confirmation policy change</b>
    </Alert>
  </Tooltip>
)
