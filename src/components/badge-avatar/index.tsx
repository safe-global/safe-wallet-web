import { Typography } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    height: 30,
    width: 30,
    color: 'hsla(0, 0%, 0%, 1)',
    backgroundColor: 'hsla(166, 65%, 83%, 1)',
    border: `2px solid ${theme.palette.background.paper}`,
    borderRadius: '50%',
  },
}))

const BadgeAvatar = ({ name }: any) => {
  return (
    <Stack direction="row" spacing={2}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={<StyledBadge badgeContent={<Typography variant="caption">3/5</Typography>} />}
      >
        <Avatar alt={name} />
      </Badge>
    </Stack>
  )
}

export default BadgeAvatar
