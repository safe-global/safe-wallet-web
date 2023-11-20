import { useState, useEffect } from 'react'

import useAsync from './useAsync'

import { useWeb3ReadOnly } from './wallets/web3'

export function useBlockTimestamp(interval = 1_000): number | undefined {
  const web3ReadOnly = useWeb3ReadOnly()
  const [timestamp, setTimestamp] = useState<number>()

  const [block] = useAsync(() => {
    return web3ReadOnly?.getBlock('latest')
  }, [web3ReadOnly])

  useEffect(() => {
    if (!block) {
      return
    }

    setTimestamp(block.timestamp)

    const timeout = setInterval(() => {
      setTimestamp((prev) => {
        return prev ? prev + 1 : block.timestamp
      })
    }, interval)

    return () => {
      clearInterval(timeout)
    }
  }, [interval, block])

  return timestamp
}
