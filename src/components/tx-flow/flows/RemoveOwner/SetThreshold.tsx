import type { SelectChangeEvent } from '@mui/material'
import { Box, Button, CardActions, Divider, Grid, MenuItem, Select, SvgIcon, Tooltip, Typography } from '@mui/material'
import type { ReactElement, SyntheticEvent } from 'react'
import { useState } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { TOOLTIP_TITLES } from '@/components/tx-flow/common/constants'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { RemoveOwnerFlowProps } from '.'
import TxCard from '../../common/TxCard'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export const SetThreshold = ({
  params,
  onSubmit,
}: {
  params: RemoveOwnerFlowProps
  onSubmit: (data: RemoveOwnerFlowProps) => void
}): ReactElement => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(params.threshold ?? 1)

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    onSubmit({ ...params, threshold: selectedThreshold })
  }

  const newNumberOfOwners = safe ? safe.owners.length - 1 : 1

  return (
    <TxCard>
      <form onSubmit={onSubmitHandler}>
        <Box data-sid="11981" mb={3}>
          <Typography mb={2}>Review the owner you want to remove from the active Safe Account:</Typography>
          {/* TODO: Update the EthHashInfo style from the replace owner PR */}
          <EthHashInfo address={params.removedOwner.address} shortAddress={false} showCopyButton hasExplorer />
        </Box>

        <Divider className={commonCss.nestedDivider} />

        <Box data-sid="53663" my={3}>
          <Typography variant="h4" fontWeight={700}>
            Threshold
            <Tooltip title={TOOLTIP_TITLES.THRESHOLD} arrow placement="top">
              <span>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  color="border"
                  fontSize="small"
                  sx={{
                    verticalAlign: 'middle',
                    ml: 0.5,
                  }}
                />
              </span>
            </Tooltip>
          </Typography>
          <Typography>Any transaction requires the confirmation of:</Typography>
          <Grid container direction="row" alignItems="center" gap={1} mt={2}>
            <Grid item xs={1.5}>
              <Select value={selectedThreshold} onChange={handleChange} fullWidth>
                {safe.owners.slice(1).map((_, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {idx + 1}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item>
              <Typography>out of {newNumberOfOwners} owner(s)</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider className={commonCss.nestedDivider} />

        <CardActions>
          <Button data-sid="23639" data-testid="next-btn" variant="contained" type="submit">
            Next
          </Button>
        </CardActions>
      </form>
    </TxCard>
  )
}
