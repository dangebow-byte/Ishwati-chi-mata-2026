/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Universal Marathi Devanagari spelling sanitizer for Shree Ishwatichi Mata Devasthan.
 * Ensures strict, consistent Marathi orthography (using short vowel 'इ' without rafar: 'इश्वटी' / 'इश्व')
 * across all dynamic Firestore documents, CMS state, inputs, and cached data.
 */
export function cleanDevanagariSpelling<T>(val: T): T {
  if (typeof val === 'string') {
    return val
      .replace(/ईश्वटी/g, 'इश्वटी')
      .replace(/ईश्व/g, 'इश्व') as unknown as T;
  }
  if (Array.isArray(val)) {
    return val.map(cleanDevanagariSpelling) as unknown as T;
  }
  if (val !== null && typeof val === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = cleanDevanagariSpelling(v);
    }
    return res;
  }
  return val;
}
