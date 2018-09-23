const util = require('util')

const api = require('../api')
const storage = require('../storage')
const menu = require('../menu')

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

          // Resolve the promise.
          resolve(
            menuItems
              // Filter out files that aren't legit menu items, e.g, toppings.
              .filter(item => typeof item.id !== 'undefined')
              // Sort menu items by their id.
              .sort((a, b) => a.id - b.id)
          )
        }
      } catch (error) {
        console.error(`error reading menu item "${id}"`)
      }
    })
  })
}

/**
 * Create the welcome message.
 */
const createWelcome = async function createWelcome() {
  // Wait for initialization.
  await _init

  // Create the welcome message.
  const bear = await readFile('menu', 'bear')
  const message = ' '.repeat(27) + 'Welcome to Big Bear\'s Pizza' + ' '.repeat(26)
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
    const m = {}

    // Get and build menu elements.
    const toppings = await readFile('menu', 'toppings')
    const menuItems = await getMenuItems(await listFiles('menu'))

    // build the menu.
    m.pizza = menuItems.filter(item => item.type === 'pizza')
    m.toppings = toppings
    m.salads = menuItems.filter(item => item.type === 'salad')
    m.beverages = menuItems.filter(item => item.type === 'beverage')

    return m
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
