import { createApi } from '@reduxjs/toolkit/query/react'

import { type SafeOverview, getSafeOverviews } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'
import type { RootState } from '.'
import { selectCurrency } from './settingsSlice'
import { type SafeItem } from '@/components/welcome/MyAccounts/useAllSafes'

const noopBaseQuery = async () => ({ data: null })

type SafeOverviewQueueItem = {
  safeAddress: string
  walletAddress?: string
  chainId: string
  currency: string
  callback: (result: { data: SafeOverview | undefined; error?: never } | { data?: never; error: string }) => void
}

const BATCH_SIZE = 5
const FETCH_TIMEOUT = 200

const makeSafeId = (chainId: string, address: string) => `${chainId}:${address}` as `${number}:0x${string}`

class SafeOverviewFetcher {
  private requestQueue: SafeOverviewQueueItem[] = []

  private fetchTimeout: NodeJS.Timeout | null = null

  private async fetchSafeOverviews({
    safeIds,
    walletAddress,
    currency,
  }: {
    safeIds: `${number}:0x${string}`[]
    walletAddress?: string
    currency: string
  }) {
    return await getSafeOverviews(safeIds, {
      trusted: true,
      exclude_spam: true,
      currency,
      wallet_address: walletAddress,
    })
  }

  private async processQueuedItems() {
    // Dequeue the first BATCH_SIZE items
    const nextBatch = this.requestQueue.slice(0, BATCH_SIZE)
    this.requestQueue = this.requestQueue.slice(BATCH_SIZE)

    console.log('[SafeOverviewFetcher] processing Queued Items', nextBatch, [...this.requestQueue])

    let overviews: SafeOverview[]
    try {
      this.fetchTimeout && clearTimeout(this.fetchTimeout)
      this.fetchTimeout = null

      const safeIds = nextBatch.map((request) => makeSafeId(request.chainId, request.safeAddress))
      const { walletAddress, currency } = nextBatch[0]
      overviews = await this.fetchSafeOverviews({ safeIds, currency, walletAddress })
    } catch (err) {
      // Overviews could not be fetched
      nextBatch.forEach((item) => item.callback({ error: 'Could not fetch Safe overview' }))
      return
    }

    nextBatch.forEach((item) => {
      const overview = overviews.find(
        (entry) => sameAddress(entry.address.value, item.safeAddress) && entry.chainId === item.chainId,
      )

      item.callback({ data: overview })
    })
  }

  private enqueueRequest(item: SafeOverviewQueueItem) {
    console.log('[SafeOverviewFetcher] Enqueueing Request', item)

    this.requestQueue.push(item)

    if (this.requestQueue.length >= BATCH_SIZE) {
      this.processQueuedItems()
    }

    // If no timer is running start a timer
    if (this.fetchTimeout === null) {
      this.fetchTimeout = setTimeout(() => {
        console.log('Timeout triggered')
        this.processQueuedItems()
      }, FETCH_TIMEOUT)
    }
  }

  async getOverview(item: Omit<SafeOverviewQueueItem, 'callback'>) {
    return new Promise<SafeOverview | undefined>((resolve, reject) => {
      this.enqueueRequest({
        ...item,
        callback: (result) => {
          console.log('[SafeOverviewFetcher] GetOverview Callback triggered', item, result)
          if ('data' in result) {
            resolve(result.data)
          }
          reject(result.error)
        },
      })
    })
  }
}

const batchedFetcher = new SafeOverviewFetcher()

type MultiOverviewQueryParams = {
  currency: string
  walletAddress?: string
  safes: SafeItem[]
}

export const safeOverviewApi = createApi({
  reducerPath: 'safeOverviewApi',
  baseQuery: noopBaseQuery,
  endpoints: (builder) => ({
    getSafeOverview: builder.query<
      SafeOverview | undefined,
      { safeAddress: string; walletAddress?: string; chainId: string }
    >({
      async queryFn({ safeAddress, walletAddress, chainId }, { getState }) {
        const state = getState()
        const currency = selectCurrency(state as RootState)

        try {
          const safeOverview = await batchedFetcher.getOverview({ chainId, currency, walletAddress, safeAddress })
          return { data: safeOverview }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: (error as Error).message } }
        }
      },
    }),
    getMultipleSafeOverviews: builder.query<SafeOverview[], MultiOverviewQueryParams>({
      async queryFn(params) {
        const { safes, walletAddress, currency } = params

        try {
          const promisedSafeOverviews = safes.map((safe) =>
            batchedFetcher.getOverview({
              chainId: safe.chainId,
              safeAddress: safe.address,
              currency,
              walletAddress,
            }),
          )
          const safeOverviews = await Promise.all(promisedSafeOverviews)
          return { data: safeOverviews.filter(Boolean) as SafeOverview[] }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', data: (error as Error).message } }
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSafeOverviewQuery, useLazyGetSafeOverviewQuery, useGetMultipleSafeOverviewsQuery } =
  safeOverviewApi
