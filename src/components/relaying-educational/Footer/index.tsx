import { Box, Button } from '@mui/material'

type ButtonProps = {
  label: string
  cb?: () => void
}

type FooterProps = {
  back?: ButtonProps
  next: ButtonProps
}

const Footer = ({ back, next }: FooterProps) => {
  return (
    <Box display="flex" flexDirection="row-reverse" justifyContent="space-between" mt={5}>
      <Button variant="contained" size="stretched" onClick={next.cb}>
        {next.label}
      </Button>
      {back ? (
        <Button variant="outlined" size="stretched" onClick={back.cb}>
          {back.label}
        </Button>
      ) : null}
    </Box>
  )
}

export default Footer
