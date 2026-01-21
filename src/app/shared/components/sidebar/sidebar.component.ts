import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  filled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="w-72 border-r border-border-dark bg-background-dark flex flex-col h-screen sticky top-0 shrink-0"
    >
      <div class="p-6 flex flex-col h-full">
        <!-- Logo Section -->
        <div class="flex items-center gap-3 mb-10">
          <div class="bg-primary/20 p-2 rounded-lg">
            <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
          </div>
          <div class="flex flex-col">
            <h1 class="text-white text-lg font-bold leading-none">Arm-MC Admin</h1>
            <p class="text-muted text-xs font-medium">Android Node #01</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-col gap-2 flex-1">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary/10 text-primary border border-primary/20"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:bg-surface-dark hover:text-white transition-colors border border-transparent"
            >
              <span
                class="material-symbols-outlined"
                [style.font-variation-settings]="getIconStyle(item.filled)"
              >
                {{ item.icon }}
              </span>
              <span class="text-sm font-medium">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Device Health -->
        <div class="mt-auto pt-6 border-t border-border-dark">
          <div class="bg-surface-dark rounded-xl p-4 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted">Device Health</span>
              <span class="text-xs text-primary font-bold">Stable</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-orange-400 text-sm">thermostat</span>
              <p class="text-white text-sm font-medium">38.4°C</p>
            </div>
            <div class="w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
              <div class="bg-primary h-full w-[45%]"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class SidebarComponent {
  navItems = signal<NavItem[]>([
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'router', label: 'Tunnel Management', route: '/tunnels', filled: true },
    { icon: 'campaign', label: 'Announcements', route: '/announcements' },
    { icon: 'group', label: 'User Manager', route: '/users' },
    { icon: 'description', label: 'System Logs', route: '/logs' },
    { icon: 'settings', label: 'Node Settings', route: '/settings' },
  ]);

  getIconStyle(filled?: boolean): string | null {
    return filled ? "'FILL' 1" : null;
  }
}
