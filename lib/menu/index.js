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
 * @property {string} id
 * @property {number} [order]
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
    id: 'big-bear-special-pizza',
    type: 'pizza',
    desc: 'A pizza only an actual bear would want to eat. We add a whole, raw salmon to a pizza with various other toppings of dubious quality and freshness.',
    price: {
      small: 12.99,
      medium: 14.99,
      large: 16.99,
      ['x-large']: 18.99,
    },
  },
  {
    name: 'Cheese Pizza (a.k.a The Commando)',
    id: 'cheese-pizza',
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
    id: 'combo-pizza',
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
    id: 'node-pizza',
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
    id: 'leslie-pizza',
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
    id: 'full-stack-pizza',
    type: 'pizza',
    desc: 'A fully-capable, well-rounded pizza with pepperoni, bacon, italian sausage, mushrooms, black olives, roasted garlic, spinach, pine nuts, jalepenos, and fresh basil. It would\'ve been simpler to list what this pizza doesn\'t have on it.',
    price: {
      small: 15.99,
      medium: 17.99,
      large: 19.99,
      ['x-large']: 21.99,
    },
  },
  {
    name: 'The Gambler (a.k.a the RNG)',
    id: 'gambler-pizza',
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
    id: 'chefs-special-pizza',
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
    id: 'proprietary-pizza',
    type: 'pizza',
    desc: 'We failed in our duty to provide enough pizza options and now you are forced to build your own. Or perhaps you are just a wierdo. This pizza starts with cheese and then makes your every wish its command.',
    price: {
      small: 9.99,
      medium: 11.99,
      large: 13.99,
      ['x-large']: 15.99,
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
    id: 'pepperoni-topping',
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
    id: 'italian-sausage-topping',
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
    id: 'chicken-sausage-topping',
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
    id: 'bacon-topping',
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
    id: 'mushrooms-topping',
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
    id: 'black-olives-topping',
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
    id: 'roasted-garlic-topping',
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
    id: 'green-peppers-topping',
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
    id: 'tomatoes-topping',
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
    id: 'spinach-topping',
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
    id: 'jalepenos-topping',
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
    id: 'pine-nuts-topping',
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
    id: 'fresh-basil-topping',
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
    id: 'garden-salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Greek Salad',
    id: 'greek-salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Caesar Salad',
    id: 'caesar-salad',
    type: 'salad',
    price: {
      regular: 5.00,
      large: 6.50,
    },
  },
  {
    name: 'Spinach Salad',
    id: 'spinach-salad',
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
    id: 'house-dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Caesar Dressing',
    id: 'caesar-dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Blue Cheese Dressing',
    id: 'blue-cheese-dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Ranch Dressing',
    id: 'ranch-dressing',
    type: 'dressing',
    price: {
      regular: 1.50,
      large: 2.00,
    },
  },
  {
    name: 'Italian Dressing',
    id: 'italian-dressing',
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
    id: 'san-pellegrino-beverage',
    type: 'beverage',
    desc: 'Delicious sparkling water.',
    price: {
      regular: 2.50,
    },
  },
  {
    name: 'Water',
    id: 'water-beverage',
    type: 'beverage',
    desc: 'Delicious water without the sparkles',
    price: {
      regular: 1.00,
    },
  },
  {
    name: 'Cola',
    id: 'cola-beverage',
    type: 'beverage',
    price: {
      regular: 1.50,
    },
  },
  {
    name: 'Diet Cola',
    id: 'diet-cola-beverage',
    type: 'beverage',
    price: {
      regular: 1.50,
    },
  },
  {
    name: 'Sierra Nevada Pale Ale',
    id: 'snpa-beverage',
    type: 'beverage',
    desc: 'A very butch beer with tons of flavor.',
    price: {
      regular: 2.00,
    },
  },
  {
    name: 'Diet Sierra Nevada Pale Ale',
    id: 'diet-snpa-beverage',
    type: 'beverage',
    desc: 'The exact same as regular SNPA but "diet".',
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
      try { await deleteFile('menu', id) } catch (error) { console.log(error)}

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
        await createFile('menu', item.id, { order: index, ...item })
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
