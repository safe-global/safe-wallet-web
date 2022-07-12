import palette from '../styles/colors.js'
import spacings from '../styles/spacings.js'
import breakpoints from '../styles/breakpoints.js'

const cssVars: string[] = []
Object.entries(palette).forEach(([key, value]) => {
  Object.entries(value).forEach(([subKey, color]) => {
    cssVars.push(`  --color-${key}-${subKey}: ${color};`)
  })
})

Object.entries(spacings).forEach(([key, space]) => cssVars.push(`  --space-${key}: ${space}px;`))
Object.entries(breakpoints).forEach(([key, breakpoint]) => cssVars.push(`  --breakpoint-${key}: ${breakpoint}px;`))

const css = `/* This file is generated from the MUI theme colors. Do not edit directly. */

:root {
${cssVars.join('\n')}
}
`

console.log(css)
