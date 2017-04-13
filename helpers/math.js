function random(min = 1, max = 15) {
	return Math.floor(Math.random() * max) + min;
}

exports.random = random;
