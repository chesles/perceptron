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



module.exports = api;

