import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'

import css from './styles.module.css'

type SafeAppsTagsProps = {
  tags: string[]
}

const SafeAppsTags = ({ tags = [] }: SafeAppsTagsProps) => {
  return (
    <Stack className={css.safeAppTagContainer} flexDirection="row" gap={1} flexWrap="wrap">
      {tags.map((tag) => (
        <Chip className={css.safeAppTagLabel} key={tag} label={tag} />
      ))}
    </Stack>
  )
}

export default SafeAppsTags
