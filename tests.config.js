const runner = require('./lib/test-runner')

runner.add(require('./lib/validator/validator.spec'))

runner.run()
