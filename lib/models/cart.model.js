const crypto = require('crypto')
const util = require('util')

const menu = require('../menu')
const storage = require('../storage')
const Model = require('./model')

const readFile = util.promisify(storage.read)

/**
 * The shape of cart items after being transformed.
 *
 * @typedef {Object} SummaryItem
 * @property {string} id
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

  return total
}

/**
 * Convert cart items into summary items.
 * Summary items are used to get a total cart price,
 * and also are appropriate for returning to the client.
 *
 * @param {CartItem[]} items
 * @param {CartItem} parent
 */
const summarizeCart = function summarizeCart(items, parent=null) {
  /**
   * Summarize each item in the items list.
   */
  return Promise.all(items.map(async (item) => {
    // Create the summary item.
    const summaryItem = await summaryItemFactory(item, parent)

    // If there are additions, recurse.
    if (item.add) {
      summaryItem.add = await summarizeCart(item.add, item)
    }

    return summaryItem
  }))
}

/**
 * Create a summary item from a cart item.
 *
 * @param {CartItem} item
 * @param {CartItem} parent
 */
const summaryItemFactory = async function summaryItemFactory(item, parent) {
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
  }

  /**
   * Create the summary item.
   *
   * @type {SummaryItem}
   */
  const summaryItem = {
    id: hashObject(item),
    name: menuItem.name,
    size: item.size,
    price,
  }

  // Resolve the item.
  return summaryItem
}

/**
 * Create a sha256 hash of a serializable object in base64 url format.
 *
 * @param {any} obj
 */
const hashObject = function hashObject(obj, alg='sha256') {
  const hash = crypto.createHash(alg)
    .update(JSON.stringify(obj))
    .digest('base64')

  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

class Cart extends Model {
  /**
   * @param {string} [id]
   */
  constructor(id) {
    super('cart', id)

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
    this.setValue('items', data.items)
    return this
  }

  /**
   * Add an item to the cart.
   *
   * @param {CartItem} item
   */
  addItem(item) {
    /**
     * Sort add items so that when two identical items are hashed
     * later, they will always hash to the same value.
     */
    if (item.add) {
      item.add.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    }

    this.items.push(item)
  }

  /**
   * Remove an item from the cart.
   *
   * @param {string} id
   */
  removeItem(id) {
    const [itemId, subitemId] = id.split(':').filter(x => !!x)

    if (typeof subitemId === 'undefined') {
      // If there's no sub item id, just remove the top-level item.
      this._removeItem(itemId, this.items)
    } else {
      // Remove an item's sub item.
      this._removeSubItem(itemId, subitemId)
    }
  }

  /**
   * Clear the cart of all contents.
   */
  clear() {
    while (this.items.length > 0) { this.items.pop() };
  }

  /**
   * Summarize the cart. This returns data that can used to
   * calculate total cart price, and can be returned to the user.
   *
   * @returns {Promise<SummaryItem[]>}
   */
  async summarize() {
    const items = await summarizeCart(this.items)
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

  /**
   * Remove a top-level item from the cart.
   *
   * @param {string} itemId
   * @param {CartItem[]} items
   */
  _removeItem(itemId, items) {
    // Create a list of items with corresponding hashes.
    const hashedItems = items.map((item) => ({
      id: hashObject(item),
      item: item
    }))

    // Find an item with the same hash as the item id.
    const index = hashedItems.findIndex((item) => item.id === itemId)

    // Remove the item from the list.
    if (index >= 0) {
      items.splice(index, 1)
    }
  }

  /**
   * Remove a child item from a top-level item.
   *
   * @param {string} itemId
   * @param {string} subitemId
   */
  _removeSubItem(itemId, subitemId) {
    // Create a list of items with corresponding hashes.
    const items = this.items.map((item) => ({
      id: hashObject(item),
      item: item
    }))

    // Find an item with the same hash as the item id.
    const index = items.findIndex((item) => item.id === itemId)

    if (index >= 0) {
      // If we've found an item, remove the matching sub item.
      const item = this.items[index]
      this._removeItem(subitemId, item.add || [])
    }
  }
}

module.exports = Cart
