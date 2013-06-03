/**
 * A perceptron for recognizing textual entailment, based on BIUTEE's proofs. 
 */

var perceptron = require('../perceptron_associative')
  , associative = require('../associative')
  , fs = require('fs');

var opts = {
		feature_extractor: function(pair, features) {
			if (pair.task)
				features[pair.task]=1; 
			if (pair.hypothesis_length)
				features.InverseHypothesisLength = 1 / pair.hypothesis_length;
			for (var iStep=0; iStep<pair.proof.length; ++iStep) {
				var step = pair.proof[iStep];
				associative.add(features, step);
			}
		},
		learningrate: 0.1,
		use_averaging: true,
		debug: 0
};
var rte = perceptron(opts);

var devpairs = JSON.parse(fs.readFileSync('rte3devproofs.json', 'utf8'));
var testpairs = JSON.parse(fs.readFileSync('rte3testproofs.json', 'utf8'));

for (var iPair=0; iPair<devpairs.length; ++iPair)
	rte.train(devpairs[iPair], devpairs[iPair].decision);

// test save and load:
rte.save("rte3model");
var rte2 = perceptron(opts);
rte2.load("rte3model");
rte = rte2;

console.log("\n\nafter first train: ");
console.log("test on train data: ");
console.dir(rte.test_on_train());

console.log("test on test data: ");
rte.test_start();
for (var iPair=0; iPair<testpairs.length; ++iPair)
	rte.test(testpairs[iPair], testpairs[iPair].decision);
console.dir(rte.test_results());
for (var i=1; i<=10; ++i) {
	rte.retrain();
	if (i==1 || i==10 || i==20) {
		console.log("\n\nafter retrain "+i+":");
		console.log("test on train data: ");
		console.dir(rte.test_on_train());
		console.log("test on test data: ");
		rte.test_start();
		for (var iPair=0; iPair<testpairs.length; ++iPair) 
			rte.test(testpairs[iPair], testpairs[iPair].decision);
		console.dir(rte.test_results());
	}
}


