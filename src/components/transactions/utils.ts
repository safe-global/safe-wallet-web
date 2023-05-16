type DisabledPropsType = {
  isNext?: boolean
  nonce?: number
  hasSafeSDK: boolean
}

type EnabledTitleType = 'Execute' | 'Replace' | 'Confirm'

export const getTxButtonTooltip = (enabledTitle: EnabledTitleType, disabledProps: DisabledPropsType) => {
  const { hasSafeSDK, isNext, nonce } = disabledProps

  return isNext === false ? `Transaction ${nonce} must be executed first` : !hasSafeSDK ? 'Loading' : enabledTitle
}
