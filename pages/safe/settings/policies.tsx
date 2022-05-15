import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/services/useSafeInfo'
import type { NextPage } from 'next'

const Policies: NextPage = () => {
  const { safe } = useSafeInfo()
  const ownerLength = safe?.owners.length ?? 0
  const threshold = safe?.threshold ?? 0

  return (
    <main>
      <h2>Settings / Policies</h2>
      <RequiredConfirmation threshold={threshold} owners={ownerLength} />
    </main>
  )
}

export default Policies
