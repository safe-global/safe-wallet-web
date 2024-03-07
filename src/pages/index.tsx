import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { isEmpty } from 'lodash'
import local from '@/services/local-storage/local'
import type { AddedSafesState } from '@/store/addedSafesSlice'

const ADDED_SAFES_KEY = 'addedSafes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query

  useEffect(() => {
    if (!router.isReady || router.pathname !== AppRoutes.index) {
      return
    }
    // TODO: Replace with useLocalStorage. For now read directly from localstorage so we have value on first render
    const addedSafes = local.getItem<AddedSafesState>(ADDED_SAFES_KEY)
    const hasAddedSafes = addedSafes !== null && !isEmpty(addedSafes)
    const pathname = hasAddedSafes ? AppRoutes.welcome.accounts : AppRoutes.welcome.index

    router.replace({
      pathname,
      query: chain ? { chain } : undefined,
    })
  }, [router, chain])

  return <></>
}

export default IndexPage
