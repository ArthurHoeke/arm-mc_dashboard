import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

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
          <div class="flex flex-col">
            <svg style="height: 15px" viewBox="0 0 668 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M53.5 1.12579C64.6667 0.459125 87 6.12579 87 34.1258V95.1258H61V88.1258C57.8332 90.7925 49.2998 96.1258 40.5 96.1258C29.5 96.1258 0.000256261 98.6254 0 67.1258C0 41.9258 25 36.6258 37.5 37.1258H44.5C48.6667 37.1258 57.8 37.4258 61 38.6258V24.1258H14V1.12579H53.5ZM60 56.1258C36 49.695 28.3333 59.7796 27.5 65.6258C27.1669 69.1259 29.3004 76.1258 40.5 76.1258C51.6997 76.1258 58.1665 65.1259 60 59.6258V56.1258Z" fill="#43CC6D"></path>
                            <path d="M108 95.1254H134V24.1254H167V1.1254H139.5C115.9 1.1254 108.667 19.7921 108 29.1254V95.1254Z" fill="#43CC6D"></path>
                            <path d="M183 1.12539V95.1254H209V39.1254C209 27.9254 219.667 25.4587 225 25.6254C235.8 25.6254 240.5 35.2921 241.5 40.1254V95.1254H267.5V41.1254C267.5 37.1254 270.5 25.6254 284.5 25.6254C295.7 25.6254 299.5 35.9587 300 41.1254V95.1254H326.5V39.1254C326.5 9.12539 303 0.125393 287.5 0.125393C275.1 0.125393 262.667 8.79206 258 13.1254C246.8 1.12539 233.667 -0.541274 228.5 0.125393C218.1 0.125393 211.167 3.45873 209 5.12539V1.12539H183Z" fill="#43CC6D"></path>
                            <path d="M423 1.12539V95.1254H449V39.1254C449 27.9254 459.667 25.4587 465 25.6254C475.8 25.6254 480.5 35.2921 481.5 40.1254V95.1254H507.5V41.1254C507.5 37.1254 510.5 25.6254 524.5 25.6254C535.7 25.6254 539.5 35.9587 540 41.1254V95.1254H566.5V39.1254C566.5 9.12539 543 0.125393 527.5 0.125393C515.1 0.125393 502.667 8.79206 498 13.1254C486.8 1.12539 473.667 -0.541274 468.5 0.125393C458.1 0.125393 451.167 3.45873 449 5.12539V1.12539H423Z" fill="#43CC6D"></path>
                            <path d="M405 22.1254H345V44.1254H405V22.1254Z" fill="#43CC6D"></path>
                            <path d="M617.5 65.6254C627.5 75.6254 642 69.7921 648 65.6254L668 82.1254C654.8 95.3254 638.833 97.9587 632.5 97.6254C594.1 97.6254 583.833 64.9587 584 48.6254C584 9.42539 616.667 0.62539 632.5 1.12539C652.5 1.12539 664.5 11.4587 668 16.6254L648 33.1254C643.2 28.3254 635.667 27.1254 632.5 27.1254C617.3 27.1254 611.167 41.1254 610 48.1254C610 56.5254 615 63.2921 617.5 65.6254Z" fill="#43CC6D"></path>
            </svg>
            <p class="text-muted text-xs font-medium">{{ adminService.isAdmin() ? 'Admin Panel' : 'User Portal' }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-col gap-2 flex-1">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary/10 text-primary border border-primary/20"
              [routerLinkActiveOptions]="{ exact: item.route === '/index' }"
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
        <!-- <div class="mt-auto pt-6 border-t border-border-dark">
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
        </div> -->
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
  adminService = inject(AdminService);

  private adminNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/index' },
    { icon: 'router', label: 'Tunnel Management', route: '/tunnels', filled: true },
    { icon: 'campaign', label: 'Announcements', route: '/announcements' },
    // { icon: 'group', label: 'User Manager', route: '/users' },
    // { icon: 'description', label: 'System Logs', route: '/logs' },
    // { icon: 'settings', label: 'Node Settings', route: '/settings' },
  ];

  private userNavItems: NavItem[] = [
    { icon: 'person', label: 'Profile', route: '/profile' },
  ];

  navItems = computed(() => {
    return this.adminService.isAdmin() ? this.adminNavItems : this.userNavItems;
  });

  getIconStyle(filled?: boolean): string | null {
    return filled ? "'FILL' 1" : null;
  }
}
