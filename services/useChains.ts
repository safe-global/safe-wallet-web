import { useEffect } from 'react'
import { useAppDispatch } from 'store'
import { fetchChains } from 'store/chainsSlice'

const useChains = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchChains())
  }, [])
}

export default useChains
