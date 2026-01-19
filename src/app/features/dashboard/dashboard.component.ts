import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumbs & Heading -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 text-sm font-medium">
        <span class="text-muted">Admin</span>
        <span class="material-symbols-outlined text-xs text-muted">chevron_right</span>
        <span class="text-white">Dashboard</span>
      </div>
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-white text-4xl font-bold tracking-tight">Dashboard</h2>
          <p class="text-muted text-base">
            Overview of your Arm-MC hosting infrastructure.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary text-3xl">dns</span>
          <span class="text-primary text-xs font-bold uppercase px-2 py-1 bg-primary/10 rounded border border-primary/20">Online</span>
        </div>
        <div>
          <p class="text-white text-3xl font-bold">4</p>
          <p class="text-muted text-sm">Active Servers</p>
        </div>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary text-3xl">group</span>
        </div>
        <div>
          <p class="text-white text-3xl font-bold">127</p>
          <p class="text-muted text-sm">Total Players Online</p>
        </div>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary text-3xl">timer</span>
        </div>
        <div>
          <p class="text-white text-3xl font-bold">99.9%</p>
          <p class="text-muted text-sm">Uptime (30 days)</p>
        </div>
      </div>
    </div>

    <!-- Welcome Card -->
    <div class="bg-surface-dark border border-border-dark rounded-xl p-8">
      <div class="flex items-start gap-6">
        <div class="bg-primary/20 p-4 rounded-xl">
          <span class="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
        </div>
        <div class="flex-1">
          <h3 class="text-white text-2xl font-bold mb-2">Welcome to Arm-MC Admin</h3>
          <p class="text-muted text-base mb-4">
            This is your central control panel for managing Minecraft server infrastructure. 
            Navigate using the sidebar to access tunnel management, user administration, 
            system logs, and node settings.
          </p>
          <div class="flex gap-3">
            <a routerLink="/tunnels" class="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <span class="material-symbols-outlined text-lg">router</span>
              Manage Tunnels
            </a>
            <a href="#" class="flex items-center gap-2 bg-transparent border border-border-dark text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-dark transition-colors">
              <span class="material-symbols-outlined text-lg">menu_book</span>
              View Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class DashboardComponent {}
