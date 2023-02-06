import type { ReactElement } from 'react'
import { Grid } from '@mui/material'
import styled from '@emotion/styled'
import { FeaturedApps } from '@/components/dashboard/FeaturedApps/FeaturedApps'
import CreationDialog from '@/components/dashboard/CreationDialog'
import { useRouter } from 'next/router'
import Owner from '@/components/dashboard/HomeSidebar/ownerlist'
import Home from '@/pages/chat/chat'

const StyledGrid = styled(Grid)`
    display: flex;
    flex-flow: column;
    gap: 24px;
`

const Dashboard = (): ReactElement => {
  const router = useRouter()
  const { showCreationModal = '' } = router.query

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={8}>
          <Home />
        </Grid>

        <StyledGrid item xs={4}>
          <Owner />
          <FeaturedApps />
        </StyledGrid>
      </Grid>
      {showCreationModal ? <CreationDialog /> : null}
    </>
  )
}

export default Dashboard
