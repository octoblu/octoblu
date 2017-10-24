const fs = require('fs')

const haveAccessSync = (filePath) => {
  try {
    fs.accessSync(filePath)
    return true
  } catch (error) {
    return false
  }
}

module.exports = haveAccessSync
