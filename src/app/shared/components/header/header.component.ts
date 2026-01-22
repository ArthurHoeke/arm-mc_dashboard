import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header
      class="h-16 border-b border-border-dark flex items-center justify-between px-8 bg-background-dark/50 backdrop-blur-md sticky top-0 z-10"
    >
      <!-- Left: Breadcrumbs -->
      <div class="flex items-center gap-2 text-sm font-medium">
        <a routerLink="/" class="text-muted hover:text-white transition-colors">Home</a>
        @if (breadcrumbLabel()) {
          <span class="material-symbols-outlined text-xs text-muted">chevron_right</span>
          <span class="text-white">{{ breadcrumbLabel() }}</span>
        }
      </div>

      <!-- Right: Search & User -->
      <div class="flex items-center gap-6">
        <!-- Search -->
        <!-- <div class="relative group">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xl"
            >search</span
          >
          <input
            class="bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted focus:ring-1 focus:ring-primary w-64 transition-all"
            placeholder="Search tunnels..."
            type="text"
          />
        </div> -->

        <div class="h-8 w-px bg-border-dark"></div>

        <!-- User Info -->
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-white text-sm font-medium leading-none">
              {{ displayName() }}
            </span>
            @if (adminService.isAdmin()) {
              <span class="text-primary text-[10px] font-bold uppercase tracking-wider">
                {{ userRole() }}
              </span>
            }
          </div>
          <button
            (click)="onSignOut()"
            class="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 cursor-pointer hover:border-primary transition-colors"
            title="Sign Out"
          >
            @if (photoURL()) {
              <div
                class="w-full h-full rounded-full bg-cover bg-center"
                [style.background-image]="'url(' + photoURL() + ')'"
              ></div>
            } @else {
              <div
                class="w-full h-full rounded-full bg-primary/20 flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-primary text-lg">person</span>
              </div>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  adminService = inject(AdminService);
  
  userRole = input<string>('Admin');
  breadcrumbLabel = input<string>('');

  displayName = computed(() => {
    const user = this.authService.currentUser();
    return user?.displayName || user?.email || 'User';
  });

  photoURL = computed(() => {
    const user = this.authService.currentUser();
    return user?.photoURL || null;
  });

  async onSignOut(): Promise<void> {
    await this.authService.signOut();
  }
}
