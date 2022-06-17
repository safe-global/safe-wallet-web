const fs = require('fs')

const iterate = (folderName, parentRoute, root) => {
  const items = fs.readdirSync(folderName)
  items.forEach((item) => {
    if (/_app|_document|404/.test(item)) return

    if (item.endsWith('.tsx')) {
      const name = item.split('.')[0]
      const path = name === 'index' ? parentRoute : `${parentRoute}/${name}`
      const key = name
        .replace(/-\w/g, (match) => match.replace(/-/g, '').toUpperCase()) // spending-limit -> spendingLimit
        .replace(/\W/g, '') // [txId] -> txId
      root[key] = path || '/'
      return
    }

    root[item] = {}
    iterate(`${folderName}/${item}`, `${parentRoute}/${item}`, root[item])
  })
}

const routes = {}
iterate('pages', '', routes)

console.log(`export const AppRoutes = ${JSON.stringify(routes, null, 2).replace(/"/g, "'")}`)
