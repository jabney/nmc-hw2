const util = require('util')

const menu = require('../menu')
const storage = require('../storage')
const Model = require('./model')

const readFile = util.promisify(storage.read)

/**
 * @typedef {Object} SummaryItem
 * @property {string} name
 * @property {string} size
 * @property {number} price
 * @property {number} amount
 * @property {SummaryItem[]} [add]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {menu.ItemSize} [size]
 * @property {CartItem[]} [add]
 */

/**
 * @typedef {Object} CartData
 * @property {string} id
 * @property {string} userId
 * @property {CartItem[]} items
 */

/**
 * Calculate total cart price.
 *
 * @param {SummaryItem[]} items
 *
 * @returns {number}
 */
const totalCart = function totalCart(items) {
  if (!items) { return 0 }

  // Sum items and item additions, if any.
  const total = items.reduce(
    (sum, item) =>  sum += item.price + totalCart(item.add), 0)

  return +total.toFixed(2)
}

/**
 * Convert cart items into summary items.
 * Summary items are used to get a total cart price,
 * and also are appropriate for returning to the client.
 *
 * @param {CartItem[]} items
 */
const summarize = function summarize(items) {
  return new Promise((resolve, reject) => {

    // If there are no items, we're done.
    if (items.length === 0) {
      resolve([])
    }

    /**
     * Create list container.
     *
     * @type {SummaryItem[]}
     */
    const list = []

    // Track number of items handled.
    let numItems = 0

    items.forEach(async (item) => {
      // Create the summary item.
      const summaryItem = await summaryItemFactory(item)

      // If there are additions, recurse.
      if (item.add) {
        summaryItem.add = await summarize(item.add)
      }

      // Add the summary item to the list.
      list.push(summaryItem)

      // Increment counter.
      numItems += 1

      // Check if we've processed all items.
      if (numItems === items.length) {
        resolve(list)
      }
    })
  })
}

/**
 * Create a summary item from a cart item.
 *
 * @param {CartItem} item
 */
const summaryItemFactory = function summaryItemFactory(item) {
  return new Promise(async (resolve, reject) => {
    try {
      /**
       * Read in the menu item.
       *
       * @type {menu.MenuItem}
       */
      const menuItem = await readFile('menu', item.id)

      // Calculate price.
      const price = menuItem.price[item.size]

      /**
       * Create the summary item.
       *
       * @type {SummaryItem}
       */
      const summaryItem = {
        name: menuItem.name,
        size: item.size,
        amount: 1,
        price,
      }

      // Resolve the item.
      resolve(summaryItem)

    } catch (error) {
      console.error(error)
    }
  })

}


class Cart extends Model {
  /**
   * @param {string} [id]
   */
  constructor(id) {
    super('cart', id)

    /**
     * @type {string}
     */
    this.id = null

    /**
     * @type {string}
     */
    this.userId = null

    /**
     * @type {CartItem[]}
     */
    this.items = []
  }

  /**
   * Return members of this model as elements of an object.
   *
   * @returns {CartData}
   */
  serialize() {
    const serializedCart = {
      id: this.id,
      userId: this.userId,
      items: this.items,
    }

    return serializedCart
  }

  /**
   * Assign elements from given data to members of this model.
   *
   * @param {CartData} data
   *
   * @returns {Cart}
   */
  deserialize(data) {
    this.id = typeof data.id === 'undefined' && this.id || data.id
    this.userId = typeof data.userId === 'undefined' && this.userId || data.userId
    this.items = typeof data.items === 'undefined' && this.items || data.items
    return this
  }

  /**
   * Add an item to the cart.
   *
   * @param {CartItem} item
   */
  async addItem(item) {
    this.items.push(item)
  }

  /**
   * Summarize the cart. This returns data that can used to
   * calculate total cart price, and can be returned to the user.
   *
   * @returns {Promise<SummaryItem[]>}
   */
  async summarize() {
    const items = await summarize(this.items)
    return items
  }

  /**
   * Calculate the total price of summary items.
   *
   * @param {SummaryItem[]} items
   */
  total(items) {
    return totalCart(items)
  }
}

module.exports = Cart
