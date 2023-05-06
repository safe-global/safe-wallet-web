import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material'
import React from 'react'
import ellipsisAddress from '@/utils/ellipsisAddress'
import { AddOwnerDialog } from '@/components/settings/owner/AddOwnerDialog'

interface TypeMembers {
  members: any[]
}

const Members: React.FC<TypeMembers> = ({ members }) => {
  return (
    <>
      <Box sx={{ pt: 3, pl: 3 }}>
        <Typography sx={{ fontWeight: 500 }}>Members</Typography>
        <AddOwnerDialog />
      </Box>
      <List sx={{ pl: 1 }}>
        {members.map((member, index) => (
          <ListItem key={member.value}>
            <ListItemAvatar sx={{ minWidth: 35 }}>
              <Avatar sx={{ width: 24, height: 24 }} alt={member.value} />
            </ListItemAvatar>
            <ListItemText primary={ellipsisAddress(`${member.value}`)} />
          </ListItem>
        ))}
      </List>
    </>
  )
}

export default Members
