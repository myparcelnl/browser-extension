/**
 * Filter object by key prefix.
 */
export const filterKeys = <T1 extends Record<string, unknown>, T2 extends Record<string, unknown>>(
  object: T1,
  prefix: string,
): T2 => {
  const result = {};
  const filtered = Object.keys(object).filter((key) => key.startsWith(prefix));

  filtered.forEach((obj) => {
    const replacedObj = obj.replace(prefix, '');
    result[replacedObj] = object[obj];
  });

  return result as T2;
};
