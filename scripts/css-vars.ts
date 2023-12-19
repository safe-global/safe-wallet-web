import lightPalette from '../src/components/theme/lightPalette'
import darkPalette from '../src/components/theme/darkPalette'
import spacings from '../src/styles/spacings.js'

const cssVars: string[] = []
Object.entries(lightPalette).forEach(([key, value]) => {
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

/* The same as above for the brief moment before JS loads */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    ${darkColorVars.join('\n')}
  }
}
`

console.log(css)
