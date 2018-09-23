const util = require('util')

const api = require('./api')
const storage = require('../lib/storage')
const menu = require('../lib/menu')

const listFiles = util.promisify(storage.list)
const readFile = util.promisify(storage.read)

/**
 * @typedef {api.RequestHandler} RequestHandler
 */

/**
 * Create the users handlers container.
 *
 * @type {api.ApiLib}
 */
const lib = {}

/**
 * Get menu items from a list of menu item ids.
 *
 * @param {string[]} idList
 */
const getItems = async function getItems(idList) {
  return new Promise((resolve, reject) => {
    const menuItems = []

    // Build the item list.
    idList.forEach(async (id) => {
      try {
        // Read the menu item and add it to the items list.
        const item = await readFile('menu', id)
        menuItems.push(item)

        // Check if we've added all the items.
        if (menuItems.length === idList.length) {
          // Sort menu items by their declared order.
          menuItems.sort((a, b) => a.order - b.order)

          // Resolve the promise.
          resolve(menuItems)
        }
      } catch (error) {
        console.error(`error reading menu item "${id}"`)
      }
    })
  })
}

/**
 * Create the menu.
 */
const createMenu = async function createMenu() {
  // Initialize the menu.
  await menu.init()

  // Menu container.
  const _menu = {}

  // Get and build menu elements.
  const bear = await readFile('bear', 'bear')
  const toppings = await readFile('toppings', 'toppings')
  const menuItems = await getItems(await listFiles('menu'))
  const message = ' '.repeat(27) + 'Welcome to Big Bear\'s Pizza' + ' '.repeat(26)
  const spacer = ' '.repeat(80)

  // build the menu.
  _menu.welcome = [message, spacer, spacer, ...bear]
  _menu.items = menuItems
  _menu.toppings = toppings

  return _menu
}

const _menu = createMenu()

/**
 * Users get handler
 *
 * @type {RequestHandler}
 */
lib.get = async (requestData, response) => {
  const menu = await _menu
  return response(200, { menu })
}

module.exports = lib
