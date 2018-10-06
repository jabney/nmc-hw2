const util = require('util')

const api = require('../api')
const storage = require('../storage')
const menu = require('../menu')
const createBear = require('../bear')

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
const getMenuItems = async function getMenuItems(idList) {
  // Return a sorted list of menu items.
  return Promise.all(idList.map(async (id) => {
    try {
      /**
       * Read and return the menu item.
       *
       * @type {menu.MenuItem}
       */
      const item = await readFile('menu', id)
      return item
    } catch (error) {
      console.error(`error reading menu item "${id}"`)
    }
  }))
  .then(items => items.sort((a, b) => a.order - b.order))
}

/**
 * Create the welcome message.
 */
const createWelcome = async function createWelcome() {
  // Wait for initialization.
  await _init

  // Create the welcome message.
  const bear = await createBear()
  const message = ' '.repeat(27) + 'Welcome to Big Bear Pizza' + ' '.repeat(28)
  const spacer = ' '.repeat(80)
  return [message, spacer, spacer, ...bear]
}

/**
 * Create the menu.
 */
const createMenu = async function createMenu() {
  try {
    // Wait for initialization.
    await _init

    // Menu container.
    const _menu = {}

    // Get and build menu elements.
    const menuItems = await getMenuItems(await listFiles('menu'))

    // build the menu.
    _menu.pizza = menuItems.filter(item => item.type === 'pizza')
    _menu.toppings = menuItems.filter(item => item.type === 'topping')
    _menu.salads = menuItems.filter(item => item.type === 'salad')
    _menu.dressings = menuItems.filter(item => item.type === 'dressing')
    _menu.beverages = menuItems.filter(item => item.type === 'beverage')

    return _menu
  } catch (error) {
    console.error(error)
  }
}

// Get the initialization promise.
const _init = menu.init()

// Create welcome messsage.
const _welcome = createWelcome()

// Create menu.
const _menu = createMenu()

/**
 * Users get handler
 *
 * @type {RequestHandler}
 */
lib.get = async (requestData, response) => {
  const welcome = await _welcome
  const menu = await _menu
  response(200, { welcome, menu })
}

module.exports = lib
