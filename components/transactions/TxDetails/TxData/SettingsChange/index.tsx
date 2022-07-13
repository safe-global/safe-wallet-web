import { ReactElement } from 'react'
import { SettingsChange, SettingsInfoType } from '@gnosis.pm/safe-react-gateway-sdk'
import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { ThresholdWarning } from '@/components/transactions/Warning'

type SettingsChangeTxInfoProps = {
  settingsInfo: SettingsChange['settingsInfo']
}

export const SettingsChangeTxInfo = ({ settingsInfo }: SettingsChangeTxInfoProps): ReactElement | null => {
  if (!settingsInfo) {
    return null
  }

  switch (settingsInfo.type) {
    case SettingsInfoType.SET_FALLBACK_HANDLER: {
      return (
        <InfoDetails title="Set fallback handler:">
          <EthHashInfo
            address={settingsInfo.handler.value}
            name={settingsInfo.handler?.name || undefined}
            customAvatar={settingsInfo.handler?.logoUri || undefined}
            shortAddress={false}
            showCopyButton
            hasExplorer
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
            <EthHashInfo
              address={settingsInfo.owner.value}
              name={settingsInfo.owner?.name || undefined}
              customAvatar={settingsInfo.owner?.logoUri || undefined}
              shortAddress={false}
              showCopyButton
              hasExplorer
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
            <EthHashInfo
              address={settingsInfo.oldOwner.value}
              name={settingsInfo.oldOwner?.name || undefined}
              customAvatar={settingsInfo.oldOwner?.logoUri || undefined}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </InfoDetails>
          <InfoDetails title="New owner">
            <EthHashInfo
              address={settingsInfo.newOwner.value}
              name={settingsInfo.newOwner?.name || undefined}
              customAvatar={settingsInfo.newOwner?.logoUri || undefined}
              shortAddress={false}
              showCopyButton
              hasExplorer
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
          <EthHashInfo
            address={settingsInfo.implementation.value}
            name={settingsInfo.implementation?.name || undefined}
            customAvatar={settingsInfo.implementation?.logoUri || undefined}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.ENABLE_MODULE:
    case SettingsInfoType.DISABLE_MODULE: {
      const title = settingsInfo.type === SettingsInfoType.ENABLE_MODULE ? 'Enable module:' : 'Disable module:'
      return (
        <InfoDetails title={title}>
          <EthHashInfo
            address={settingsInfo.module.value}
            name={settingsInfo.module?.name || undefined}
            customAvatar={settingsInfo.module?.logoUri || undefined}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.SET_GUARD: {
      return (
        <InfoDetails title="Set guard:">
          <EthHashInfo
            address={settingsInfo.guard.value}
            name={settingsInfo.guard?.name || undefined}
            customAvatar={settingsInfo.guard?.logoUri || undefined}
            shortAddress={false}
            showCopyButton
            hasExplorer
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
