import { Box, Card, CardContent, Chip, Link, SvgIcon, Typography, Skeleton } from '@mui/material'

import LinkIconBold from '@/public/images/sidebar/link-bold.svg'
import useSafeSnapshot from '@/components/dashboard/SnapshotWidget/useSafeSnapshot'
import type { SnapshotProposal } from '@/components/dashboard/SnapshotWidget/useSafeSnapshot'

import css from './styles.module.css'

export const _getProposalNumber = (title: string): string => {
  // Find anything that matches "SEP #n"
  const SEP_REGEX = /SEP\s\#\d+/g
  return title.match(SEP_REGEX)?.[0] || ''
}

export const _getProposalTitle = (title: string): string => {
  // Find anything after "] " or ": "
  const TITLE_REGEX = /(\]|\:) (.*)/
  return title.match(TITLE_REGEX)?.at(-1) || ''
}

const LinkIcon = () => <SvgIcon component={LinkIconBold} inheritViewBox fontSize="small" className={css.icon} />

const SnapshotProposals = ({ proposals }: { proposals: SnapshotProposal[] }) => (
  <>
    {proposals?.map((proposal) => (
      <a
        href={`${SNAPSHOT_LINK}/proposal/${proposal.id}`}
        key={proposal.id}
        target="_blank"
        rel="noopener noreferrer"
        className={css.proposal}
      >
        <Box gridArea="number">
          <Chip label={_getProposalNumber(proposal.title)} className={css.number} />
        </Box>
        <Box gridArea="title" className={css.title}>
          <Typography>{_getProposalTitle(proposal.title)}</Typography>
        </Box>
        <Box gridArea="status">
          <Chip
            label={proposal.state}
            sx={{
              backgroundColor: proposal.state === 'active' ? 'success.main' : '#743EE4',
            }}
            className={css.status}
          />
        </Box>
        <Box gridArea="link">
          <LinkIcon />
        </Box>
      </a>
    ))}
  </>
)

const SNAPSHOT_LINK = 'https://snapshot.org/#/safe.eth'
const FORUM_LINK = 'https://forum.gnosis-safe.io'

const SnapshotWidget = () => {
  const PROPOSAL_AMOUNT = 3

  const [proposals, _, loading] = useSafeSnapshot(PROPOSAL_AMOUNT)

  return (
    <Card>
      <CardContent>
        <Typography component="h2" variant="subtitle1" className={css.header}>
          Latest proposals
        </Typography>
        <div className={css.proposals}>
          {loading || !proposals ? (
            Array.from(Array(PROPOSAL_AMOUNT).keys()).map((key) => (
              <Skeleton key={key} variant="rectangular" className={css.skeleton} />
            ))
          ) : (
            <SnapshotProposals proposals={proposals} />
          )}
        </div>
        <div className={css.links}>
          <Link href={SNAPSHOT_LINK} rel="noreferrer noopener" target="_blank" variant="subtitle1" className={css.link}>
            View all <LinkIcon />
          </Link>
          <Link href={FORUM_LINK} rel="noreferrer noopener" target="_blank" variant="subtitle1" className={css.link}>
            SafeDAO Forum <LinkIcon />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default SnapshotWidget
