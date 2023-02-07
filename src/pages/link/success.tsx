import { Paper, Stack, SvgIcon, Typography } from '@mui/material'
import CheckIcon from '@/public/images/common/circle-check.svg'
import * as React from 'react'

interface ISuccessPageProps {}

const Check = () => (
  <SvgIcon
    component={CheckIcon}
    inheritViewBox
    sx={{ width: '50px', height: '50px', '& path:last-of-type': { fill: ({ palette }) => palette.background.paper } }}
  />
)

const SuccessPage: React.FunctionComponent<ISuccessPageProps> = (props) => {
  return (
    <Stack mt={5} alignItems="center">
      <Paper sx={{ p: '30px' }}>
        <Stack alignItems="center" spacing={4}>
          <Check />
          <Typography>Setup successfully</Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default SuccessPage
