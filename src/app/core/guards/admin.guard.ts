import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AdminService } from '../services/admin.service';

/**
 * Guard that checks if the current user is an admin.
 * Redirects to profile if not an admin.
 */
export const adminGuard: CanActivateFn = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  const isAdmin = await adminService.waitForAdminStatus();

  if (isAdmin) {
    return true;
  }

  // Redirect non-admins to profile
  router.navigate(['/profile']);
  return false;
};

/**
 * Guard that redirects non-admins to profile page.
 * Used for routes like dashboard that should redirect non-admins.
 */
export const nonAdminRedirectGuard: CanActivateFn = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  const isAdmin = await adminService.waitForAdminStatus();

  if (isAdmin) {
    return true;
  }

  // Redirect non-admins to profile
  router.navigate(['/profile']);
  return false;
};

/**
 * Guard that checks if the current user is a super admin.
 * Redirects to profile if not a super admin.
 */
export const superAdminGuard: CanActivateFn = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  await adminService.waitForAdminStatus();

  if (adminService.isSuperAdmin()) {
    return true;
  }

  router.navigate(['/profile']);
  return false;
};
