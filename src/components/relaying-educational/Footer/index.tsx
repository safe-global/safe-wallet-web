import { Box, Button } from '@mui/material'

type ButtonProps = {
  label: string
  cb?: () => void
}

type FooterProps = {
  back?: ButtonProps
  next?: ButtonProps
  justifyContent: 'space-between' | 'flex-start' | 'flex-end'
}

const Footer = ({ back, next, justifyContent }: FooterProps) => {
  return (
    <Box display="flex" flexDirection="row" justifyContent={justifyContent} mt={5}>
      {back ? (
        <Button variant="outlined" size="stretched" onClick={back.cb}>
          {back.label}
        </Button>
      ) : null}
      {next ? (
        <Button variant="contained" size="stretched" onClick={next.cb}>
          {next.label}
        </Button>
      ) : null}
    </Box>
  )
}

export default Footer
