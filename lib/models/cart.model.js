const util = require('util')

const menu = require('../menu')
const storage = require('../storage')
const Model = require('./model')

const readFile = util.promisify(storage.read)

/**
 * The shape of cart items after being transformed.
 *
 * @typedef {Object} SummaryItem
 * @property {string} name
 * @property {string} size
 * @property {number} price
 * @property {SummaryItem[]} [add]
 */

/**
 * Cart items stored in this model.
 *
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {menu.ItemSize} [size]
 * @property {CartItem[]} [add]
 */

/**
 * Cart data written to storage.
 *
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
 * @param {CartItem} parent
 */
const summarize = function summarize(items, parent=null) {
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
      const summaryItem = await summaryItemFactory(item, parent)

      // If there are additions, recurse.
      if (item.add) {
        summaryItem.add = await summarize(item.add, item)
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
 * @param {CartItem} parent
 */
const summaryItemFactory = function summaryItemFactory(item, parent) {
  return new Promise(async (resolve, reject) => {
    /**
     * Read in the menu item.
     *
     * @type {menu.MenuItem}
     */
    const menuItem = await readFile('menu', item.id)

    /**
     * @type {number}
     */
    let price

    /**
     * Calculate price. If this is an add item, use the size
     * of the parent cart item; otherwise use the item size.
     */
    if (parent == null) {
      // There is no parent. Expect the item to have a size.
      price = menuItem.price[item.size]
    } else {
      // There is a parent item. Use its size to get the price.
      price = menuItem.price[parent.size]
      console.log(price)
    }

    // Warn if we didn't get a price.
    if (typeof price === 'undefined') {
      console.warn('<cart.model> price not found')
    }

    /**
     * Create the summary item.
     *
     * @type {SummaryItem}
     */
    const summaryItem = {
      name: menuItem.name,
      size: item.size,
      price,
    }

    // Resolve the item.
    resolve(summaryItem)
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
  addItem(item) {

    // if (item.add) {
    //   /**
    //    * Sort add items so that when two identical items are hashed
    //    * later, they will always hash to the same value.
    //    */
    //   item.add.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    // }

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
