import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, AdminStats } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        <button
          (click)="loadStats()"
          class="flex items-center gap-2 bg-surface-dark border border-border-dark text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-border-dark transition-all"
        >
          <span class="material-symbols-outlined text-lg" [class.animate-spin]="isLoading()">refresh</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    @if (error()) {
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-red-400">error</span>
        <p class="text-red-400 text-sm">{{ error() }}</p>
        <button (click)="loadStats()" class="ml-auto text-red-400 hover:text-white text-sm font-bold">Retry</button>
      </div>
    }

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary text-3xl">hub</span>
          @if (stats()?.tunnels?.active ?? 0 > 0) {
            <span class="text-primary text-xs font-bold uppercase px-2 py-1 bg-primary/10 rounded border border-primary/20">Online</span>
          }
        </div>
        <div>
          @if (isLoading()) {
            <div class="h-9 w-16 bg-border-dark rounded animate-pulse"></div>
          } @else {
            <p class="text-white text-3xl font-bold">{{ stats()?.tunnels?.active ?? 0 }}</p>
          }
          <p class="text-muted text-sm">Active Tunnels</p>
        </div>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary text-3xl">group</span>
        </div>
        <div>
          @if (isLoading()) {
            <div class="h-9 w-16 bg-border-dark rounded animate-pulse"></div>
          } @else {
            <p class="text-white text-3xl font-bold">{{ stats()?.users?.total ?? 0 }}</p>
          }
          <p class="text-muted text-sm">Total Users</p>
        </div>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-gold text-3xl">favorite</span>
        </div>
        <div>
          @if (isLoading()) {
            <div class="h-9 w-16 bg-border-dark rounded animate-pulse"></div>
          } @else {
            <p class="text-white text-3xl font-bold">{{ stats()?.users?.supporters ?? 0 }}</p>
          }
          <p class="text-muted text-sm">Supporters</p>
        </div>
      </div>
    </div>

    <!-- Tunnel Stats -->
    <div class="bg-surface-dark border border-border-dark rounded-xl p-6">
      <h3 class="text-white text-lg font-bold mb-4">Tunnel Overview</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Total</p>
          <p class="text-white text-2xl font-bold">{{ stats()?.tunnels?.total ?? '-' }}</p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Active</p>
          <p class="text-primary text-2xl font-bold">{{ stats()?.tunnels?.active ?? '-' }}</p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Waiting</p>
          <p class="text-orange-400 text-2xl font-bold">{{ stats()?.tunnels?.waiting ?? '-' }}</p>
        </div>
        <div class="bg-background-dark rounded-lg p-4">
          <p class="text-muted text-xs uppercase tracking-wider mb-1">Available</p>
          <p class="text-white text-2xl font-bold">{{ stats()?.tunnels?.available ?? '-' }}</p>
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
            announcements, and system settings.
          </p>
          <div class="flex gap-3">
            <a routerLink="/tunnels" class="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <span class="material-symbols-outlined text-lg">router</span>
              Manage Tunnels
            </a>
            <a routerLink="/announcements" class="flex items-center gap-2 bg-transparent border border-border-dark text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-dark transition-colors">
              <span class="material-symbols-outlined text-lg">campaign</span>
              Announcements
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
      .text-gold {
        color: #FFD700;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  
  stats = signal<AdminStats | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadStats();
  }
  
  async loadStats(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const statsData = await this.apiService.getStats();
      this.stats.set(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      this.error.set(message);
      console.error('Error loading dashboard stats:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
