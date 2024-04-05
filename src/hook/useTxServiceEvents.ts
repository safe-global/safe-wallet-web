import { useEffect } from 'react'
import useSafeAddress from '@/hooks/useSafeAddress'

const API_URL = 'https://sse-proxy.ivan-dbc.workers.dev/'

export function useTxServiceEvents() {
  const safeAddress = useSafeAddress()

  useEffect(() => {
    if (!safeAddress) {
      return
    }
    const eventSource = new EventSource(API_URL + safeAddress)

    eventSource.onmessage = (e) => {
      console.log('TX SERVICE EVENT:', JSON.parse(e.data))
    }

    return () => {
      eventSource.close()
    }
  }, [safeAddress])
}
