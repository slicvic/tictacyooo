/**
 * A math utility.
 */
class MathHelper {
	/**
	 * Generate a random number between min and max.
	 * @param  {Number} [min=1]
	 * @param  {Number} [max=15]
	 * @return {Number}
	 */
	random(min = 1, max = 15) {
		return Math.floor(Math.random() * max) + min;
	}
}

module.exports = new MathHelper();
