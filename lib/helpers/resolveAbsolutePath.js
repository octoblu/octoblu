const path = require('path')

const resolveAbsolutePath = (localPath, prefix) => {
  if (path.isAbsolute(localPath)) return localPath
  return path.join(prefix, localPath)
}

module.exports = resolveAbsolutePath
