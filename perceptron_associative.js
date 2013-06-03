var associative = require("./associative");

/**
 * A version of Perceptron where the weights vector is an associative array (not a numeric array), 
 * so the features can be any objects (not just nubmers).
 * @author Erel Segal-haLevi
 * @since 2013-05-27
 * 
 * @param opts optional parameters: <ul>
 *	<li>debug 
 *	<li>weights: initial weights (if not given, initialized to default_weight).
 *  <li>default_weight: default weight for a newly discovered feature (default = 0).
 *	<li>learningrate: defaults to 0.1.
 *	<li>feature_extractor: function that converts input samples to feature arrays. If not given, the input sample itself is treated as an associative array of features.
 * 
 */
function PerceptronAssociative(opts) {
	if (this === global) return new PerceptronAssociative(opts);
	if (!opts) opts = {}


	if (!('debug' in opts)) 
		opts.debug = false; 
	if (!('default_weight' in opts))
		opts.default_weight = 0;
	if (!('use_averaging' in opts))
		opts.use_averaging = false;
	if (!('learningrate' in opts))
		opts.learningrate = 0.1;

	var feature_extractor = 'feature_extractor' in opts
		? opts.feature_extractor
		: 0;
		
	var weights = 'weights' in opts
		? opts.weights			 /* should be an associative array */
		: {}
	var weights_sum = {};   // for averaging; see http://ciml.info/dl/v0_8/ciml-v0_8-ch03.pdf
	if (opts.use_averaging) associative.add(weights_sum, weights);

	var fs = require('fs'), mkpath = require('mkpath');

	/**
	 * Keep track of ALL training samples, their perceived values and their correct (target) values. 
	 */
	var data = []

	var api = {
		weights: weights,

		save: function(folder) {
			mkpath.sync(folder);
			fs.writeFileSync(folder+"/opts.json", "{\n"+
					'\t"opts": '+JSON.stringify(opts, null, "\t")+"\n,"+ 
					'\t"weights": '+associative.stringify_sorted(weights, "\n\t\t")+",\n"+
					'\t"weights_sum": '+associative.stringify_sorted(weights_sum, "\n\t\t")+"\n"+
				"}\n"
			);
			fs.writeFileSync(folder+"/data.json", JSON.stringify(data,null,"\t"));
		},

		load: function(folder) {
			data = JSON.parse(fs.readFileSync(folder+"/data.json"));
			opts = JSON.parse(fs.readFileSync(folder+"/opts.json"));
			
			api.weights = weights = opts.weights;
			weights_sum = opts.weights_sum;
			opts = opts.opts;
		},
		
		normalized_features: function (inputs) {
			if (feature_extractor)	{
				var features = {};
				feature_extractor(inputs, features);
			} else {
				var features = inputs;
			}
			features['bias'] = 1;
			return features;
		},

		/**
		 * Run through all past training samples, and use them for training once more.
		 * @return true if ALL samples got their correct classification (i.e. no change made).
		 */
		retrain: function() {
			var length = data.length
			var success = true
			for(var i=0; i<length; i++) {
				var sample = data.shift();
				success = api.train_features(sample.features, sample.classification) && success
			}
			return success;
		},

		/**
		 * @param inputs a SINGLE training sample; an associative array (feature => value).
		 * @param expected the classification value for that sample (0 or 1)
		 * @return true if the input sample got its correct classification (i.e. no change made).
		 */
		train_features: function(features, expected) {
			for (feature in features) {
				if (!(feature in weights)) {
					weights[feature] = opts.default_weight;
				}
			}

			var result = api.perceive_features(features, /*net=*/false, weights); // always use the running 'weights' vector for training, and NOT the weights_sum!

			data.push({features: features, classification: expected/*, prev: result*/})

			if (opts.debug) console.log('> training ',features,', expecting: ',expected, ' got: ', result);

			if (result != expected) {
				// Current model is incorrect - adjustment needed!
				if (opts.debug) console.log('> adjusting weights...', weights, features);
				for (var feature in features) 
					api.adjust(result, expected, features[feature], feature);
				if (opts.debug) console.log(' -> weights:', weights)
			}
			if (opts.use_averaging) associative.add(weights_sum, weights);
			
			return (result == expected);
		},

		/**
		 * @param inputs a SINGLE training sample; converted to a feature array with feature_extractor (if available).
		 * @param expected the classification value for that sample (0 or 1)
		 * @return true if the input sample got its correct classification (i.e. no change made).
		 */
		train: function(inputs, expected) {
			return api.train_features(api.normalized_features(inputs), expected);
		},


		adjust: function(result, expected, input, feature) {
			var delta = api.delta(result, expected, input, opts.learningrate);
			if (isNaN(delta)) throw new Error('delta is NaN!! result='+result+" expected="+expected+" input="+input+" feature="+feature);
			weights[feature] += delta;
			if (isNaN(weights[feature])) throw new Error('weights['+feature+'] went to NaN!! delta='+d);
		},

		delta: function(actual, expected, input, learnrate) {
			return (expected - actual) * learnrate * input;
		},
		

		/**
		 * @param inputs a SINGLE sample; an associative array (feature => value).
		 * @param weights_for_classification the weights vector to use (either the running 'weights' or 'weights_sum').  
		 * @param net if true, return the net classification value. If false [default], return 0 or 1.
		 * @return the classification of the sample.
		 */
		perceive_features: function(features, net, weights_for_classification) {
			var result = associative.inner_product(features, weights_for_classification);
			if (opts.debug) console.log("> perceive_features ",features," = ",result);
			return net
				? result
				: result > 0 ? 1 : 0
		},

		/**
		 * @param inputs a SINGLE sample; converted to a feature array with feature_extractor (if available).
		 * @param net if true, return the net classification value. If false [default], return 0 or 1.
		 * @return the classification of the sample.
		 */
		perceive: function(inputs, net) {
			return api.perceive_features(api.normalized_features(inputs), net,
				(opts.use_averaging? weights_sum: weights) );
		},
		
		test_start: function() {
			test_stats = {
				count: 0,
				TP: 0,
				TN: 0,
				FP: 0,
				FN: 0
			};
		},

		test_features: function(features,expected) {
			var actual = api.perceive_features(features, /*net=*/false, 
				(opts.use_averaging? weights_sum: weights) );
			test_stats.count++;
			if (expected && actual) test_stats.TP++;
			if (!expected && actual) test_stats.FP++;
			if (expected && !actual) test_stats.FN++;
			if (!expected && !actual) test_stats.TN++;
		},

		/**
		 * Run through all the given samples, and use them for testing.
		 * @return statistics about the test.
		 */
		test: function(inputs, expected) {
			api.test_features(api.normalized_features(inputs), expected);
		},
		
		test_results: function() {
			test_stats.Accuracy = (test_stats.TP+test_stats.TN)/(test_stats.count);
			test_stats.Precision = test_stats.TP/(test_stats.TP+test_stats.FP);
			test_stats.Recall = test_stats.TP/(test_stats.TP+test_stats.FN);
			test_stats.F1 = 2/(1/test_stats.Recall+1/test_stats.Precision);
			return test_stats;
		},


		/**
		 * Run through all past training samples, and use them for testing.
		 * @return statistics about the test.
		 */
		test_on_train: function() {
			api.test_start();
			for (var i=0; i<data.length; ++i) {
				var sample = data[i];
				api.test_features(sample.features, sample.classification)
			}
			return api.test_results();
		},
	}

	return api;
}


module.exports = PerceptronAssociative
