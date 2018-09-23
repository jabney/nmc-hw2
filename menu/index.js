// /**
//  * @typedef {'item'|'option'|'pizza'} ItemType
//  */

/**
 * @typedef {'x-small'|'small'|'medium'|'large'|'x-large'} ItemSize
 */

/**
 * @typedef {Object} Item
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
 * @type {Menu}
 */
const menu = {
  items: [
    {
      name: 'Big Bear Special',
      desc: 'A pizza only an actual bear would want to order. We heap gobs of fresh, raw salmon on a pizza with various other toppings of dubious quality and freshness, from undisclosed sources.',
    },
    {
      name: 'Cheeze Pizza (a.k.a The Commando)',
      desc: 'A pizza with nothing but cheeze. We\'re not really sure why though.',
    },
    {
      name: 'Combination Pizza',
      desc: 'A pizza with pepperoni, italian sausage, mushrooms, olives, and green peppers - for those needing a low-risk or unimaginative pizza option.',
    },
    {
      name: 'The Node',
      desc: 'An asynchronous, event-driven pizza with chicken sausage, bacon, tomatoes, and fresh basil - for anyone wanting a pizza that runs on the front and back end.',
    },
    {
      name: 'The Leslie',
      desc: 'An erudite and cosmopolitan pizza with pepperoni, bacon, roasted garlic, and pine nuts - for customers with sophisticated taste and a sense of style.',
    },
    {
      name: 'The Full Stack',
      desc: 'A fully-capable, well-rounded pizza with pepperoni, bacon, italian sausage, mushrooms, black olives, roasted garlic, spinach, pine nuts, jalepenos, and fresh basil. It would have been simpler to list what this pizza doesn\'t have on it.',
    },
    {
      name: 'The Gambler (a.k.a the RNG)',
      desc: 'We select three toppings at random and apply them generously but indiscriminately to a cheese pizza. No refunds.',
    },
    {
      name: 'The Chef\'s Special',
      desc: 'This pizza is for repeat customers who\'ve been discourtious to our drivers on previous deliveries. We start with the pizza you order and add some additional, non-disclosed bonus toppings free of charge. Bon apetit!',
    },
    {
      name: 'The Proprietary (build your own)',
      desc: 'Apparently we failed in our duty to provide enough pizza options and you have decided to build your own. Or perhaps you are just a wierdo. This pizza starts with cheese and then makes your every wish its command.'
    }
  ],
  toppings: [
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
}

module.exports = menu
