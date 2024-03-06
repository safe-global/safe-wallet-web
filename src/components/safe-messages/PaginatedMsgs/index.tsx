import { Box, Link, SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'

import InfiniteScroll from '@/components/common/InfiniteScroll'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import SkeletonTxList from '@/components/common/PaginatedTxns/SkeletonTxList'
import MsgList from '@/components/safe-messages/MsgList'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { HelpCenterArticle } from '@/config/constants'
import useSafeMessages from '@/hooks/messages/useSafeMessages'
import useSafeInfo from '@/hooks/useSafeInfo'
import LinkIcon from '@/public/images/common/link.svg'
import NoMessagesIcon from '@/public/images/messages/no-messages.svg'

const NoMessages = (): ReactElement => {
  return (
    <PagePlaceholder
      img={<NoMessagesIcon />}
      text={
        <Typography variant="body1" color="primary.light" m={2} maxWidth="600px">
          Some applications allow you to interact with them via off-chain contract signatures (&ldquo;messages&ldquo;)
          that you can generate with your Safe Account.
        </Typography>
      }
    >
      <Link rel="noopener noreferrer" target="_blank" href={HelpCenterArticle.SIGNED_MESSAGES} fontWeight={700}>
        Learn more about off-chain messages{' '}
        <SvgIcon component={LinkIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
      </Link>
    </PagePlaceholder>
  )
}

const MsgPage = ({
  pageUrl,
  onNextPage,
}: {
  pageUrl: string
  onNextPage?: (pageUrl: string) => void
}): ReactElement => {
  const { page, error, loading } = useSafeMessages(pageUrl)

  return (
    <>
      {page && page.results.length > 0 && <MsgList items={page.results} />}

      {page?.results.length === 0 && <NoMessages />}

      {error && <ErrorMessage>Error loading messages</ErrorMessage>}

      {loading && <SkeletonTxList />}

      {page?.next && onNextPage && (
        <Box data-sid="52610" my={4} textAlign="center">
          <InfiniteScroll onLoadMore={() => onNextPage(page.next!)} />
        </Box>
      )}
    </>
  )
}

const PaginatedMsgs = (): ReactElement => {
  const [pages, setPages] = useState<string[]>([''])
  const { safeAddress, safe } = useSafeInfo()

  // Trigger the next page load
  const onNextPage = (pageUrl: string) => {
    setPages((prev) => prev.concat(pageUrl))
  }

  // Reset the pages when the Safe Account changes
  useEffect(() => {
    setPages([''])
  }, [safe.chainId, safeAddress])

  return (
    <Box data-sid="89078" mb={4} position="relative">
      {pages.map((pageUrl, index) => (
        <MsgPage key={pageUrl} pageUrl={pageUrl} onNextPage={index === pages.length - 1 ? onNextPage : undefined} />
      ))}
    </Box>
  )
}

export default PaginatedMsgs
