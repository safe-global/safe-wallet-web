import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import styles from './styles.module.css'

type Props = {
  searchQuery: string
  onSearchQueryChange: (searchQuery: string) => void
}

const SafeAppsHeader = ({ searchQuery, onSearchQueryChange }: Props) => {
  return (
    <div className={styles.header}>
      <Typography variant="h1" sx={{ mt: 5 }}>
        Safe Apps
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Explore endless possibilities to manage your assets.
      </Typography>
      <Grid container rowSpacing={2} columnSpacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={12} md={6} xl={4.5}>
          <TextField
            placeholder="Search"
            variant="filled"
            hiddenLabel
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value)
            }}
            sx={{ width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export { SafeAppsHeader }
