import type { NextPage } from 'next'
import { Grid, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import useSafeInfo from '@/hooks/useSafeInfo'
import useIsGranted from '@/hooks/useIsGranted'

const Owner: NextPage = () => {
  const { safe } = useSafeInfo()
  const isGranted = useIsGranted()

  return (
    <>
        <Paper sx={{ p: 4 }}>
          <OwnerList isGranted={isGranted} />
        </Paper>
    </>
  )
}

export default Owner
