import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { GATEWAY_URL } from '@/src/config/constants'

export const cgwClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: GATEWAY_URL }),
  endpoints: () => ({}),
})
