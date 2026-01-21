import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumbs & Heading -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 text-sm font-medium">
        <span class="text-muted">Account</span>
        <span class="material-symbols-outlined text-xs text-muted">chevron_right</span>
        <span class="text-white">Profile</span>
      </div>
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-white text-4xl font-bold tracking-tight">Profile</h2>
          <p class="text-muted text-base">
            View your account information.
          </p>
        </div>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="bg-surface-dark border border-border-dark rounded-xl p-8">
      <div class="flex items-start gap-6">
        <!-- Avatar -->
        <div class="shrink-0">
          @if (user()?.photoURL) {
            <img 
              [src]="user()?.photoURL" 
              alt="Profile picture" 
              class="w-24 h-24 rounded-full border-2 border-primary/30"
            />
          } @else {
            <div class="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
              <span class="material-symbols-outlined text-primary text-4xl">person</span>
            </div>
          }
        </div>
        
        <!-- User Info -->
        <div class="flex-1">
          <h3 class="text-white text-2xl font-bold mb-1">
            {{ user()?.displayName || 'User' }}
          </h3>
          <p class="text-muted text-base mb-4">{{ user()?.email }}</p>
          
          <div class="flex gap-2">
            @if (adminService.isAdmin()) {
              <span class="text-primary text-xs font-bold uppercase px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                Admin
              </span>
            }
            @if (adminService.isSuperAdmin()) {
              <span class="text-gold text-xs font-bold uppercase px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                Super Admin
              </span>
            }
            @if (!adminService.isAdmin()) {
              <span class="text-muted text-xs font-bold uppercase px-3 py-1 bg-surface-dark rounded-full border border-border-dark">
                User
              </span>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Account Details -->
    <div class="bg-surface-dark border border-border-dark rounded-xl p-6">
      <h3 class="text-white text-lg font-bold mb-4">Account Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Email</p>
          <p class="text-white text-base font-medium">{{ user()?.email || '-' }}</p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">User ID</p>
          <p class="text-white text-base font-medium font-mono text-sm">{{ user()?.uid || '-' }}</p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Email Verified</p>
          <p class="text-base font-medium" [class]="user()?.emailVerified ? 'text-primary' : 'text-orange-400'">
            {{ user()?.emailVerified ? 'Yes' : 'No' }}
          </p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Account Created</p>
          <p class="text-white text-base font-medium">{{ creationDate() }}</p>
        </div>
      </div>
    </div>

    <!-- Sign Out -->
    <div class="bg-surface-dark border border-border-dark rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-white text-lg font-bold mb-1">Sign Out</h3>
          <p class="text-muted text-sm">Sign out of your account on this device.</p>
        </div>
        <button
          (click)="signOut()"
          class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-500/20 transition-all"
        >
          <span class="material-symbols-outlined text-lg">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .text-gold {
        color: #FFD700;
      }
      .bg-gold\\/10 {
        background-color: rgba(255, 215, 0, 0.1);
      }
      .border-gold\\/20 {
        border-color: rgba(255, 215, 0, 0.2);
      }
    `,
  ],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  adminService = inject(AdminService);

  user = this.authService.currentUser;

  creationDate = computed(() => {
    const metadata = this.user()?.metadata;
    if (metadata?.creationTime) {
      return new Date(metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return '-';
  });

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
