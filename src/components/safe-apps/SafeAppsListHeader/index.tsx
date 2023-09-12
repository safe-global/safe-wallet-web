import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControl from '@mui/material/FormControl'

import GridViewIcon from '@/public/images/apps/grid-view-icon.svg'
import ListViewIcon from '@/public/images/apps/list-view-icon.svg'
import { GRID_VIEW_MODE, LIST_VIEW_MODE } from '@/components/safe-apps/SafeAppCard'
import type { SafeAppsViewMode } from '@/components/safe-apps/SafeAppCard'
import css from './styles.module.css'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'

type SafeAppsListHeaderProps = {
  amount?: number
  safeAppsViewMode: SafeAppsViewMode
  setSafeAppsViewMode: (viewMode: SafeAppsViewMode) => void
}

const SafeAppsListHeader = ({ amount, safeAppsViewMode, setSafeAppsViewMode }: SafeAppsListHeaderProps) => {
  return (
    <Stack display="flex" flexDirection="row" justifyContent="space-between">
      {/* Safe Apps count */}
      <Typography variant="body2" color="primary.light" mb={2} mt={1.5} fontSize="12px" letterSpacing="0.4px">
        ALL ({amount || 0})
      </Typography>

      {/* switch Safe Apps view mode radio buttons */}
      <FormControl>
        <RadioGroup
          value={safeAppsViewMode}
          aria-label="safe apps view mode selector"
          name="safe-apps-view-mode"
          sx={{ flexDirection: 'row' }}
          onChange={(_, viewMode) => {
            trackEvent({ ...SAFE_APPS_EVENTS.SWITCH_LIST_VIEW, label: viewMode })
            setSafeAppsViewMode(viewMode as SafeAppsViewMode)
          }}
        >
          {/* Grid view radio button */}
          <Radio
            value={GRID_VIEW_MODE}
            disableRipple
            color="default"
            checkedIcon={<GridViewIcon />}
            icon={<GridViewIcon className={css.gridView} />}
            sx={{ padding: '4px' }}
            inputProps={{
              'aria-label': 'Grid view mode',
            }}
          />
          {/* Grid view radio button */}
          <Radio
            value={LIST_VIEW_MODE}
            disableRipple
            color="default"
            checkedIcon={<ListViewIcon />}
            icon={<ListViewIcon className={css.listView} />}
            sx={{ padding: '4px' }}
            inputProps={{
              'aria-label': 'List view mode',
            }}
          />
        </RadioGroup>
      </FormControl>
    </Stack>
  )
}

export default SafeAppsListHeader
