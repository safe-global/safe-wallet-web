import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import css from './styles.module.css'

const TxStatusWidget = () => {
  return (
    <Paper>
      <div className={css.header}>
        <img src="/images/logo-no-text.svg" alt="Safe logo" width="32px" />
        <Typography variant="h6" fontWeight="700">
          Transaction status
        </Typography>
      </div>
      <Divider />
      <Box className={css.content}>
        <List className={css.signers}>
          <ListItem>
            <ListItemIcon>
              <CreatedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Confirmed (0 of 4)</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Execute</ListItemText>
          </ListItem>
        </List>
      </Box>
    </Paper>
  )
}

export default TxStatusWidget
