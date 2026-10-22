/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Centralized list of authorized administrator email addresses for
 * Shree Young Ishwati Navratrotsav Mandal official digital portal.
 * 
 * Configured authorized administrators:
 * 1. dangebow@gmail.com
 * 2. ishwatichimata10@gmail.com
 */
export const ADMIN_EMAILS: readonly string[] = [
  'dangebow@gmail.com',
  'ishwatichimata10@gmail.com'
] as const;

/**
 * Checks whether the given email has administrator privileges.
 */
export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
};

/**
 * Returns a human-readable string listing authorized admin accounts.
 */
export const getAdminEmailsDisplay = (): string => {
  return ADMIN_EMAILS.join(' or ');
};
