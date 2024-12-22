/* 
 * helperLib
 *
 * This module provides functions for commonly needed tasks that
 * the standard javascript library doesn't support
 */

/*
 * toTitleCase()
 *
 * This function will convert a string to title case, for example:
 * Convert from:
 *  thE thing
 * Convert to:
 *  The Thing
 * 
 * NOTE: If the string manipulation becomes to cumbersome, you may
 *  want to consider an npm package instead, like 'lodash'
 * 
 */
function toTitleCase(str: string): string {
    return str.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
}

/*
 * capitalize()
 *
 * This function capitalize the first letter of a word. It can be helpful
 * for names, where you don't want to allow lowercase names, but you don't
 * want to impose capitalizattion for names like McDonald or MacDonald:
 * Convert from:
 *  mcdonald
 * Convert to:
 *  Mconald
 * 
 * NOTE: If the string manipulation becomes to cumbersome, you may
 *  want to consider an npm package instead, like 'lodash'
 * 
 */
function capitalize(name: string): string {
    if (typeof name !== 'string' || name.length === 0) {
        return name; // Return the original input if it's not a valid string
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}
/*
* isValidUrl()
*
* This method is a convenience function to keep it DRY. It does basic 
* validation on a URL to catch any malformed URL problems,
* especially useful when constructing query strings
* 
*/
const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);

        return true;
    } catch (e) {
        return false;
    }
};

export { 
    toTitleCase,
    capitalize,
    isValidUrl,
};