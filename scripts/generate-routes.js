const fs = require('fs')

const iterate = (folderName, parentRoute, root) => {
  const items = fs.readdirSync(folderName)
  items.forEach((item) => {
    if (/_app|_document|404/.test(item)) return

    if (item.endsWith('.tsx')) {
      const name = item.split('.')[0]
      root[name] = `${parentRoute}/${name}`
      return
    }

    root[item] = {}
    iterate(`${folderName}/${item}`, `${parentRoute}/${item}`, root[item])
  })
}

const routes = {}
iterate('pages', '', routes)

console.log(`export const AppRoutes = ${JSON.stringify(routes, null, 2).replace(/"/g, "'")}`)
