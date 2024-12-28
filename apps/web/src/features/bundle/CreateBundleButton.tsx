import CreateBundle from '@/features/bundle/components/CreateBundle'
import { useState } from 'react'
import { Button } from '@mui/material'

const CreateBundleButton = () => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <Button size="small" variant="contained" onClick={() => setOpen(true)}>
        Create Bundle
      </Button>

      <CreateBundle open={open} setOpen={setOpen} />
    </>
  )
}

export default CreateBundleButton
