const runner = require('./lib/test-runner')

runner.add(require('./lib/validator/validator.spec'))
runner.add(require('./lib/models/token.model.spec'))

runner.run()
