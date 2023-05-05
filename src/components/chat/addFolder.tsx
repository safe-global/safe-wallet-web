import { Box } from '@mui/material'
import React, { useState } from 'react'

export const AddFolder: React.FC<{
  togglePopup: any
}> = ({ togglePopup }) => {
  const [folderName, setFolderName] = useState<string>('')

  const createFolder = async () => {
    const folders = JSON.parse(localStorage.getItem('folders')!)
    localStorage.setItem('folders', JSON.stringify(folders ? [...folders, `${folderName!}`] : [folderName!]))
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
        backgroundColor: 'black',
      }}
    >
      <h4>Name of folder:</h4>
      <input value={folderName} placeholder={'folder name'} onChange={(e) => setFolderName(e.target.value)} />
      <button onClick={createFolder}>Create Folder</button>
      <button onClick={togglePopup}>Cancel</button>
    </Box>
  )
}
