import FilteredSafes from '@/features/myAccounts/components/FilteredSafes'
import PinnedSafes from '@/features/myAccounts/components/PinnedSafes'
import type { AllSafeItems } from '@/features/myAccounts/hooks/useAllSafesGrouped'
import AllSafes from '@/features/myAccounts/components/AllSafes'

const AccountsList = ({
  searchQuery,
  allSafes,
  onLinkClick,
  isSidebar,
}: {
  searchQuery: string
  allSafes: AllSafeItems
  onLinkClick?: () => void
  isSidebar: boolean
}) => {
  if (searchQuery) {
    return <FilteredSafes searchQuery={searchQuery} allSafes={allSafes} onLinkClick={onLinkClick} />
  }

  return (
    <>
      <PinnedSafes allSafes={allSafes} onLinkClick={onLinkClick} />
      <AllSafes allSafes={allSafes} onLinkClick={onLinkClick} isSidebar={isSidebar} />
    </>
  )
}

export default AccountsList
