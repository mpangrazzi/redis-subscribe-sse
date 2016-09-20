'use strict'

module.exports = (value) => {
  let type = typeof value
  return !!value && (type == 'object' || type == 'function')
}
