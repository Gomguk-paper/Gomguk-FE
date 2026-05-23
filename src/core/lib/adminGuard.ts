import { StoredUser } from "./authStorage";

/**
 * Checks if a given user has administrator privileges.
 */
export const isAdminUser = (user?: StoredUser | null): boolean => {
  return !!user?.is_admin;
};
