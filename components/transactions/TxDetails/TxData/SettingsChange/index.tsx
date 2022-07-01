import { ReactElement, ReactNode } from 'react'
import { SettingsChange, SettingsInfoType } from '@gnosis.pm/safe-react-gateway-sdk'
import { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import { Alert, Tooltip, Typography } from '@mui/material'
import css from './styles.module.css'

interface Props {
  settingsInfo: SettingsChange['settingsInfo']
}

type InfoDetailsProps = {
  children?: ReactNode
  title: string | ReactElement
}

const ThresholdWarning = (): ReactElement => (
  <Tooltip
    title="This transaction potentially alters the number of confirmations required to execute a transaction."
    placement="top-start"
    arrow
  >
    <Alert
      className={css.alert}
      sx={({ palette }) => ({
        color: palette.black[500],
        background: palette.orange[200],
        borderLeft: `3px solid ${palette.orange[500]}`,

        '&.MuiAlert-standardInfo .MuiAlert-icon': {
          marginRight: '8px',
          color: palette.orange[500],
        },
      })}
      severity="info"
    >
      <b>Confirmation policy change</b>
    </Alert>
  </Tooltip>
)

export const InfoDetails = ({ children, title }: InfoDetailsProps): ReactElement => (
  <div className={css.container}>
    <Typography variant="body1" fontWeight="bold">
      {title}
    </Typography>
    {children}
  </div>
)

export const SettingsChangeTxInfo = ({ settingsInfo }: Props): ReactElement | null => {
  if (!settingsInfo) {
    return null
  }

  switch (settingsInfo.type) {
    case SettingsInfoType.SET_FALLBACK_HANDLER: {
      return (
        <InfoDetails title="Set fallback handler:">
          <AddressInfo
            address={settingsInfo.handler.value}
            name={settingsInfo.handler?.name || undefined}
            avatarUrl={settingsInfo.handler?.logoUri || undefined}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.ADD_OWNER:
    case SettingsInfoType.REMOVE_OWNER: {
      const title = settingsInfo.type === SettingsInfoType.ADD_OWNER ? 'Add owner:' : 'Remove owner:'
      return (
        <>
          <ThresholdWarning />
          <InfoDetails title={title}>
            <AddressInfo
              address={settingsInfo.owner.value}
              name={settingsInfo.owner?.name || undefined}
              avatarUrl={settingsInfo.owner?.logoUri || undefined}
            />
            <InfoDetails title="Increase/decrease confirmation policy to:">{settingsInfo.threshold}</InfoDetails>
          </InfoDetails>
        </>
      )
    }
    case SettingsInfoType.SWAP_OWNER: {
      return (
        <InfoDetails title="Swap owner:">
          <InfoDetails title="Old owner">
            <AddressInfo
              address={settingsInfo.oldOwner.value}
              name={settingsInfo.oldOwner?.name || undefined}
              avatarUrl={settingsInfo.oldOwner?.logoUri || undefined}
            />
          </InfoDetails>
          <InfoDetails title="New owner">
            <AddressInfo
              address={settingsInfo.newOwner.value}
              name={settingsInfo.newOwner?.name || undefined}
              avatarUrl={settingsInfo.newOwner?.logoUri || undefined}
            />
          </InfoDetails>
        </InfoDetails>
      )
    }
    case SettingsInfoType.CHANGE_THRESHOLD: {
      return (
        <>
          <ThresholdWarning />
          <InfoDetails title="Increase/decrease confirmation policy to:">{settingsInfo.threshold}</InfoDetails>
        </>
      )
    }
    case SettingsInfoType.CHANGE_IMPLEMENTATION: {
      return (
        <InfoDetails title="Change implementation:">
          <AddressInfo
            address={settingsInfo.implementation.value}
            name={settingsInfo.implementation?.name || undefined}
            avatarUrl={settingsInfo.implementation?.logoUri || undefined}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.ENABLE_MODULE:
    case SettingsInfoType.DISABLE_MODULE: {
      const title = settingsInfo.type === SettingsInfoType.ENABLE_MODULE ? 'Enable module:' : 'Disable module:'
      return (
        <InfoDetails title={title}>
          <AddressInfo
            address={settingsInfo.module.value}
            name={settingsInfo.module?.name || undefined}
            avatarUrl={settingsInfo.module?.logoUri || undefined}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.SET_GUARD: {
      return (
        <InfoDetails title="Set guard:">
          <AddressInfo
            address={settingsInfo.guard.value}
            name={settingsInfo.guard?.name || undefined}
            avatarUrl={settingsInfo.guard?.logoUri || undefined}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.DELETE_GUARD: {
      return <InfoDetails title="Delete guard" />
    }
    default:
      return <></>
  }
}

export default SettingsChangeTxInfo
