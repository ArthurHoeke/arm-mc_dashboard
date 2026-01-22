import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private authStateResolved = false;
  private authStatePromise: Promise<boolean>;
  private resolveAuthState!: (value: boolean) => void;

  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.authStatePromise = new Promise((resolve) => {
      this.resolveAuthState = resolve;
    });

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isLoading.set(false);
      if (!this.authStateResolved) {
        this.authStateResolved = true;
        this.resolveAuthState(user !== null);
      }
    });
  }

  /**
   * Returns a promise that resolves when Firebase has restored the auth state.
   * Use this in guards to wait before checking authentication.
   */
  async waitForAuthState(): Promise<boolean> {
    await this.authStatePromise;
    return this.isAuthenticated();
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/index']);
    } catch (error) {
      throw error;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/index']);
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
