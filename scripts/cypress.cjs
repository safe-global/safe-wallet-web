// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process')

const DEPLOYMENTS = {
  dev: 'https://safe-team.dev.gnosisdev.com/app',
  staging: 'https://safe-team.staging.gnosisdev.com/app',
  prod: 'https://gnosis-safe.io/app',
}

const command = `cypress ${process.argv[2]}`
// To accept 'prod' or 'production' as an argument
let env = process.argv?.[3] === 'production' ? 'prod' : process.argv?.[3]

exec(env ? `${command} --config baseUrl=${DEPLOYMENTS[env]} --env CYPRESS_ENV=${env}` : command)
