var specify = require('specify')
  , perceptron = require('../perceptron_associative')

specify('basic training', function(test) {
  var opts = {
    weights: {'a': 0, 'b': 0, 'c': 0, 'threshold': 0},
    learningrate: 1,
    debug:0
  }
  var p = perceptron(opts)

  p.train({'a': 0, 'b': 0, 'c': 1}, 0)
  // weights should have remained the same
  test.equal(p.weights['a'], 0)
  test.equal(p.weights['b'], 0)
  test.equal(p.weights['c'], 0)

  // weights should change now
  p.train({'a': 1, 'b': 1, 'c': 1}, 1)
  test.equal(p.weights['a'], 1)
  test.equal(p.weights['b'], 1)
  test.equal(p.weights['c'], 1)

  p.train({'a': 1, 'b': 0, 'c': 1}, 1)
  p.train({'a': 0, 'b': 1, 'c': 1}, 0)

  // with this data set only one round of training is needed
  test.equal(p.perceive({'a': 0, 'b': 0, 'c': 1}), 0)
  test.equal(p.perceive({'a': 1, 'b': 1, 'c': 1}), 1)
  test.equal(p.perceive({'a': 1, 'b': 0, 'c': 1}), 1)
  test.equal(p.perceive({'a': 0, 'b': 1, 'c': 1}), 0)
})

specify('Bird perceptron', function(test) {
  var bird = perceptron()
  bird.train({'wings': 2, 'legs': 2}, 1)
  bird.train({'wings': 0, 'legs': 2}, 0)
  bird.train({'wings': 2, 'legs': 4}, 0)
  bird.train({'wings': 0, 'legs': 4}, 0)
  var count = 0
  while(!bird.retrain()) {
    count++
  }
  // retraining shouldn't take more than a few iterations, really
  test.ok(count < 20)
  test.equal(bird.perceive({'wings': 2, 'legs': 2}), 1)
  test.equal(bird.perceive({'wings': 0, 'legs': 2}), 0)
  test.equal(bird.perceive({'wings': 2, 'legs': 4}), 0)
  test.equal(bird.perceive({'wings': 0, 'legs': 4}), 0)
})

specify.run()
