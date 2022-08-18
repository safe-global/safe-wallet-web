const isKeystoneError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return err.message?.startsWith('#ktek_error')
  }
  return false
}

const isWCRejection = (err: Error): boolean => {
  return /User rejected/.test(err?.message)
}

const isMMRejection = (err: Error & { code?: number }): boolean => {
  const METAMASK_REJECT_CONFIRM_TX_ERROR_CODE = 4001

  return err.code === METAMASK_REJECT_CONFIRM_TX_ERROR_CODE
}

export const isWalletRejection = (err: Error & { code?: number }): boolean => {
  return isMMRejection(err) || isWCRejection(err) || isKeystoneError(err)
}
