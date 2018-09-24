const fs = require('fs')
const util = require('util')
const storage = require('../storage')

const mkdir = util.promisify(fs.mkdir)
const createFile = util.promisify(storage.create)
const deleteFile = util.promisify(storage.delete)
const listFiles = util.promisify(storage.list)

/**
 * @typedef {'small'|'medium'|'large'|'x-large'|'regular'} ItemSize
 */

/**
 * @typedef {'pizza'|'topping'|'salad'|'dressing'|'beverage'} MenuItemType
 */

/**
 * @typedef {{[T in ItemSize]?: number}} ItemPrice
 */

/**
 * @typedef {Object} MenuItem
 * @property {number} [id]
 * @property {string} name
 * @property {MenuItemType} type
 * @property {ItemPrice} price
 * @property {string} [desc]
 * @property {MenuItem[]} [add]
 */

/**
 * @type {MenuItem[]}
 */
const pizza = [
  {
    name: 'The Big Bear Special',
    type: 'pizza',
    desc: 'A pizza only an actual bear would want to eat. We add a couple of whole, raw salmon on a pizza with various other toppings of dubious quality and freshness.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'Cheese Pizza (a.k.a The Commando)',
    type: 'pizza',
    desc: 'An unencumbered pizza with nothing but cheese.',
    price: {
      small: 9.99,
      medium: 11.99,
      large: 13.99,
      ['x-large']: 15.99,
    },
  },
  {
    name: 'Combination Pizza',
    type: 'pizza',
    desc: 'A pizza with pepperoni, italian sausage, mushrooms, olives, and green peppers - for those needing a low-risk or unimaginative pizza option.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Node',
    type: 'pizza',
    desc: 'An asynchronous, event-driven pizza with chicken sausage, bacon, tomatoes, and fresh basil - for anyone wanting a pizza that runs on the front and back end.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Leslie',
    type: 'pizza',
    desc: 'An erudite and cosmopolitan pizza with pepperoni, bacon, roasted garlic, and pine nuts - for customers with sophisticated taste and a sense of style.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Full Stack',
    type: 'pizza',
    desc: 'A fully-capable, well-rounded pizza with pepperoni, bacon, italian sausage, mushrooms, black olives, roasted garlic, spinach, pine nuts, jalepenos, and fresh basil. It would\'ve been simpler to list what this pizza doesn\'t have on it.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Gambler (a.k.a the RNG)',
    type: 'pizza',
    desc: 'We select three toppings at random and apply them generously but indiscriminately to a cheese pizza. No refunds.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Chef\'s Special',
    type: 'pizza',
    desc: 'This pizza is for repeat customers who\'ve been discourtious to our drivers on previous deliveries. We start with the pizza you order and add some additional, non-disclosed bonus toppings free of charge. Bon apetit!',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'The Proprietary (build your own)',
    type: 'pizza',
    desc: 'We failed in our duty to provide enough pizza options and now you are forced to build your own. Or perhaps you are just a wierdo. This pizza starts with cheese and then makes your every wish its command.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
]

/**
 * @type {MenuItem[]}
 */
const toppings = [

  /**
   * Meats
   */

  {
    name: 'Pepperoni',
    type: 'topping',
    price: {
      small: 1.00,
      medium: 1.50,
      large: 2.00,
      ['x-large']: 2.50,
    },
  },
  {
    name: 'Italian Sausage',
    type: 'topping',
    price: {
      small: 1.00,
      medium: 1.50,
      large: 2.00,
      ['x-large']: 2.50,
    },
  },
  {
    name: 'Chicken Sausage',
    type: 'topping',
    price: {
      small: 1.00,
      medium: 1.50,
      large: 2.00,
      ['x-large']: 2.50,
    },
  },
  {
    name: 'Bacon',
    type: 'topping',
    price: {
      small: 1.00,
      medium: 1.50,
      large: 2.00,
      ['x-large']: 2.50,
    },
  },

  /**
   * Veggies
   */

  {
    name: 'Mushrooms',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Black Olives',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Roasted Garlic',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Green Peppers',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Tomatoes',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Spinach',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Jalepenos',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Pine Nuts',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
  {
    name: 'Fresh Basil',
    type: 'topping',
    price: {
      small: 0.50,
      medium: 1.00,
      large: 1.50,
      ['x-large']: 2.00,
    },
  },
]

/**
 * @type {MenuItem[]}
 */
const salads = [
  {
    name: 'Garden Salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Greek Salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Caesar Salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Spinach Salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
]

/**
 * @type {MenuItem[]}
 */
const dressings = [
  {
    name: 'House Dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Caesar Dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Blue Cheese Dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Ranch Dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Italian Dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
]

/**
 * @type {MenuItem[]}
 */
const beverages = [
  {
    name: 'San Pellegrino',
    type: 'beverage',
    price: {
      regular: 2.50,
    },
  },
  {
    name: 'Water',
    type: 'beverage',
    price: {
      regular: 1.00,
    },
  },
  {
    name: 'Cola',
    type: 'beverage',
    price: {
      regular: 1.50,
    },
  },
  {
    name: 'Sierra Nevada Pale Ale',
    type: 'beverage',
    price: {
      regular: 2.00,
    },
  },
]

// Combine menu items.
const menuItems = [...pizza, ...toppings, ...salads, ...dressings, ...beverages]

/**
 * Delete menu files.
 */
const deleteMenu = function deleteMenu() {
  return new Promise(async (resolve, reject) => {
    // Get menu items list.
    const list = await listFiles('menu')

    // If the list is empty, we're done.
    if (list.length === 0) {
      resolve()
    }

    // Track deleted count.
    let numDeleted = 0

    list.forEach(async (id) => {
      // Delete the file.
      try { await deleteFile('menu', id) } catch (error) { }

      // Increment counter.
      numDeleted += 1

      // Check if we're done.
      if (numDeleted === list.length) {
        resolve()
      }
    })
  })
}

/**
 * Create menu files.
 */
const createMenu = function createMenu() {
  return new Promise(async (resolve, reject) => {
    // Keep track of how many items have been created.
    let numCreated = 0

    menuItems.forEach(async (item, index) => {
      // Create the file.
      try {
        await createFile('menu', index.toString(), { id: index, ...item })
      } catch (error) { }

      // Increment counter.
      numCreated += 1

      // Check if we're finished.
      if (numCreated === menuItems.length) {
        resolve()
      }

    })
  })
}

/**
 * Create menu items.
 */
const init = async function init() {
  // Create the menu folder.
  try { await mkdir('./.data/menu') } catch (error) { /* directory exists */ }

  try {
    // Delete existing menu items.
    await deleteMenu()

    // Create the menu.
    await createMenu()

  } catch (error) {
    console.error('<menu> error:', error)
  }
}

module.exports = { init }
