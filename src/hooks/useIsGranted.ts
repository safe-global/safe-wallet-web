import useIsSafeOwner from './useIsSafeOwner'

const useIsGranted = () => {
  const isOwner = useIsSafeOwner()

  return isOwner
}

export default useIsGranted
