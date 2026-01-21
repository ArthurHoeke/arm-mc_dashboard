import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private adminData = signal<AdminUser | null>(null);
  private unsubscribe: Unsubscribe | null = null;
  
  isAdmin = computed(() => this.adminData()?.isAdmin === true);
  isSuperAdmin = computed(() => this.adminData()?.isSuperAdmin === true);
  isLoading = signal<boolean>(true);
  
  constructor() {
    // Watch for auth state changes
    this.setupAdminListener();
  }
  
  private setupAdminListener(): void {
    // Use effect-like pattern to react to currentUser changes
    const checkAdmin = async () => {
      const user = this.authService.currentUser();
      
      // Cleanup previous listener
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      
      if (!user) {
        this.adminData.set(null);
        this.isLoading.set(false);
        return;
      }
      
      // Listen to admin document in real-time
      const adminDocRef = doc(this.firestore, 'admins', user.uid);
      this.unsubscribe = onSnapshot(adminDocRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.adminData.set({
              uid: user.uid,
              email: user.email || '',
              isAdmin: data['isAdmin'] === true,
              isSuperAdmin: data['isSuperAdmin'] === true,
              createdAt: data['createdAt']?.toDate(),
            });
          } else {
            this.adminData.set({
              uid: user.uid,
              email: user.email || '',
              isAdmin: false,
              isSuperAdmin: false,
            });
          }
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error fetching admin status:', error);
          this.adminData.set(null);
          this.isLoading.set(false);
        }
      );
    };
    
    // Initial check and re-check on auth changes
    // We'll poll the currentUser signal periodically since we can't use effect outside components
    checkAdmin();
    
    // Set up interval to check for auth changes (simple approach)
    setInterval(() => {
      const user = this.authService.currentUser();
      const currentAdmin = this.adminData();
      if (user?.uid !== currentAdmin?.uid) {
        checkAdmin();
      }
    }, 1000);
  }
  
  /**
   * One-time check if the current user is an admin.
   * Useful for guards.
   */
  async checkIsAdmin(): Promise<boolean> {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    try {
      const adminDocRef = doc(this.firestore, 'admins', user.uid);
      const docSnap = await getDoc(adminDocRef);
      return docSnap.exists() && docSnap.data()['isAdmin'] === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
  
  /**
   * Wait for admin status to be resolved (for use in guards)
   */
  async waitForAdminStatus(): Promise<boolean> {
    // Wait for auth to be ready first
    await this.authService.waitForAuthState();
    
    // Wait for admin loading to complete
    return new Promise((resolve) => {
      const checkLoading = () => {
        if (!this.isLoading()) {
          resolve(this.isAdmin());
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    });
  }
}
