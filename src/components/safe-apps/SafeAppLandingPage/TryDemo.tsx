import { CTA_BUTTON_WIDTH, CTA_HEIGHT } from '@/components/safe-apps/SafeAppLandingPage/constants'
import DemoAppSVG from '@/public/images/apps/apps-demo.svg'
import { Box, Button, Typography } from '@mui/material'
import type { LinkProps } from 'next/link'
import Link from 'next/link'

type Props = {
  demoUrl: LinkProps['href']
  onClick(): void
}

const TryDemo = ({ demoUrl, onClick }: Props) => (
  <Box
    data-sid="20633"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="space-between"
    height={CTA_HEIGHT}
  >
    <Typography variant="h5" fontWeight={700}>
      Try the Safe App before using it
    </Typography>
    <DemoAppSVG alt="An icon of a internet browser" />
    <Link href={demoUrl} passHref legacyBehavior>
      <Button data-sid="73365" variant="outlined" sx={{ width: CTA_BUTTON_WIDTH }} onClick={onClick}>
        Try demo
      </Button>
    </Link>
  </Box>
)

export { TryDemo }
