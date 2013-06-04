var specify = require('specify')
	, perceptron = require('../perceptron_associative')
specify('Text categorization - feature extractor', function(test) {
	var opts = {
		feature_extractor: function(input, features) { // a simple 1-gram word extractor:
			var words = input.split(" ");
			for (var i=0; i<words.length; ++i)
				features[words[i]]=1;
		},
		learningrate: 1,
		debug: 0
	};

	var news = perceptron(opts)
	news.train("This is a very new information", 1)
	news.train("This is a very old information", 0)
	news.train("I bring you the new relevant fantastic story", 1)
	news.train("Did you hear the old story ?", 0)
	var count = 0
	while(!news.retrain() && count<20) {
		count++
	}

	//console.dir(news.weights);
	
	// binary test:
	test.equal(news.perceive("There is some new information in the pub"), 1);
	test.equal(news.perceive("This story is too old to be interesting"), 0);

	// net test:	
	test.ok(news.perceive("There is some new information in the pub", true) > 0);
	test.ok(news.perceive("This story is too old to be interesting",  true) < 0);
})

specify.run()
