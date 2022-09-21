import { TextField, Grid, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { ReactElement } from 'react'

import PageHeader from '@/components/common/PageHeader'

type Props = {
  searchQuery: string
  onSearchQueryChange: (searchQuery: string) => void
}

const SafeAppsHeader = ({ searchQuery, onSearchQueryChange }: Props): ReactElement => {
  return (
    <PageHeader
      title="Safe Apps"
      subtitle="Explore endless possibilities to manage your assets"
      action={
        <Grid container pb={2} px={3}>
          <Grid item xs={12} sm={9} md={6}>
            <TextField
              placeholder="Search"
              variant="filled"
              hiddenLabel
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      }
    />
  )
}

export { SafeAppsHeader }
