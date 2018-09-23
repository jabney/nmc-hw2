const fs = require('fs')
const util = require('util')
const storage = require('../storage')
const createBear = require('../bear')

const mkdir = util.promisify(fs.mkdir)
const createFile = util.promisify(storage.create)
const deleteFile = util.promisify(storage.delete)
const listFiles = util.promisify(storage.list)

/**
 * @typedef {Object} MenuItem
 * @property {number} id
 * @property {string} name
 * @property {'pizza'|'salad'|'beverage'} type
 * @property {number} price
 * @property {string} desc
 */

/**
 * @typedef {Object} Menu
 * @property {MenuItem[]} items
 * @property {string[]} toppings
 */

/**
 * @type {MenuItem[]}
 */
const menuItems = [
  {
    id: 0,
    name: 'The Big Bear Special',
    type: 'pizza',
    price: 0.00,
    desc: 'A pizza only an actual bear would want to eat. We add a couple of whole, raw salmon on a pizza with various other toppings of dubious quality and freshness.',
  },
  {
    id: 1,
    name: 'Cheese Pizza (a.k.a The Commando)',
    type: 'pizza',
    price: 0.00,
    desc: 'An unencumbered pizza with nothing but cheese.',
  },
  {
    id: 2,
    name: 'Combination Pizza',
    type: 'pizza',
    price: 0.00,
    desc: 'A pizza with pepperoni, italian sausage, mushrooms, olives, and green peppers - for those needing a low-risk or unimaginative pizza option.',
  },
  {
    id: 3,
    name: 'The Node',
    type: 'pizza',
    price: 0.00,
    desc: 'An asynchronous, event-driven pizza with chicken sausage, bacon, tomatoes, and fresh basil - for anyone wanting a pizza that runs on the front and back end.',
  },
  {
    id: 4,
    name: 'The Leslie',
    type: 'pizza',
    price: 0.00,
    desc: 'An erudite and cosmopolitan pizza with pepperoni, bacon, roasted garlic, and pine nuts - for customers with sophisticated taste and a sense of style.',
  },
  {
    id: 5,
    name: 'The Full Stack',
    type: 'pizza',
    price: 0.00,
    desc: 'A fully-capable, well-rounded pizza with pepperoni, bacon, italian sausage, mushrooms, black olives, roasted garlic, spinach, pine nuts, jalepenos, and fresh basil. It would have been simpler to list what this pizza doesn\'t have on it.',
  },
  {
    id: 6,
    name: 'The Gambler (a.k.a the RNG)',
    type: 'pizza',
    price: 0.00,
    desc: 'We select three toppings at random and apply them generously but indiscriminately to a cheese pizza. No refunds.',
  },
  {
    id: 7,
    name: 'The Chef\'s Special',
    type: 'pizza',
    price: 0.00,
    desc: 'This pizza is for repeat customers who\'ve been discourtious to our drivers on previous deliveries. We start with the pizza you order and add some additional, non-disclosed bonus toppings free of charge. Bon apetit!',
  },
  {
    id: 8,
    name: 'The Proprietary (build your own)',
    type: 'pizza',
    price: 0.00,
    desc: 'We failed in our duty to provide enough pizza options and now you are forced to build your own. Or perhaps you are just a wierdo. This pizza starts with cheese and then makes your every wish its command.'
  }
]

/**
 * @type {string[]}
 */
const toppings = [
    // Meats
    'pepperoni',
    'italian sausage',
    'chicken sausage',
    'bacon',
    'salami',
    // Veggies
    'mushrooms',
    'black olives',
    'roasted garlic',
    'green peppers',
    'tomatoes',
    'spinach',
    'jalepenos',
    'pine nuts',
    'fresh basil',
]

/**
 * Delete menu files.
 */
const deleteMenu = function deleteMenu() {
  return new Promise(async (resolve, reject) => {
    const list = await listFiles('menu')
    let numDeleted = 0

    if (list.length === 0) {
      resolve()
    }

    list.forEach(async (id) => {
      try { await deleteFile('menu', id) } catch (error) { }

      numDeleted += 1

      if (numDeleted === list.length) {
        resolve()
      }
    })
  })
}

/**
 * Delete menu files.
 */
const createMenu = function createMenu() {
  return new Promise(async (resolve, reject) => {
    /**
     * Create directory.
     */
    try { await mkdir('./.data/menu') } catch (error) { /* directory exists */ }

    let numCreated = 0

    if (menuItems.length === 0) {
      resolve()
    }

    menuItems.forEach(async (item) => {
      try { await createFile('menu', item.id.toString(), item) } catch (error) { }

      numCreated += 1

      if (numCreated === menuItems.length) {
        resolve()
      }

    })
  })
}

const init = async function init() {
  if (!fs.existsSync('./.data/menu')) {
    fs.mkdirSync('./.data/menu')
  }

  try {
    // Delete existing menu items.
    await deleteMenu()
    // Create the menu.
    await createMenu()

    // Create toppings.
    await createFile('menu', 'toppings', toppings)

    // Create bear image.
    const bear = await createBear()
    await createFile('menu', 'bear', bear)

  } catch (error) {
    console.error('<menu> error:', error)
  }
}

module.exports = { init }
