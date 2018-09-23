const fs = require('fs')
const util = require('util')
const storage = require('../lib/storage')
const createBear = require('../lib/bear')

const mkdir = util.promisify(fs.mkdir)
const createFile = util.promisify(storage.create)
const deleteFile = util.promisify(storage.delete)
const listFiles = util.promisify(storage.list)

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {number} order
 * @property {string} name
 * @property {ItemSize} [size]
 * @property {string} desc
 */

/**
 * @typedef {Item} MenuItem
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
    id: 'big-bear-special-pizza',
    order: 0,
    name: 'The Big Bear Special',
    desc: 'A pizza only an actual bear would want to eat. We add a couple of whole, raw salmon on a pizza with various other toppings of dubious quality and freshness.',
  },
  {
    id: 'commando-pizza',
    order: 1,
    name: 'Cheese Pizza (a.k.a The Commando)',
    desc: 'An unencumbered pizza with nothing but cheese.',
  },
  {
    id: 'combination-pizza',
    order: 2,
    name: 'Combination Pizza',
    desc: 'A pizza with pepperoni, italian sausage, mushrooms, olives, and green peppers - for those needing a low-risk or unimaginative pizza option.',
  },
  {
    id: 'node-pizza',
    order: 3,
    name: 'The Node',
    desc: 'An asynchronous, event-driven pizza with chicken sausage, bacon, tomatoes, and fresh basil - for anyone wanting a pizza that runs on the front and back end.',
  },
  {
    id: 'leslie-pizza',
    order: 4,
    name: 'The Leslie',
    desc: 'An erudite and cosmopolitan pizza with pepperoni, bacon, roasted garlic, and pine nuts - for customers with sophisticated taste and a sense of style.',
  },
  {
    id: 'full-stack-pizza',
    order: 5,
    name: 'The Full Stack',
    desc: 'A fully-capable, well-rounded pizza with pepperoni, bacon, italian sausage, mushrooms, black olives, roasted garlic, spinach, pine nuts, jalepenos, and fresh basil. It would have been simpler to list what this pizza doesn\'t have on it.',
  },
  {
    id: 'gambler-pizza',
    order: 6,
    name: 'The Gambler (a.k.a the RNG)',
    desc: 'We select three toppings at random and apply them generously but indiscriminately to a cheese pizza. No refunds.',
  },
  {
    id: 'chefs-special-pizza',
    order: 7,
    name: 'The Chef\'s Special',
    desc: 'This pizza is for repeat customers who\'ve been discourtious to our drivers on previous deliveries. We start with the pizza you order and add some additional, non-disclosed bonus toppings free of charge. Bon apetit!',
  },
  {
    id: 'proprietary-pizza',
    order: 8,
    name: 'The Proprietary (build your own)',
    desc: 'Apparently we failed in our duty to provide enough pizza options and you have decided to build your own. Or perhaps you are just a wierdo. This pizza starts with cheese and then makes your every wish its command.'
  }
]

/**
 * @type {string[]}
 */
const pizzaToppings = [
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

const init = async function init() {

  /**
   * Create directories.
   */

  try {
    await mkdir('./.data/menu')
  } catch (error) { /* directory already exists */ }

  try {
    await mkdir('./.data/toppings')
  } catch (error) { /* directory already exists */ }

  try {
    await mkdir('./.data/bear')
  } catch (error) { /* directory already exists */ }

  /**
   * Delete existing items.
   */

  try {
    const menu = await listFiles('menu')
    menu.forEach(async (id) => await deleteFile('menu', id))
  } catch (error) { /* files don't exist */ }

  try {
    await deleteFile('toppings', 'toppings')
  } catch (error) { /* file doesn't exist */ }

  try {
    await deleteFile('bear', 'bear')
  } catch (error) { /* file doesn't exist */ }

  try {
    // Create the menu.
    menuItems.forEach(async (item) => await createFile('menu', item.id, item))

    // Create toppings.
    await createFile('toppings', 'toppings', pizzaToppings)

    // Create bear image.
    const bear = await createBear()
    await createFile('bear', 'bear', bear)

  } catch (error) {
    console.error('<menu> error:', error)
  }
}

module.exports = { init }
