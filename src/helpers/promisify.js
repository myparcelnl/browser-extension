/**
 * @param {(resolve: (value?: unknown) => void) => void} fn
 * @return {Promise<unknown>}
 */
export const promisify = (fn) => new Promise((resolve) => fn(resolve));
