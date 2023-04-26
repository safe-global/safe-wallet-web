import { OFAC_SANCTIONS_LIST_URL, SANCTIONED_ADDRESSES } from 'compliance-sdk'

const writeToCache = (url: string, data: string[]) => {
  if (process.env.NODE_ENV !== 'production' && process.env.TEST_SANCTIONED_ADDRESS) {
    data.push(process.env.TEST_SANCTIONED_ADDRESS)
  }
  localStorage.setItem(url, JSON.stringify({ ts: Date.now(), data }))
}

const readFromCache = (url: string) => {
  const cached = localStorage.getItem(url)
  if (cached) {
    return JSON.parse(cached) as { ts: number; data: string[] }
  }
  return null
}

const fetchNewestListAndUpdateCache = async () => {
  const sanctionedAddresses = await fetch(OFAC_SANCTIONS_LIST_URL)
    .then((x) => x.json() as Promise<string[]>)
    .catch(() => SANCTIONED_ADDRESSES)

  writeToCache(
    OFAC_SANCTIONS_LIST_URL,
    sanctionedAddresses.map((x) => x.toLowerCase()),
  )
}

const DAY = 24 * 60 * 60 * 1000

// Make sure cache is always populated
if (typeof localStorage !== 'undefined') {
  if (!readFromCache(OFAC_SANCTIONS_LIST_URL)) {
    writeToCache(
      OFAC_SANCTIONS_LIST_URL,
      SANCTIONED_ADDRESSES.map((x) => x.toLowerCase()),
    )
  }
  // Update it with latest (async)
  void fetchNewestListAndUpdateCache()

  // """Cronjob""" to update the cache
  setInterval(fetchNewestListAndUpdateCache, DAY)
}

export function isSanctionedAddress(address: string): boolean {
  const cache = readFromCache(OFAC_SANCTIONS_LIST_URL)
  return cache!.data.includes(address.toLowerCase())
}
