import {inspect as utilInspect} from "util";
import {isString} from "../core";
// cleanups on inspect
let colors = new Array(100);
let i = 0;
while (i < 100) {
  colors.push(new RegExp("\\[" + i + "m", "ig"));
  ++i;
}
/**
 * @since 1.0.0
 * @function
 * @name clean
 * @param {String} message
 * @description
 * Clean inspect message
 * @return {String} message
 */
export function clean(message: string): string {
  if (isString(message)) {
    colors.forEach(value => message = message.replace(value, ""));
    message = message.replace(/\\'/g, "\'");
    message = message.replace(/\\n/g, "\n");
    return message.replace(/\\u001b/g, "\u001b");
  }
  return message;
}

/**
 * @since 1.0.0
 * @function
 * @name inspect
 * @param {Object} data
 * @param {Number} level
 * @description
 * Inspect log data output
 */
export function inspect(data, level) {
  return utilInspect(data, {colors: true, depth: level});
}
