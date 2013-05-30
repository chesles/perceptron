/**
 * A perceptron for recognizing textual entailment, based on BIUTEE's proofs 
 */

var perceptron = require('../perceptron_associative')
  , fs = require('fs');

var opts = {
		feature_extractor: function(pair, features) {
			if (pair.task)
				features[pair.task]=1; 
			//console.dir(pair.proof);
			for (var iStep=0; iStep<pair.proof.length; ++iStep) {
				var step = pair.proof[iStep];
				for (var feature in step) {
					if (!(feature in features))
						features[feature]=0;
					features[feature] += step[feature];
				}
			}
			//console.dir(features);
		},
		learningrate: 0.1,
		debug: 0
};
var rte = perceptron(opts);

var devpairs = JSON.parse(fs.readFileSync('rte3devproofs.json', 'utf8'));
var testpairs = JSON.parse(fs.readFileSync('rte3testproofs.json', 'utf8'));

for (var iPair=0; iPair<devpairs.length; ++iPair) {
	var pair = devpairs[iPair];
	var classification = (pair.decision==='YES'? 1: 0);
	rte.train(pair, classification);
}
rte.save("rte3model");

rte.test_start();
for (var iPair=0; iPair<testpairs.length; ++iPair) {
	var pair = testpairs[iPair];
	var classification = (pair.decision==='YES'? 1: 0);
	rte.test(pair, classification);
}
console.dir(rte.test_results());

console.log("after train #"+i+": ");
console.dir(rte.test_on_train());
for (var i=1; i<=20; ++i) {
	rte.retrain();
	console.log("after retrain #"+i+": ");
	console.dir(rte.test_on_train());
}


