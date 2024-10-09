/* eslint-disable */
/**
 * This script generates the possible names for the SafeFontIcon component
 */

const fs = require('fs')
const path = require('path')

const selectionFilePath = path.join(__dirname, '../assets/fonts/safe-icons/selection.json')

// Read the selection.json file
const selection = JSON.parse(fs.readFileSync(selectionFilePath, 'utf8'))

// Get the icon names
const iconNames = selection.icons.map((icon) => icon.icon.tags[0]).filter(Boolean)

// Create TypeScript union type
const typeDef = `export type IconName =\n  ${iconNames.map((name) => `| '${name}'`).join('\n  ')}\n`

// Create an array of icon names
const arrayDef = `export const iconNames: IconName[] = [\n  ${iconNames.map((name) => `'${name}'`).join(',\n  ')},\n]`

// Write the type definition to a file
fs.writeFileSync(path.join(__dirname, '../src/types/iconTypes.ts'), `${typeDef}\n${arrayDef}\n`)

console.log('Icon type and Icon names generated')
