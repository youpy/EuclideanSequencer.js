// http://blog.fader.co.uk/post/11519018856/bjorklund-algorithm-and-euclidean-rhythms

'use strict';

var Calculator = function() {
};

function bjorklund(steps, pulses) {
	steps = Math.round(steps);
	pulses = Math.round(pulses);	

	if(pulses > steps || pulses == 0 || steps == 0) {
		return new Array();
	}

	var pattern = [],
	    counts = [],
	    remainders = [],
	    divisor = steps - pulses;
	var level = 0;

	remainders.push(pulses);

	while(true) {
		counts.push(Math.floor(divisor / remainders[level]));
		remainders.push(divisor % remainders[level]);
		divisor = remainders[level];
	  level += 1;
		if (remainders[level] <= 1) {
			break;
		}
	}
	
	counts.push(divisor);

	var r = 0;
	var build = function(level) {
		r++;
		if (level > -1) {
			for (var i=0; i < counts[level]; i++) {
				build(level-1);
			}	
			if (remainders[level] != 0) {
	      build(level-2);
			}
		} else if (level == -1) {
	    pattern.push(0);	
		} else if (level == -2) {
      pattern.push(1);
		}
	};

	build(level);

	return pattern.reverse();
}

Calculator.prototype.calculate = function(item, numSlots) {
  return bjorklund(numSlots, item.numPulses);
};

module.exports = Calculator;
