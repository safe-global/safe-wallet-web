import type { NextPage } from 'next'
import Head from 'next/head'
import CreateSafe from '@/components/create-safe'
import { useRouter } from 'next/router'
import useABTesting from '@/services/tracking/useABTesting'
import { AbTest } from '@/services/tracking/abTesting'
import { useLayoutEffect } from 'react'
import { AppRoutes } from '@/config/routes'

const Open: NextPage = () => {
  const shouldUseNewCreation = useABTesting(AbTest.SAFE_CREATION)
  const router = useRouter()

  useLayoutEffect(() => {
    if (shouldUseNewCreation) {
      router.replace(AppRoutes.newSafe.create)
    }
  }, [router, shouldUseNewCreation])

  if (shouldUseNewCreation) {
    return <></>
  }

  return (
    <main>
      <Head>
        <title>Safe – Create Safe</title>
      </Head>

      <CreateSafe />
    </main>
  )
}

export default Open
