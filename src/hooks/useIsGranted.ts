import useIsWrongChain from './useIsWrongChain'
import useIsSafeOwner from './useIsSafeOwner'

const useIsGranted = () => {
  const isWrongChain = useIsWrongChain()
  const isOwner = useIsSafeOwner()

  return isOwner && !isWrongChain
}

export default useIsGranted
