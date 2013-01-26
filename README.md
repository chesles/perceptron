## Perceptron.

This is an implementation of the [perceptron learning algorithm](http://en.wikipedia.org/wiki/Perceptron#Learning_algorithm) for node.js.

## Installing it.

    npm install perceptron

## Using it.

Let's teach a perceptron to implement a boolean AND function:

```
var perceptron = require('perceptron')

var and = perceptron()

and.train([1, 1], 1)
and.train([0, 1], 0)
and.train([1, 0], 0)
and.train([0, 0], 0)

// practice makes perfect (we hope...)
while(!and.retrain()) {}

and.perceive([1, 1]) // => 1
and.perceive([0, 1]) // => 0
and.perceive([1, 0]) // => 0
and.perceive([0, 0]) // => 0
```

The perceptron starts with random weights if you don't provide any defaults.
Weights are adjusted according to the delta rule each time you call `train` and
the current weights give the wrong answer. Since this adjustment can cause the
perceptron to 'unlearn' previously learned inputs, `retrain` iterates over all
previous inputs, calling `train` again. Both `train` and `retrain` return a
boolean success value, indicating if the input(s) were learned.
