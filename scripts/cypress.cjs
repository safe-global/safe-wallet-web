// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process')

const DEPLOYMENTS = {
  dev: 'https://web-core.pages.dev',
  staging: 'https://web-core.pages.dev',
  prod: 'https://web-core.pages.dev',
}

const command = `cypress ${process.argv[2]}`
// To accept 'prod' or 'production' as an argument
let env = process.argv?.[3] === 'production' ? 'prod' : process.argv?.[3]

exec(env ? `${command} --config baseUrl=${DEPLOYMENTS[env]} --env CYPRESS_ENV=${env}` : command)
