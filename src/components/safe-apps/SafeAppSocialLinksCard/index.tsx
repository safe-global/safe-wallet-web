import Link from 'next/link'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
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
      <Box
        component="a"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Team Link section */}
        <div className={css.questionMarkIcon}>
          <HelpOutlineRoundedIcon color="info" />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
            }}
          >
            Something wrong with the Safe App?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'primary.light',
            }}
          >
            Get in touch with the team
          </Typography>
        </div>
      </Box>
      <Box
        className={css.socialLinksSectionContainer}
        sx={{
          display: 'flex',
          gap: 4,
        }}
      >
        {/* Social links section */}
        {hasSocialLinks && (
          <div>
            <Typography
              variant="body2"
              sx={{
                color: 'border.main',
                paddingLeft: 1,
              }}
            >
              Social Media
            </Typography>

            <Box
              sx={{
                display: 'flex',
                mt: 0.2,
                minHeight: '40px',
              }}
            >
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
            </Box>
          </div>
        )}

        {hasSocialLinks && developerWebsite && (
          <Divider sx={{ height: '40px' }} orientation="vertical" component="div" />
        )}

        {/* Developer website section */}
        {developerWebsite && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'border.main',
              }}
            >
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
          </Box>
        )}
      </Box>
    </Card>
  )
}

export default SafeAppSocialLinksCard

const getSocialProfile = (socialProfiles: SafeAppSocialProfile[], platform: SafeAppSocialPlatforms) => {
  const socialLink = socialProfiles.find((socialProfile) => socialProfile.platform === platform)

  return socialLink
}
