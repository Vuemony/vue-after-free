'use strict';

var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

var GetIteratorDirect = require('es-abstract/2025/GetIteratorDirect');
var IteratorClose = require('es-abstract/2025/IteratorClose');
var IteratorStepValue = require('es-abstract/2025/IteratorStepValue');
var NormalCompletion = require('es-abstract/2025/NormalCompletion');
var SameValueZero = require('es-abstract/2025/SameValueZero');
var ThrowCompletion = require('es-abstract/2025/ThrowCompletion');

var isInteger = require('math-intrinsics/isInteger');

var isFinite = require('es-abstract/helpers/isFinite');
var isObject = require('es-abstract/helpers/isObject');

module.exports = function includes(searchElement) {
	if (this instanceof includes) {
		throw new $TypeError('`includes` is not a constructor');
	}

	var O = this; // step 1;

	if (!isObject(O)) {
		throw new $TypeError('`this` value must be an Object'); // step 2
	}

	var iterated = { // step 3
		'[[Iterator]]': O,
		'[[NextMethod]]': undefined,
		'[[Done]]': false
	};

	var skippedElements = arguments.length > 1 ? arguments[1] : undefined; // step 4

	var toSkip = 0;
	if (typeof skippedElements !== 'undefined') { // step 5
		if (
			typeof skippedElements !== 'number'
			|| !isFinite(skippedElements)
			|| !isInteger(skippedElements)
		) { // step 4.a
			var error = ThrowCompletion(new $TypeError('`skippedElements` must be a finite integral Number')); // step 4.a.1
			return IteratorClose(iterated, error); // step 4.a.2
		}

		toSkip = skippedElements; // step 5.b
	}

	if (toSkip < 0) { // step 6
		var error2 = ThrowCompletion(new $RangeError('`skippedElements` must be >= 0')); // step 6.a
		return IteratorClose(iterated, error2); // step 6.b
	}

	var skipped = 0; // step 7

	iterated = GetIteratorDirect(O); // step 8

	while (true) { // step 9
		var value = IteratorStepValue(iterated); // step 9.a

		if (iterated['[[Done]]']) {
			return false; // step 9.b
		}
		if (skipped < toSkip) { // step 4
			skipped += 1; // step 4.a
		} else {
			// eslint-disable-next-line no-lonely-if
			if (SameValueZero(value, searchElement)) { // step 9.d
				return IteratorClose(
					iterated,
					NormalCompletion(true)
				); // step 9.d.i
			}
		}
	}
};
