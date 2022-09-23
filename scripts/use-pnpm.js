const PNPM_NAME = 'pnpm'

const getPackageManagerName = (userAgent) => {
  if (!userAgent) {
    return false
  }

  const spec = userAgent.split(' ')[0]
  const separatorIndex = spec.lastIndexOf('/')
  const name = spec.substring(0, separatorIndex)

  return name === 'npminstall' ? 'cnpm' : name
}

const isPnpm = () => {
  return getPackageManagerName(process.env.npm_config_user_agent) === PNPM_NAME
}

const hasNodeModules = () => {
  const cwd = process.env.INIT_CWD || process.cwd()
  return cwd.includes('node_modules')
}

if (!isPnpm() && !hasNodeModules()) {
  console.log(
    '\x1b[31m', // Red
    `Use "pnpm install" for installation in this project.
 If you don't have pnpm, install it via "npm i -g pnpm".
 For more details, visit https://pnpm.js.org/.`,
  )

  process.exit(1)
}
