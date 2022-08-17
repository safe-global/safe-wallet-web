import type { NextPage } from 'next'

import { useThemeMode } from '@gnosis.pm/safe-react-components'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { ThemeProvider } from '@emotion/react'

const DemoTheme: NextPage = () => {
  const { theme, switchThemeMode, themeMode } = useThemeMode()

  return (
    <main>
      <ThemeProvider theme={theme}>
        <Card>
          <CardContent>
            <Stack direction="column" spacing={4}>
              <Stack spacing={2} direction="row" alignItems="center">
                {/* dark mode switch */}
                <Typography>{themeMode} mode</Typography>
                <Button onClick={switchThemeMode} color="inherit">
                  {
                    themeMode === 'light'
                      ? 'Light' // light theme mode icon
                      : 'Dark' // dark theme mode icon
                  }
                </Button>
              </Stack>

              <div>
                {/* Typography demo */}
                <Typography variant="h1">H1 Title</Typography>
                <Typography variant="h2">H2 Title</Typography>
                <Typography variant="h3">H3 Title</Typography>
                <Typography variant="h4">H4 Title</Typography>
                <Typography variant="h5">H5 Title</Typography>
                <Typography variant="h6">H6 Title</Typography>
                <Typography>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum cum expedita, officiis fugiat et
                  veritatis recusandae voluptate eligendi tempora laudantium. Molestias aliquam eveniet eum iure rem
                  exercitationem quibusdam eos quae!
                </Typography>
              </div>

              <Stack spacing={2} direction="column" alignItems={'flex-start'}>
                {/* TextField demo */}
                <Typography variant="h5">TextField</Typography>
                <TextField id="outlined-basic-theme-mode" label={`Textfield in ${themeMode} mode`} variant="outlined" />
                <TextField variant="filled" label={`Filled Textfield in ${themeMode} mode`} />
              </Stack>

              {/* Buttons demo */}
              <Typography variant="h5">Buttons</Typography>
              <Stack spacing={2} direction="row">
                <Button>Text</Button>
                <Button variant="contained">Contained</Button>
                <Button variant="outlined">Outlined</Button>
              </Stack>

              <Stack spacing={2} direction="row">
                <Button variant="text" color="secondary">
                  Text
                </Button>
                <Button variant="contained" color="secondary">
                  Contained
                </Button>
                <Button variant="outlined" color="secondary">
                  Outlined
                </Button>
              </Stack>

              <Stack spacing={2} direction="row">
                <Button variant="text" color="error">
                  Delete
                </Button>
                <Button variant="contained" color="error">
                  Delete
                </Button>
                <Button variant="outlined" color="error">
                  Delete
                </Button>
              </Stack>

              <Stack spacing={2} direction="row" maxWidth={150}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Currency</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Currency"
                    defaultValue="USD"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="ARS">ARS</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack spacing={2} direction="column" alignItems={'flex-start'}>
                <Typography variant="h5">Tooltip</Typography>
                <Tooltip title="Tooltip! :D" arrow placement="top">
                  <Button>Hover!</Button>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </ThemeProvider>
    </main>
  )
}

export default DemoTheme
