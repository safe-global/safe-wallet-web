import palette from '../src/styles/colors.js'
import darkPalette from '../src/styles/colors-dark.js'
import spacings from '../src/styles/spacings.js'

const cssVars: string[] = []
Object.entries(palette).forEach(([key, value]) => {
  Object.entries(value).forEach(([subKey, color]) => {
    cssVars.push(`  --color-${key}-${subKey}: ${color};`)
  })
})

Object.entries(spacings).forEach(([key, space]) => cssVars.push(`  --space-${key}: ${space}px;`))

const darkColorVars: string[] = []
Object.entries(darkPalette).forEach(([key, value]) => {
  Object.entries(value).forEach(([subKey, color]) => {
    darkColorVars.push(`  --color-${key}-${subKey}: ${color};`)
  })
})

const css = `/* This file is generated from the MUI theme colors. Do not edit directly. */

:root {
${cssVars.join('\n')}
}

[data-theme="dark"] {
${darkColorVars.join('\n')}
}
`

console.log(css)
