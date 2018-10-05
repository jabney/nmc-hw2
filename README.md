# Big Bear Pizza

## Highlights

I spent quite a bit of time, too much actually, on a bunch of extras. As I began the course materials, I became curious about how to go about implementing some basic versions of things that I would otherwise depend on an NPM library or framework to accomplish, and went about coding these up as I followed the lectures. This added to the complexity of homework #2 (especially the validator and validation logic) and thus the time involved to complete it. While this was time consuming and unnecesary for the homework, I found it rewarding and ultimately it was time well spent from a learning perspective.

I also spent a good deal of time on the menu, the cart model, and the cart api to make them feature rich. Items can be added to a cart over successive requests, and items can be deleted. A cart 'subitem' an also be deleted. The logic for this was somewhat complicated, at least the way I went about it. See [Delete a Cart Item](#delete-a-cart-item) below for a little more detail. This was overkill for this assignment, especially considering it was already challenging to begin with.

There are some rough spots and things I might have done better or differently if I hadn't burned up so much time on things that weren't actually required to complete the assignment!

I will usually complete an assignment by going beyond the minimum requirements; but most likely, on future assignments, I will try not to get so carried away.

### Data Access Objects

Models are set up as Data Access Objects, managing their own use of the storage api. Various models inherit from the `Model` base class.

```javascript
// Create and save a token to storage.
const token = new Token()
token.userId = userId
token.expires = expireMs
await token.save()
```

```javascript
// Load a token from storage.
const token = new Token(tokenId)
await token.load()
```

### Services

Both the Stripe and Mailgun APIs are wrapped by services.

```javascript
// Create an instance of the stripe service.
const stripe = new StripeService({
  number: ccinfo.number,
  exp_month: ccinfo.exp_month,
  exp_year: ccinfo.exp_year,
  cvc: ccinfo.cvc
})

try {
  // Charge the customer.
  await stripe.charge(total, token.userId)
} catch (error) {
  return response(400, { message: error.message})
}
```

```javascript
// Create an instance of the mailgun service.
const mailgun = new MailgunService({
  to: token.userId,
  subject: 'Your order is on its way!',
  text: message
})

try {
  // Send the order confirmation.
  await mailgun.send()
} catch (error) {
  console.error(`<orders> error sending email to "${token.userId}"`, error)
}
```

### API Input Validation

Each API method that accepts external input is validated.

```javascript
/**
 * Validate GET data for the users API.
 *
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: GetData) => void} callback
 */
const get = function get(data, callback) {
  const validator = new Validator(data)

  const email = validator
    .name('email')
    .from('query')
    .isString({trim: true, msg: 'email must be a string'})
    .matches(/^.+?@.+?\..{2,3}$/, { msg: 'email must be an email address'})
    .get()

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { email, tokenId })
}
```

Validation errors are intercepted in the handler and cause a 400 response to be issued to the client.

```javascript
/**
 * Users GET handler
 *
 * @type {RequestHandler}
 */
lib.get = (requestData, response) => {
  // Vaidate incoming request data.
  userValidators.get(requestData, async (errors, validationData) => {
    // Check for validation errors.
    if (errors && errors.length > 0) {
      return response(400, { errors })
    }

    // Get the validator data.
    const { email, tokenId } = validationData

    // Verify the token.
    const verified = await Token.verify(tokenId)
    if (verified !== true) {
      return response(403, { error: 'not authorized' })
    }

    // Continue handling request...
  })
```

### Test Runner

The project includes a test runner and a couple of basic tests for one of the modules. I hope to add support for asynchronous tests down the road which will allow more robust test cases.

![Test runner in action](/public/images/test-runner.png "Test Runner")

### Body Parser

I added a body parser module to parse both `application/json` and `applicationx-www-form-urlencoded`, so in theory the api will transparently support requests using either json or form data.

### Workers

The `workers` module periodically removes expired tokens.

### Static Assets

The server is set up to serve static assets on the `public` route. This isn't used yet, but it works.

```
GET /public/images/die-hard.jpg
```

![John McClane in a duct with a lighter](/public/images/die-hard.jpg "Die Hard")

## Setup

The `watch` script looks for a `.env` file to load with a number of key environment variables. This file is not a part of the repo and needs to be created manually.

```
export NODE_DEBUG=whatever
export HASHING_SECRET=hiatus
export STRIPE_PRIVATE_KEY=sk_test_EQ3a...
export MAILGUN_API_KEY=9925...
```

## Startup

To watch project files for changes and restart the server:

```
$ ./watch
```

To just run the server:

```
$ node index
```

## Tests

There are only a couple of tests in a single spec. I spent more time on the test runner itself than writing tests. The test runner doesn't yet support async tests which limits its usefulness here.

To watch project files for changes and re-run the tests;

```
$ ./test
```

To just run the tests:

```
$ node tests.config
```

## Project Requirements

### 1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

#### Create a User

Request:

```
POST /users
Content-Type: application/json

{
	"firstName": "James",
	"lastName": "Abney",
	"email": "jimmy@example.com",
	"password": "abcdefghij",
	"address": {
		"line1": "1234 5th Street",
		"line2": "Suite 42",
		"city": "Auburn",
		"state": "WA",
		"zip": "98001-0000"
	}
}
```

Response:

```
{
  "user": {
    "firstName": "James",
    "lastName": "Abney",
    "email": "jimmy@example.com",
    "address": {
      "line1": "1234 5th Street",
      "line2": "Suite 42",
      "city": "Auburn",
      "state": "WA",
      "zip": "98001-0000"
    }
  }
}
```

#### Modify a User

Users can be updated partially or completely.

Request:

```
PATCH: /users
Content-Type: application/json

{
	"firstName": "Jimmy"
}
```

Response:

```
{
  "user": {
    "firstName": "Jimmy",
    "lastName": "Abney",
    "email": "james.abney@gmail.com",
    "address": {
      "line1": "1234 5th Street",
      "line2": "Suite 42",
      "city": "Auburn",
      "state": "WA",
      "zip": "98001-0001"
    }
  }
}
```

#### Delete a User

This will delete a user record along with their cart and token.

Request:

```
DELETE /users?email=jimmy@example.com
```

Response:

```
{
  "message": "user deleted successfully"
}
```

### 2. Users can log in and log out by creating or destroying a token.

#### Create a Token

Request:

```
POST /tokens
Content-Type: application/json

{
  "email": "jimmy@example.com",
  "password": "abcdefghij"
}
```

Response:

```
{
  "token": {
    "id": "AzUE6OOc7Be1uYoeJzppGbD1aemUcFoK",
    "userId": "jimmy@example.com",
    "expires": 1538851570228
  }
}
```

#### Delete a Token

Request:

```
DELETE /tokens?token=drBms08zTlxf3UiosWkrIOsVERcwDHU7
```

Response:

```
{
  "message": "token deleted"
}
```

### 3. When a user is logged in, they should be able to GET all the possible menu items.

Request:

```
GET /menu
```

Response:

See [The Menu](#the-menu) at the end of this document for the complete menu response.

### 4. A logged-in user should be able to fill a shopping cart with menu items

#### Add Cart Items

A user may submit multiple requests to add items to the cart.

Request:

```
POST /cart
Content-Type: application/json

{
	"items": [
		{
			"id": "big-bear-special-pizza",
			"size": "x-large"
		},
		{
			"id": "proprietary-pizza",
			"size": "large",
			"add": [
				{
					"id": "roasted-garlic-topping"
				},
				{
					"id": "bacon-topping"
				},
				{
					"id": "fresh-basil-topping"
				}
			]
		},
		{
			"id": "spinach-salad",
			"size": "regular",
			"add": [
				{
					"id": "blue-cheese-dressing"
				}
			]
		},
		{
			"id": "diet-snpa-beverage",
			"size": "regular"
		}
	]
}
```

Response:

```
{
  "cart": {
    "total": 47.48,
    "items": [
      {
        "id": "LY4NoBMtw9ovD-GlAxs-nerLNYDYDd1X4EapcWvR8HM",
        "name": "The Big Bear Special",
        "size": "x-large",
        "price": 18.99
      },
      {
        "id": "DcYV5s1L6RF-gbZMbgLdv2de4DdyxKPW6aSjLsLyWrE",
        "name": "The Proprietary (build your own)",
        "size": "large",
        "price": 13.99,
        "add": [
          {
            "id": "4oHU4e8Wf-7o1itU6OQjYqwLU7kIAIa18d1E6YQEib4",
            "name": "Bacon",
            "price": 2
          },
          {
            "id": "s9YDd-1vs-CbBsRvfqeHWjaE-8w_Qz88DZN4ICPwWSw",
            "name": "Fresh Basil",
            "price": 1.5
          },
          {
            "id": "U3ih-8-5cE5qJiMADZfs9YT-gZQjXl6FNZQu65LIT1U",
            "name": "Roasted Garlic",
            "price": 1.5
          }
        ]
      },
      {
        "id": "54l3-5b8mny-UKmh65ZUlOHQplTfDYA2ErO6Dq2i7Xw",
        "name": "Spinach Salad",
        "size": "regular",
        "price": 5,
        "add": [
          {
            "id": "x4ddz6EcrkEEku5Uw4gNIUkCATxZNaKm_VuDkRdiXSE",
            "name": "Blue Cheese Dressing",
            "price": 1.5
          }
        ]
      },
      {
        "id": "iUI2FrkuSYpVYScK6_QHJEF4KfjfH9vfjTG_4XX_16Y",
        "name": "Diet Sierra Nevada Pale Ale",
        "size": "regular",
        "price": 3
      }
    ]
  }
}
```

#### Delete a Cart Item

An item can be deleted by submitting the `id` of an item returned in the POST request. Submitting with no `id` query parameter will remove all items from the cart. The response will contain the user's updated cart. Cart subitems can also be deleted by submitting a compound id consisting of both the item id and the subitem id delimited with a colon, i.e., `/cart?id=<item-id>:<sub-item-id>`.

Note: Item IDs are generated by hashing each item in the cart after sorting the sub items by id. This creates a unique identity for a cart item based solely on its contents. The hash is further base64url encoded so that it can be used in a DELETE query parameter.

Request:

```
DELETE /cart?id=54l3-5b8mny-UKmh65ZUlOHQplTfDYA2ErO6Dq2i7Xw
```

Response:

```
{
  "cart": {
    "total": 40.98,
    "items": [
      {
        "id": "LY4NoBMtw9ovD-GlAxs-nerLNYDYDd1X4EapcWvR8HM",
        "name": "The Big Bear Special",
        "size": "x-large",
        "price": 18.99
      },
      {
        "id": "DcYV5s1L6RF-gbZMbgLdv2de4DdyxKPW6aSjLsLyWrE",
        "name": "The Proprietary (build your own)",
        "size": "large",
        "price": 13.99,
        "add": [
          {
            "id": "4oHU4e8Wf-7o1itU6OQjYqwLU7kIAIa18d1E6YQEib4",
            "name": "Bacon",
            "price": 2
          },
          {
            "id": "s9YDd-1vs-CbBsRvfqeHWjaE-8w_Qz88DZN4ICPwWSw",
            "name": "Fresh Basil",
            "price": 1.5
          },
          {
            "id": "U3ih-8-5cE5qJiMADZfs9YT-gZQjXl6FNZQu65LIT1U",
            "name": "Roasted Garlic",
            "price": 1.5
          }
        ]
      },
      {
        "id": "iUI2FrkuSYpVYScK6_QHJEF4KfjfH9vfjTG_4XX_16Y",
        "name": "Diet Sierra Nevada Pale Ale",
        "size": "regular",
        "price": 3
      }
    ]
  }
}
```

### 5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment.

Request:

```
{
	"ccinfo": {
		"number": 4242424242424242,
		"exp_month": 12,
		"exp_year": 2019,
		"cvc": 456
	}
}
```

Response:

```
{
  "message": "order successful"
}
```

### 6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this.

```
From: Big Bear Pizza <bigbear@sandboxa829973ebc32434bbe472c1cb3c03469.mailgun.org>
To: jimmy@example.com
Subject: Your order is on its way!
```

Body:

```
                             Thanks for your order!

Delivering to:

  1234 5th Street
  Suite 42
  Auburn
  WA
  98001-0001

Your order:

--------------------------------------------------------------------------------
The Big Bear Special
  x-large
  $18.99

The Proprietary (build your own)
  large
  $13.99
 With: Bacon: $2.00, Fresh Basil: $1.50, Roasted Garlic: $1.50

Diet Sierra Nevada Pale Ale
  regular
  $3.00

--------------------------------------------------------------------------------
Total: $40.98  (card ending in 4242)
--------------------------------------------------------------------------------
```

### The Menu

```
GET /menu
```

Response:

```json
{
  "welcome": [
    "                            Welcome to Big Bear Pizza                           ",
    "                                                                                ",
    "                                                                                ",
    "                                                .                               ",
    "                              ..:::..:...   .::::::.... .                       ",
    "                          ::1111::::.    .:::::111:..::. ..                     ",
    "                       .::111:::..    ..:::.::::::1:::::.....                   ",
    "                    ...::::::....   .::::...:::::::........                     ",
    "                  .::11::::.....  ..:::...::::....        ....                  ",
    "                 .:::1:::.........::......::...        .                        ",
    "                .:::::......:....::...  ....                      ...           ",
    "               ....:::.....::..::::..  :221:..  ....:::::....   .:11::.         ",
    "              ....::::...::.::::::::...188888::...::::111::...:1281111:         ",
    "             ....:11:...:::::::::::::1::1281.......:...........:::1282.         ",
    "             ::::111:..:1::::::::.::11. .11.....::::::::::::..  ...11.          ",
    "            ::111112:.:::::1:1::::::1:..:1:::::.::::::11:::.... ....:           ",
    "           .:1212222::::::11:::111111:.:121::.::::::::1:::..:...  ..:.          ",
    "           :211112221::::11:::11122221.:21:::::1::111::111:::::....::           ",
    "          .11111122211111111:::1212222121::::22122281::22221111::::.            ",
    "          :1111222221:111111.:11222222822:.:11112211::::11111111:::             ",
    "          :::112222211:1111:.1222222222281.:111111:::::::12111111:.             ",
    "          :111111222111111::122222222228882::2211:::::::::111211.:.             ",
    "          .v1111122211222::122222222222288881121:::::.:::::111:.:1.             ",
    "           .2222222222221:1222122222228821111:::::..::...::11:.:11              ",
    "            v22222222888:12222122228881:...    .1111::::::..::11::              ",
    "            .12112212882:111222222221:...       .288282111:.:111::              ",
    "             :2112228881::11128828:  .:::11:..:.  :1111:....:::::.              ",
    "              v11128888::111228881  :112882:.:11v...      .....1:               ",
    "              .11112888::11211188 .2888:v:....   .v:..    ..  .....             ",
    "              .111128882:12111121:88288           88211:.......   ...           ",
    "               :::12888811112222122228:          :8882281:::::.     :..         ",
    "               ::12228888111122222122:           :822221...:111:::.  .::..      ",
    "                112122888111112112112            :22222.  .1221.:vvv:::..:      ",
    "                :111222821:1111122122.           v22222:.12218:                 ",
    "                .111111221:12122222112..         :821121282121                  ",
    "                 111111221:1222222222222v.       .21222821128                   ",
    "                 :11121122::12228822222222v.     .2122222212v                   ",
    "                 .112221121 .222888828222222v    .2222222221.                   ",
    "                 .112128211:.:288822288222228v   :2222222128.                   ",
    "                 :11122221::: :88822222222288:   22122111122                    ",
    "               ..:::1222221:1::.v88882288212:   v2221221121. ...  ...   .       ",
    "    ...... .....:111111:1211112v1:18888282v:   v82288222221 ..  .   ..  ..  ..:.",
    "....:::..::......vv::::.:v::::::1:.::::.::.. .:2v:82v222222:.................:.."
  ],
  "menu": {
    "pizza": [
      {
        "order": 0,
        "name": "The Big Bear Special",
        "id": "big-bear-special-pizza",
        "type": "pizza",
        "desc": "A pizza only an actual bear would want to eat. We add a whole,
          raw salmon to a pizza with various other toppings of dubious quality
          and freshness.",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 1,
        "name": "Cheese Pizza (a.k.a The Commando)",
        "id": "cheese-pizza",
        "type": "pizza",
        "desc": "An unencumbered pizza with nothing but cheese.",
        "price": {
          "small": 9.99,
          "medium": 11.99,
          "large": 13.99,
          "x-large": 15.99
        }
      },
      {
        "order": 2,
        "name": "Combination Pizza",
        "id": "combo-pizza",
        "type": "pizza",
        "desc": "A pizza with pepperoni, italian sausage, mushrooms, olives,
          and green peppers - for those needing a low-risk or unimaginative
          pizza option.",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 3,
        "name": "The Node",
        "id": "node-pizza",
        "type": "pizza",
        "desc": "An asynchronous, event-driven pizza with chicken sausage,
          bacon, tomatoes, and fresh basil - for anyone wanting a pizza
          that runs on the front and back end.",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 4,
        "name": "The Leslie",
        "id": "leslie-pizza",
        "type": "pizza",
        "desc": "An erudite and cosmopolitan pizza with pepperoni, bacon,
          roasted garlic, and pine nuts - for customers with sophisticated
          taste and a sense of style.",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 5,
        "name": "The Full Stack",
        "id": "full-stack-pizza",
        "type": "pizza",
        "desc": "A fully-capable, well-rounded pizza with pepperoni, bacon,
          italian sausage, mushrooms, black olives, roasted garlic, spinach,
          pine nuts, jalepenos, and fresh basil. It would've been simpler to
          list what this pizza doesn't have on it.",
        "price": {
          "small": 15.99,
          "medium": 17.99,
          "large": 19.99,
          "x-large": 21.99
        }
      },
      {
        "order": 6,
        "name": "The Gambler (a.k.a the RNG)",
        "id": "gambler-pizza",
        "type": "pizza",
        "desc": "We select three toppings at random and apply them generously
          but indiscriminately to a cheese pizza. No refunds.",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 7,
        "name": "The Chef's Special",
        "id": "chefs-special-pizza",
        "type": "pizza",
        "desc": "This pizza is for repeat customers who've been discourtious
          to our drivers on previous deliveries. We start with the pizza you
          order and add some additional, non-disclosed bonus toppings free of
          charge. Bon apetit!",
        "price": {
          "small": 12.99,
          "medium": 14.99,
          "large": 16.99,
          "x-large": 18.99
        }
      },
      {
        "order": 8,
        "name": "The Proprietary (build your own)",
        "id": "proprietary-pizza",
        "type": "pizza",
        "desc": "We failed in our duty to provide enough pizza options and now
          you are forced to build your own. Or perhaps you are just a wierdo.
          his pizza starts with cheese and then makes your every wish its command.",
        "price": {
          "small": 9.99,
          "medium": 11.99,
          "large": 13.99,
          "x-large": 15.99
        }
      }
    ],
    "toppings": [
      {
        "order": 9,
        "name": "Pepperoni",
        "id": "pepperoni-topping",
        "type": "topping",
        "price": {
          "small": 1,
          "medium": 1.5,
          "large": 2,
          "x-large": 2.5
        }
      },
      {
        "order": 10,
        "name": "Italian Sausage",
        "id": "italian-sausage-topping",
        "type": "topping",
        "price": {
          "small": 1,
          "medium": 1.5,
          "large": 2,
          "x-large": 2.5
        }
      },
      {
        "order": 11,
        "name": "Chicken Sausage",
        "id": "chicken-sausage-topping",
        "type": "topping",
        "price": {
          "small": 1,
          "medium": 1.5,
          "large": 2,
          "x-large": 2.5
        }
      },
      {
        "order": 12,
        "name": "Bacon",
        "id": "bacon-topping",
        "type": "topping",
        "price": {
          "small": 1,
          "medium": 1.5,
          "large": 2,
          "x-large": 2.5
        }
      },
      {
        "order": 13,
        "name": "Mushrooms",
        "id": "mushrooms-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 14,
        "name": "Black Olives",
        "id": "black-olives-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 15,
        "name": "Roasted Garlic",
        "id": "roasted-garlic-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 16,
        "name": "Green Peppers",
        "id": "green-peppers-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 17,
        "name": "Tomatoes",
        "id": "tomatoes-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 18,
        "name": "Spinach",
        "id": "spinach-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 19,
        "name": "Jalepenos",
        "id": "jalepenos-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 20,
        "name": "Pine Nuts",
        "id": "pine-nuts-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      },
      {
        "order": 21,
        "name": "Fresh Basil",
        "id": "fresh-basil-topping",
        "type": "topping",
        "price": {
          "small": 0.5,
          "medium": 1,
          "large": 1.5,
          "x-large": 2
        }
      }
    ],
    "salads": [
      {
        "order": 22,
        "name": "Garden Salad",
        "id": "garden-salad",
        "type": "salad",
        "price": {
          "regular": 5,
          "large": 6.5
        }
      },
      {
        "order": 23,
        "name": "Greek Salad",
        "id": "greek-salad",
        "type": "salad",
        "price": {
          "regular": 5,
          "large": 6.5
        }
      },
      {
        "order": 24,
        "name": "Caesar Salad",
        "id": "caesar-salad",
        "type": "salad",
        "price": {
          "regular": 5,
          "large": 6.5
        }
      },
      {
        "order": 25,
        "name": "Spinach Salad",
        "id": "spinach-salad",
        "type": "salad",
        "price": {
          "regular": 5,
          "large": 6.5
        }
      }
    ],
    "dressings": [
      {
        "order": 26,
        "name": "House Dressing",
        "id": "house-dressing",
        "type": "dressing",
        "price": {
          "regular": 1.5,
          "large": 2
        }
      },
      {
        "order": 27,
        "name": "Caesar Dressing",
        "id": "caesar-dressing",
        "type": "dressing",
        "price": {
          "regular": 1.5,
          "large": 2
        }
      },
      {
        "order": 28,
        "name": "Blue Cheese Dressing",
        "id": "blue-cheese-dressing",
        "type": "dressing",
        "price": {
          "regular": 1.5,
          "large": 2
        }
      },
      {
        "order": 29,
        "name": "Ranch Dressing",
        "id": "ranch-dressing",
        "type": "dressing",
        "price": {
          "regular": 1.5,
          "large": 2
        }
      },
      {
        "order": 30,
        "name": "Italian Dressing",
        "id": "italian-dressing",
        "type": "dressing",
        "price": {
          "regular": 1.5,
          "large": 2
        }
      }
    ],
    "beverages": [
      {
        "order": 31,
        "name": "San Pellegrino",
        "id": "san-pellegrino-beverage",
        "type": "beverage",
        "desc": "Delicious sparkling water.",
        "price": {
          "regular": 2.5
        }
      },
      {
        "order": 32,
        "name": "Water",
        "id": "water-beverage",
        "type": "beverage",
        "desc": "Delicious water without the sparkles",
        "price": {
          "regular": 1
        }
      },
      {
        "order": 33,
        "name": "Cola",
        "id": "cola-beverage",
        "type": "beverage",
        "price": {
          "regular": 1.5
        }
      },
      {
        "order": 34,
        "name": "Diet Cola",
        "id": "diet-cola-beverage",
        "type": "beverage",
        "price": {
          "regular": 1.5
        }
      },
      {
        "order": 35,
        "name": "Sierra Nevada Pale Ale",
        "id": "snpa-beverage",
        "type": "beverage",
        "desc": "A very butch beer with tons of flavor.",
        "price": {
          "regular": 2.5
        }
      },
      {
        "order": 36,
        "name": "Diet Sierra Nevada Pale Ale",
        "id": "diet-snpa-beverage",
        "type": "beverage",
        "desc": "The exact same as regular SNPA but \"diet\".",
        "price": {
          "regular": 3
        }
      }
    ]
  }
}
```
