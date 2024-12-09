import Link from 'next/link'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { default as MuiLink } from '@mui/material/Link'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import { SafeAppSocialPlatforms } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeAppData, SafeAppSocialProfile } from '@safe-global/safe-gateway-typescript-sdk'

import DiscordIcon from '@/public/images/common/discord-icon.svg'
import css from './styles.module.css'
import Stack from '@mui/material/Stack'

type SafeAppSocialLinksCardProps = {
  safeApp: SafeAppData
}

const SafeAppSocialLinksCard = ({ safeApp }: SafeAppSocialLinksCardProps) => {
  const { socialProfiles, developerWebsite } = safeApp

  const hasSocialLinks = socialProfiles?.length > 0

  if (!hasSocialLinks && !developerWebsite) {
    return null
  }

  const discordSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.DISCORD)
  const twitterSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.TWITTER)
  const githubSocialLink = getSocialProfile(socialProfiles, SafeAppSocialPlatforms.GITHUB)

  return (
    <Card className={css.container}>
      <Stack alignItems="center" spacing={1} component="a">
        {/* Team Link section */}
        <div className={css.questionMarkIcon}>
          <HelpOutlineRoundedIcon color="info" />
        </div>
        <div>
          <Typography fontWeight="bold" variant="subtitle1">
            Something wrong with the Safe App?
          </Typography>
          <Typography color="primary.light" variant="body2">
            Get in touch with the team
          </Typography>
        </div>
      </Stack>

      <Stack className={css.socialLinksSectionContainer} spacing={4}>
        {/* Social links section */}
        {hasSocialLinks && (
          <div>
            <Typography color="border.main" variant="body2" pl={1}>
              Social Media
            </Typography>

            <Stack mt={0.2} minHeight="40px">
              {discordSocialLink && (
                <IconButton aria-label="Discord link" component="a" target="_blank" href={discordSocialLink.url}>
                  <DiscordIcon />
                </IconButton>
              )}

              {twitterSocialLink && (
                <IconButton aria-label="Twitter link" component="a" target="_blank" href={twitterSocialLink.url}>
                  <TwitterIcon color="border" />
                </IconButton>
              )}

              {githubSocialLink && (
                <IconButton
                  aria-label="Github link"
                  component="a"
                  href={githubSocialLink.url}
                  target="_blank"
                  style={{ height: '40px', width: '40px' }}
                >
                  <GitHubIcon color="border" />
                </IconButton>
              )}
            </Stack>
          </div>
        )}

        {hasSocialLinks && developerWebsite && (
          <Divider sx={{ height: '40px' }} orientation="vertical" component="div" />
        )}

        {/* Developer website section */}
        {developerWebsite && (
          <Stack>
            <Typography color="border.main" variant="body2">
              Website
            </Typography>

            <Link
              href={developerWebsite}
              passHref
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              legacyBehavior
            >
              <MuiLink target="_blank" className={css.websiteLink} underline="hover" fontWeight="bold" mt={1.2}>
                {developerWebsite}
              </MuiLink>
            </Link>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

export default SafeAppSocialLinksCard

const getSocialProfile = (socialProfiles: SafeAppSocialProfile[], platform: SafeAppSocialPlatforms) => {
  const socialLink = socialProfiles.find((socialProfile) => socialProfile.platform === platform)

  return socialLink
}
