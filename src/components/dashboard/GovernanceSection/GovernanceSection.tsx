import { useQuery } from 'urql'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import styled from '@emotion/styled'

import { Card, WidgetBody, WidgetContainer } from '../styled'

const StyledGrid = styled(Grid)`
  gap: 24px;
`

const StyledGridItem = styled(Grid)`
  min-width: 300px;
`

const GovernanceSection = () => {
  return (
    <>
      <WidgetContainer>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Governance
        </Typography>

        <WidgetBody>
          <StyledGrid container>
            <StyledGridItem item xs md>
              <ClaimTokensCard />
            </StyledGridItem>
            <StyledGridItem item xs md>
              <SnapshotCard />
            </StyledGridItem>
          </StyledGrid>
        </WidgetBody>
      </WidgetContainer>
    </>
  )
}

export default GovernanceSection

const ClaimTokensCard = () => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box mt={2} mb={4} justifyContent="center">
        <Typography variant="h3">
          <strong>7338,87 SAFE</strong>
        </Typography>
      </Box>
      <Box mt={2} mb={4}>
        <Typography>delegated to</Typography>
      </Box>
      <Button variant="contained" size="small">
        Claim
      </Button>
    </Card>
  )
}

type ProposalType = {
  proposals: {
    id: string
    title: string
    state: string
    author: string
  }[]
}

const SnapshotCard = () => {
  const ProposalsQuery = `
    query {
      proposals (first: 5,
      skip: 0,
      where: {
        space_in: ["gnosis.eth"],
        state: "closed"
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

  const [result] = useQuery<ProposalType>({
    query: ProposalsQuery,
  })

  const { data, fetching, error } = result
  console.log('data', data)

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Oh no... {error.message}</p>

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box mt={2} mb={4} justifyContent="center">
        <Typography variant="h3">
          <strong>snapshot</strong>
        </Typography>
      </Box>
      <StyledContainer>
        {data?.proposals.map((proposal) => {
          console.log(proposal)
          return (
            <Grid container py={1} px={2} alignItems="center" gap={1} key={proposal.id}>
              <Typography fontSize="lg" component="span">
                {proposal.title}
              </Typography>

              <Typography fontSize="lg" component="span">
                {proposal.state}
              </Typography>
            </Grid>
          )
        })}
      </StyledContainer>
    </Card>
  )
}

const StyledContainer = styled.div`
  width: 100%;
  text-decoration: none;
  background-color: var(--color-background-paper);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  box-sizing: border-box;
  &:hover {
    background-color: var(--color-background-light);
    border-color: var(--color-secondary-light);
  }
`
