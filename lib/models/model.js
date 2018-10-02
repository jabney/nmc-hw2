
const fs = require('fs')
const util = require('util')

const storage = require('../storage')

const { NotImplementedError } = require('../errors')

/**
 * @typedef {{[key: string]: any}} Record
 */

// Promisify storage methods.
const createFile = util.promisify(storage.create)
const readFile = util.promisify(storage.read)
const updateFile = util.promisify(storage.update)
const deleteFile = util.promisify(storage.delete)

class Model {
  /**
   * @param {string} name
   * @param {string} [id]
   */
  constructor(name, id) {
    /**
     * @type {string} The storage folder name
     */
    this._name = name

    /**
     * @type {string}
     */
    this.id = id

    /**
     * @type {string}
     */
    this._baseDir = `${storage.baseDir}/${name}`

    // Create the base directory if it does not already exist.
    if (!fs.existsSync(this._baseDir)) {
      fs.mkdirSync(this._baseDir)
    }
  }

  /**
   * @param {string} [id]
   */
  async load(id) {
    this._setId(id)

    // Load data from disk.
    const data = await readFile(this._name, this.id)

    // Pass parsed data to deserializer.
    this.deserialize(data)
  }

  /**
   * @param {string} [id]
   */
  async save(id) {
    this._setId(id)

    // Get serialized data.
    const data = this.serialize()

    /**
     * @type {Record}
     */
    let existing

    try {
      // Get existing record if it exists.
      existing = await readFile(this._name, this.id)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File not found.
        existing = null
      } else {
        // Some other error occurred.
        throw error
      }
    }

    if (existing) {
      // Update existing record.
      await updateFile(this._name, this.id, { ...existing, ...data })

    } else {
      // Create new record
      await createFile(this._name, this.id, data)
    }
  }

  /**
   * @param {string} [id]
   */
  async delete(id) {
    this._setId(id)

    // Load data from disk.
    const data = await deleteFile(this._name, this.id)

    // Pass parsed data to deserializer.
    this.deserialize({})
  }

  /**
   * @abstract
   *
   * @returns {Record}
   */
  serialize() { throw new NotImplementedError() }

  /**
   * @abstract
   *
   * @param {Record} record
   */
  deserialize(record) { throw new NotImplementedError() }

  /**
   * @param {string} id
   */
  _setId(id) {
    // Set the id of this instance to the given id (if defined).
    if (typeof id !== 'undefined') {
      // If the internal id is already defined, log an error.
      if (typeof this.id !== 'undefined') {
        // Logic error.
        return console.warn(`id "${this.id}" already set for User model`)
      }
      // Set the internal id.
      this.id = id
    }

    // The internal id should be set.
    if (typeof this.id === 'undefined') {
      throw new ReferenceError('non-existent id: cannot save model')
    }
  }
}

module.exports = Model
