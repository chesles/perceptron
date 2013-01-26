var specify = require('specify')
  , perceptron = require('../perceptron')

specify('basic training', function(test) {
  var opts = {
    weights: [0, 0, 0, 0],
    learningrate: 1
  }
  var p = perceptron(opts)

  p.train([0, 0, 1], 0)
  // weights should have remained the same
  test.equal(p.weights[0], opts.weights[0])
  test.equal(p.weights[1], opts.weights[1])
  test.equal(p.weights[2], opts.weights[2])

  // weights should change now
  p.train([1, 1, 1], 1)
  test.equal(p.weights[0], opts.weights[0] + 1)
  test.equal(p.weights[1], opts.weights[1] + 1)
  test.equal(p.weights[2], opts.weights[2] + 1)

  p.train([1, 0, 1], 1)
  p.train([0, 1, 1], 0)

  // with this data set only one round of training is needed
  test.equal(p.perceive([0, 0, 1]), 0)
  test.equal(p.perceive([1, 1, 1]), 1)
  test.equal(p.perceive([1, 0, 1]), 1)
  test.equal(p.perceive([0, 1, 1]), 0)
})

specify('AND perceptron', function(test) {
  var and = perceptron() //{weights: [0, 0, -0.3]})
  and.train([1,1], 1)
  and.train([0,0], 0)
  and.train([1,0], 0)
  and.train([0,1], 0)
  var count = 0
  while(!and.retrain()) {
    count++
  }
  // retraining shouldn't take more than a few iterations, really
  test.ok(count < 20)
  test.equal(and.perceive([1,1]), 1)
  test.equal(and.perceive([0,1]), 0)
  test.equal(and.perceive([1,0]), 0)
  test.equal(and.perceive([0,0]), 0)
})

specify.run()
