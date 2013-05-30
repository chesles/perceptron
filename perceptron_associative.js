
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
 *	<li>threshold: defaults to 1.
 *	<li>bias: initial weight of threshold. defaults to 1. 
 *	<li>learningrate: defaults to 0.1.
 *	<li>feature_extractor: function that converts input samples to feature arrays. If not given, the input sample itself is treated as an associative array of features.
 * 
 */
function PerceptronAssociative(opts) {
	if (this === global) return new PerceptronAssociative(opts);
	if (!opts) opts = {}

	var debug = 'debug' in opts 
		? opts.debug 
		: false;
	var weights = 'weights' in opts
		? opts.weights			 /* should be an associative array */
		: {}
	var default_weight = 'default_weight' in opts
		? opts.default_weight
		: 0;
	var threshold = 'threshold' in opts
		? opts.threshold
		: 1
	var bias = 'bias' in opts	
		? opts.bias 
		: 1
	var learningrate = 'learningrate' in opts
		? opts.learningrate
		: 0.1
	var feature_extractor = 'feature_extractor' in opts
		? opts.feature_extractor
		: 0;

	var fs = require('fs'), mkpath = require('mkpath');

	/**
	 * Keep track of ALL training samples, their perceived values and their correct (target) values. 
	 */
	var data = []

	var api = {
		weights: weights,

		save: function(folder) {
			mkpath.sync(folder);
			fs.writeFileSync(folder+"/opts.json", JSON.stringify({
					weights: weights,
					default_weight: default_weight,
					threshold: threshold, 
					learningrate: learningrate, 
					debug: debug, 
					feature_extractor: feature_extractor
				},null,"\t")
			);
			fs.writeFileSync(folder+"/data.json", JSON.stringify(data,null,"\t"));
		},

		load: function(folder) {
			data = JSON.parse(fs.readFileSync(folder+"/data.json"));
			opts = JSON.parse(fs.readFileSync(folder+"/opts.json"));
			api.weights = weights = opts.weights;
			default_weight = opts.default_weight;
			threshold = opts.threshold;
			learningrate = opts.learningrate;
			debug = opts.debug;
			feature_extractor = opts.feature_extractor;
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
		train_features: function(inputs, expected) {
			//if (debug) console.log('train_features: ', inputs, ' weights: ',weights);
			for (feature in inputs) {
				if (!(feature in weights)) {
					weights[feature] = default_weight;
				}
			}

			if (!('threshold' in weights)) {
				weights['threshold'] = bias;
			}

			var result = api.perceive_features(inputs)
			data.push({features: inputs, classification: expected/*, prev: result*/})

			if (debug) console.log('> training ',inputs,', expecting: ',expected, ' got: ', result)

			if (result == expected) {
				return true;	// Current model is correct - no adjustment needed!
			}
			else {
				if (debug) console.log('> adjusting weights...', weights, inputs);
				for (var feature in inputs) 
					api.adjust(result, expected, inputs[feature], feature);
				api.adjust(result, expected, threshold, 'threshold');
				if (debug) console.log(' -> weights:', weights)
				return false
			}
		},

		/**
		 * @param inputs a SINGLE training sample; converted to a feature array with feature_extractor (if available).
		 * @param expected the classification value for that sample (0 or 1)
		 * @return true if the input sample got its correct classification (i.e. no change made).
		 */
		train: function(inputs, expected) {
			if (feature_extractor)	{
				var features = {};
				feature_extractor(inputs, features);
			} else {
				var features = inputs;
			} 
			return api.train_features(features, expected);
		},


		adjust: function(result, expected, input, feature) {
			var delta = api.delta(result, expected, input, learningrate);
			if (isNaN(delta)) throw new Error('delta is NaN!! result='+result+" expected="+expected+" input="+input+" feature="+feature);
			weights[feature] += delta;
			if (isNaN(weights[feature])) throw new Error('weights['+feature+'] went to NaN!! delta='+d);
		},

		delta: function(actual, expected, input, learnrate) {
			return (expected - actual) * learnrate * input;
		},
		

		/**
		 * @param inputs a SINGLE sample; an associative array (feature => value).
		 * @param net if true, return the net classification value. If false [default], return 0 or 1.
		 * @return the classification of the sample.
		 */
		perceive_features: function(inputs, net) {
			var result = 0
			for (var feature in inputs) {
				if (feature in weights) {
					result += inputs[feature] * weights[feature]
				} else {
					/* the sample contains a feature that was never seen in training - ignore it for now */ 
				}
			}
			result += threshold * weights['threshold']
			if (debug) console.log("> perceive_features ",inputs," = ",result);
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
			if (feature_extractor)	{
				var features = {};
				feature_extractor(inputs, features);
			} else {
				var features = inputs;
			}
			return api.perceive_features(features, net);
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
		
		test_results: function() {
			test_stats.Accuracy = (test_stats.TP+test_stats.TN)/(test_stats.count);
			test_stats.Precision = test_stats.TP/(test_stats.TP+test_stats.FP);
			test_stats.Recall = test_stats.TP/(test_stats.TP+test_stats.FN);
			test_stats.F1 = 2/(1/test_stats.Recall+1/test_stats.Precision);
			return test_stats;
		},

		test_features: function(features,expected) {
			var actual = api.perceive_features(features);
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
			if (feature_extractor)	{
				var features = {};
				feature_extractor(inputs, features);
			} else {
				var features = inputs;
			}
			api.test_features(features, expected);
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
