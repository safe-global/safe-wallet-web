import { executeSponsoredCall, type SponsoredCallPayload } from '@/services/tx/sponsoredCall'

const useSponsoredCall = () => {
  const sponsoredCall = async (params: SponsoredCallPayload) => {
    try {
      const data = await executeSponsoredCall(params)
      console.log('data', data)
    } catch (error) {
      console.error(error)
    }
  }

  return { sponsoredCall }
}

export default useSponsoredCall
