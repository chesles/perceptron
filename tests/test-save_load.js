var perceptron = require('../perceptron_associative')
  , should = require('should')

{ /* start test: */
  var opts = {
    weights: {'a': 0, 'b': 0, 'c': 0, 'threshold': 0},
    learningrate: 1,
    debug:0
  }
  var p = perceptron(opts);

  p.train({'a': 1, 'b': 0, 'c': 1}, 1)
  p.train({'a': 0, 'b': 1, 'c': 1}, 0)
  console.dir(p.weights);

  // Test results before save:
  p.perceive({'a': 1, 'b': 0, 'c': 1}).should.equal(1);
  p.perceive({'a': 0, 'b': 1, 'c': 1}).should.equal(0);
  p.perceive({'a': 0, 'b': 1, 'c': 0}).should.equal(0);
  p.perceive({'a': 1, 'b': 0, 'c': 0}).should.equal(1);

  p.save("abc");

  // Test results after load:
  q = perceptron();
  q.load("abc");
  console.dir(q.weights);
  q.perceive({'a': 1, 'b': 0, 'c': 1}).should.equal(1);
  q.perceive({'a': 0, 'b': 1, 'c': 1}).should.equal(0);
  q.perceive({'a': 0, 'b': 1, 'c': 0}).should.equal(0);
  q.perceive({'a': 1, 'b': 0, 'c': 0}).should.equal(1);
  
  // Test train after load:
  q.train({'a': 1, 'b': 0, 'c': 0}, 0);
  console.dir(q.weights);
  q.perceive({'a': 1, 'b': 0, 'c': 0}).should.equal(0);
  
  console.log("OK!");
}
