import { AddOwner } from '@/components/chat/AddOwner'
import ellipsisAddress from '@/utils/ellipsisAddress'
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material'
import React from 'react'

interface TypeMembers {
  members: any[]
}

const Members: React.FC<TypeMembers> = ({ members }) => {
  return (
    <>
      <Box sx={{ pt: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600 }}>Members</Typography>
        <AddOwner />
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
