import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for Firebase to restore auth state from storage
  const isAuthenticated = await authService.waitForAuthState();

  if (isAuthenticated) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for Firebase to restore auth state from storage
  const isAuthenticated = await authService.waitForAuthState();

  if (!isAuthenticated) {
    return true;
  }

  router.navigate(['/index']);
  return false;
};
