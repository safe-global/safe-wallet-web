import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'

import css from './styles.module.css'

type SafeAppTagsProps = {
  tags: string[]
}

const SafeAppTags = ({ tags = [] }: SafeAppTagsProps) => {
  return (
    <Stack className={css.safeAppTagContainer} flexDirection="row" gap={1} flexWrap="wrap">
      {tags.map((tag) => (
        <Chip className={css.safeAppTagLabel} key={tag} label={tag} />
      ))}
    </Stack>
  )
}

export default SafeAppTags
