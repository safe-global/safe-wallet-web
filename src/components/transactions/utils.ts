type DisabledPropsType =
  | {
      isNext: false
      nonce: number
      isPending: boolean
      hasSafeSDK: boolean
    }
  | {
      isNext?: boolean
      nonce?: number
      isPending: boolean
      hasSafeSDK: boolean
    }

type EnabledTitleType = 'Execute' | 'Replace' | 'Confirm'

export const getTxButtonTooltip = (enabledTitle: EnabledTitleType, disabledProps: DisabledPropsType) => {
  const { isPending, hasSafeSDK, isNext, nonce } = disabledProps

  return isNext === false
    ? `Transaction ${nonce} must be executed first`
    : isPending
    ? 'Pending transaction must first succeed'
    : !hasSafeSDK
    ? 'Waiting for the SDK to initialize'
    : enabledTitle
}
