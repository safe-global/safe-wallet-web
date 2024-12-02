const fs = require('fs')
const path = require('path')
const { withDangerousMod } = require('@expo/config-plugins')

const androidFolderPath = ['app', 'src', 'main', 'res', 'drawable']

const withDrawableAssets = function (expoConfig, files) {
  return withDangerousMod(expoConfig, [
    'android',
    function (modConfig) {
      if (modConfig.modRequest.platform === 'android') {
        const androidDwarablePath = path.join(modConfig.modRequest.platformProjectRoot, ...androidFolderPath)

        if (!Array.isArray(files)) {
          files = [files]
        }

        files.forEach(function (file) {
          const isFile = fs.lstatSync(file).isFile()
          if (isFile) {
            fs.copyFileSync(file, path.join(androidDwarablePath, path.basename(file)))
          } else {
            copyFolderRecursiveSync(file, androidDwarablePath)
          }
        })
      }
      return modConfig
    },
  ])
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target)
  }

  const files = fs.readdirSync(source)

  files.forEach(function (file) {
    const sourcePath = path.join(source, file)
    const targetPath = path.join(target, file)

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath)
    } else {
      fs.copyFileSync(sourcePath, targetPath)
    }
  })
}

module.exports = withDrawableAssets
