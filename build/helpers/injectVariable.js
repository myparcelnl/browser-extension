/**
 * Converts given object to string, replaces search with replacements and converts it back to an object.
 *
 * @param {Object} object - Object to search in.
 * @param {String} search - Search string.
 * @param {String} replacement - Replacement string.
 *
 * @returns {Object}
 */
function injectVariable(object, search, replacement) {
  const string = JSON.stringify(object);
  const replaced = string.replace(new RegExp(search, 'g'), replacement);

  return JSON.parse(replaced);
}

module.exports = {injectVariable};
