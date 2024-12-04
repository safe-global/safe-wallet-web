import fs from 'fs'
import path from 'path'
import glob from 'glob'

const directory = path.join('src/services/**/*.tsx')

// Function to process a single file
const processFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')

    const updatedContent = fileContent.replace(
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@mui\/material['"]/g,
      (_, importedComponents) => {
        return importedComponents
          .split(',')
          .map((component) => component.trim())
          .filter((component) => component) // Remove any empty strings
          .map((component) => `import ${component} from '@mui/material/${component}';`)
          .join('\n')
      },
    )

    if (updatedContent !== fileContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`Updated: ${filePath}`)
    } else {
      console.log(`No changes: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
  }
}

// Find all .tsx files in the specified directory
glob(directory, (err, files) => {
  if (err) {
    console.error('Error finding files:', err)
    return
  }

  files.forEach((file) => {
    processFile(file)
  })

  console.log('Processing complete.')
})
