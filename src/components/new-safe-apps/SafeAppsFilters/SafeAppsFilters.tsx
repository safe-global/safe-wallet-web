import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SvgIcon from '@mui/material/SvgIcon'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'

import SearchIcon from '@/public/images/common/search.svg'
import BatchIcon from '@/public/images/apps/batch-icon.svg'
import css from './styles.module.css'

export type safeAppCatogoryOptionType = {
  label: string
  value: string
}

type SafeAppsFiltersProps = {
  onChangeQuery: (newQuery: string) => void
  onChangeFilterCategory: (newCategory: safeAppCatogoryOptionType[]) => void
  onChangeOptimizedWithBatch: (optimizedWithBatch: boolean) => void
}

const SafeAppsFilters = ({
  onChangeQuery,
  onChangeFilterCategory,
  onChangeOptimizedWithBatch,
}: SafeAppsFiltersProps) => {
  return (
    <Grid container spacing={2} className={css.filterContainer}>
      <Grid item xs={12} md={6} xl={4}>
        {/* Search by name */}
        <TextField
          id="search-by-name"
          placeholder="Search by name or category"
          aria-label="Search Safe App by name"
          variant="filled"
          hiddenLabel
          onChange={(e) => {
            onChangeQuery(e.target.value)
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon component={SearchIcon} inheritViewBox color="border" />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          fullWidth
          size="small"
          sx={{
            '& > .MuiInputBase-root': { padding: '8px 16px' },
          }}
        />
      </Grid>

      {/* Select Category */}
      <Grid item xs={6} md={3} xl={3}>
        <Autocomplete
          multiple
          limitTags={0}
          id="checkboxes-tags-demo"
          aria-label="Filter by Safe App catagory"
          options={safeAppsCategories}
          onChange={(e, value) => {
            onChangeFilterCategory(value)
          }}
          // hide selected options Component (Chip MUI Component)
          ChipProps={{
            sx: { display: 'none' },
          }}
          getLimitTagsText={(more) => `${more} category selected`}
          disableCloseOnSelect
          getOptionLabel={(option) => option.label}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.label}
            </li>
          )}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label={'Category'}
              placeholder="Select category"
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Grid>

      {/* Optimized with Batch Transaction */}
      <Grid item xs={6} md={3} xl={3}>
        <FormControl variant="standard">
          <FormLabel>Optimized with</FormLabel>
          <FormControlLabel
            control={<Checkbox />}
            onChange={(e, value) => {
              onChangeOptimizedWithBatch(value)
            }}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>Batch transactions</span> <BatchIcon />
              </Box>
            }
          />
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default SafeAppsFilters

export const safeAppsCategories = [
  {
    label: 'NFT',
    value: 'nft',
  },
  {
    label: 'Dashboard',
    value: 'dashboard-widgets',
  },
  {
    label: 'Transaction Builder',
    value: 'transaction-builder',
  },
  {
    label: 'Wallet Connect',
    value: 'wallet-connect',
  },
  {
    label: 'Safe Claiming App',
    value: 'safe-claiming-app',
  },

  // defined in the designs
  {
    label: 'Accounting',
    value: 'accounting',
  },
  {
    label: 'Agregator',
    value: 'agregator',
  },
  {
    label: 'Automation',
    value: 'automation',
  },
  {
    label: 'Derivatives',
    value: 'derivatives',
  },
  {
    label: 'Bridge',
    value: 'bridge',
  },
  {
    label: 'CeFI',
    value: 'cefi',
  },
  {
    label: 'DEX',
    value: 'dex',
  },
  {
    label: 'DeFI',
    value: 'defi',
  },
  {
    label: 'Donation',
    value: 'donation',
  },
  {
    label: 'Fundraising',
    value: 'fundraising',
  },
  {
    label: 'Governance',
    value: 'governance',
  },
  {
    label: 'Infrastructure',
    value: 'infrastructure',
  },
  {
    label: 'Insurance',
    value: 'insurance',
  },
  {
    label: 'Tokenlaunchpad',
    value: 'tokenlaunchpad',
  },
  {
    label: 'Lending/Borrowing',
    value: 'lending-borrowing',
  },
  {
    label: 'Marketplace',
    value: 'marketplace',
  },
  {
    label: 'Payments',
    value: 'payments',
  },
  {
    label: 'Safe',
    value: 'safe',
  },
  {
    label: 'DAO Tooling',
    value: 'dao-tooling',
  },
  {
    label: 'Stablecoin',
    value: 'stablecoin',
  },
  {
    label: 'Staking',
    value: 'staking',
  },
  {
    label: 'Tooling',
    value: 'tooling',
  },
  {
    label: 'Yield',
    value: 'yield',
  },
]
