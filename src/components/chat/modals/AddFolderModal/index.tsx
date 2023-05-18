import ModalDialog from '@/components/common/ModalDialog'
import { Box, Button, DialogContent, TextField } from '@mui/material'
import React, { useState } from 'react'

export const AddFolderModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
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
    <ModalDialog open={open} dialogTitle="Create Folder" onClose={onClose}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={5} pt={4} m="auto">
          <TextField
            size="small"
            variant="outlined"
            placeholder={'input folder name to add it or delete it'}
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '16px' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                deleteFolder()
              }}
            >
              Delete
            </Button>
            <Button size="small" variant="contained" onClick={createFolder}>
              Create Folder
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </ModalDialog>
  )
}
