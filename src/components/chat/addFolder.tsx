import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'

export const AddFolder: React.FC<{
  togglePopup: any
}> = ({ togglePopup }) => {
  const [folderName, setFolderName] = useState<string>('')

  const createFolder = async () => {
    const folders = JSON.parse(localStorage.getItem('folders')!)
    localStorage.setItem('folders', JSON.stringify(folders ? [...folders, `${folderName!}`] : [folderName!]))
    window.dispatchEvent(new Event('storage'))
  }

  const deleteFolder = async () => {
    const folders = JSON.parse(localStorage.getItem('folders')!)
    localStorage.setItem('folders', JSON.stringify(folders.filter((folder: string) => folder !== folderName)))
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <Box
      sx={{
        zIndex: '10000',
        position: 'fixed',
        marginTop: '40vh',
        marginLeft: '30vw',
        height: '20vh',
        width: '30vw',
        p: 3,
        backgroundColor: 'black',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4">Create Folder</Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              togglePopup()
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          size="small"
          variant="outlined"
          placeholder={'input folder name to add it or delete it'}
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: '16px' }}>
          <Button size="small" variant="contained" onClick={createFolder}>
            Create Folder
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              togglePopup()
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
