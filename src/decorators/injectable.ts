import {Provider} from "./provider";
/**
 * @since 1.0.0
 * @decorator
 * @function
 * @name Injectable
 *
 * @description
 * Injectable decorator is used to define injectable class in order that Injector can recognise it
 *
 * @example
 * import {Injectable} from "node-ee";
 *
 * \@Injectable()
 * class AssetLoader{
 *    constructor() {
 *
 *    }
 * }
 */
export var Injectable = () => Provider([]);
