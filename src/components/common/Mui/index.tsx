import { default as MuiBox, type BoxProps } from '@mui/material/Box'

export * from '@mui/material/index'

export const Box = ({
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  display,
  flex,
  flexGrow,
  flexShrink,
  flexDirection,
  alignItems,
  justifyItems,
  alignContent,
  justifyContent,
  gap,
  color,
  textAlign,
  ...props
}: BoxProps['sx'] & BoxProps) => {
  return (
    <MuiBox
      sx={{
        m,
        mt,
        mr,
        mb,
        ml,
        mx,
        my,
        p,
        pt,
        pr,
        pb,
        pl,
        px,
        py,
        flex,
        flexDirection,
        alignItems,
        justifyItems,
        alignContent,
        justifyContent,
        gap,
      }}
      {...props}
    />
  )
}
