import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const cgwClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'https://safe-client.safe.global/' }),
  endpoints: () => ({}),
})
