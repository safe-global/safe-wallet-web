import { useQuery } from 'urql'
import { Typography, Box, Grid, Chip } from '@mui/material'
import { Card, StyledContainer, WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import ClaimTokensCard from '@/components/dashboard/GovernanceSection/ClaimTokensCard'

const SNAPSHOT_SPACE = 'gnosis.eth'

const GovernanceSection = () => (
  <Grid item xs={12} md>
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Governance
      </Typography>

      <WidgetBody>
        <Grid gap="24px" container>
          <Grid minWidth="200px" item xs md>
            <ClaimTokensCard />
          </Grid>
          <Grid minWidth="200px" item xs md>
            <SnapshotCard />
          </Grid>
        </Grid>
      </WidgetBody>
    </WidgetContainer>
  </Grid>
)

type ProposalType = {
  proposals: Array<Record<string, string>>
}

const ProposalsQuery = `
  query {
    proposals (first: 5,
    skip: 0,
    where: {
      space_in: ["${SNAPSHOT_SPACE}"],
    },
    orderBy: "created",
    orderDirection: desc)
    {
      id
      title
      state
      author
    }
  }
`

const SnapshotCard = () => {
  const [result] = useQuery<ProposalType>({
    query: ProposalsQuery,
  })

  const { data, fetching, error } = result

  if (error) return <p>Error fetching data... {error.message}</p>
  if (fetching) return <p>Loading...</p>

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
    >
      <Box mt={2} mb={4} justifyContent="center" display="flex">
        <img src="/images/common/snapshot-icon.png" alt="snapshot icon" width="24px" />
        <Typography variant="h3">
          <strong>snapshot</strong>
        </Typography>
      </Box>
      {data?.proposals.map((proposal, idx) => {
        // TODO: for demo purposes only. remove next line before open PR
        proposal = { ...proposal, state: idx % 2 === 0 ? 'active' : 'closed' }
        const { id, title, state } = proposal
        return (
          <StyledContainer key={proposal.id}>
            <a
              href={`https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Grid container py={1} px={2} alignItems="top" gap={1}>
                <Grid xs={8} item>
                  <Typography fontSize="lg" component="span">
                    {title}
                  </Typography>
                </Grid>
                <Grid xs={3} item>
                  <Chip
                    label={state}
                    color={`${state === 'closed' ? 'error' : 'success'}`}
                    sx={{ pointerEvents: 'none' }}
                  />
                </Grid>
              </Grid>
            </a>
          </StyledContainer>
        )
      })}
    </Card>
  )
}

export default GovernanceSection
