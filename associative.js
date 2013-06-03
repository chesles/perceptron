/**
 * Utilities for associative arrays (= hashes = Javascript objects).
 * @author Erel Segal-Halevi
 */
 
var api = {};

/**
 * add one associative array to another.
 * @param target [input and output]
 * @param source [input]: will be added to target.
 */
api.add  = function(target, source) {
	for (var feature in source) {
		if (!(feature in target))
			target[feature]=0;
		target[feature] += source[feature];
	}
}

/**
 * multiply one associative array by another.
 * @param target [input and output]
 * @param source [input]: will be multiplied to target.
 */
api.multiply  = function(target, source) {
	for (var feature in source) {
		if (!(feature in target))
			target[feature]=1;
		target[feature] *= source[feature];
	}
}

/**
 * calculate the scalar product of the given two arrays.
 * @param features [input]
 * @param weights [input]
 * @note Usually, there are much less features than weights.
 */
api.inner_product = function(features, weights) {
	var result = 0;
	for (var feature in features) {
			if (feature in weights) {
					result += features[feature] * weights[feature]
			} else {
					/* the sample contains a feature that was never seen in training - ignore it for now */ 
			}
	}
	return result;
}


/**
 * @param array [input]
 * @return a string of the given associative array, sorted by keys.
 */
api.stringify_sorted = function(weights, separator) {
	var result = "{" + separator;
	var keys = Object.keys(weights);
	keys.sort();
	var last = keys.length-1;
	for (i = 0; i <= last; i++) {
		var key = keys[i];
		var weight = weights[key]; 
		result += '"'+key+'": '+weight;
		if (i<last) result+=",";
		result += separator;
	}
	result += "}";
	return result;	
}

module.exports = api;

