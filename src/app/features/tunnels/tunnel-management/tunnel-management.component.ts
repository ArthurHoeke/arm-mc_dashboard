import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Tunnel, TunnelStats, AdminStats } from '../../../core/services/api.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  percentage: number;
  percentageChange: string;
  percentageLabel: string;
  color: 'primary' | 'orange' | 'red';
}

@Component({
  selector: 'app-tunnel-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Breadcrumbs & Heading -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 text-sm font-medium">
        <span class="text-muted">Admin</span>
        <span class="material-symbols-outlined text-xs text-muted">chevron_right</span>
        <span class="text-white">Tunnel Management</span>
      </div>
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-white text-4xl font-bold tracking-tight">Tunnel Management</h2>
          <p class="text-muted text-base">
            Monitor and manage FRPS tunnels for Minecraft instances on PumpkinMC.
          </p>
        </div>
        <div class="flex gap-3">
          <button
            (click)="loadData()"
            class="flex items-center gap-2 bg-surface-dark border border-border-dark text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-border-dark transition-all"
          >
            <span class="material-symbols-outlined text-lg" [class.animate-spin]="isLoading()">refresh</span>
            Refresh
          </button>
          <button
            (click)="forceCleanup()"
            [disabled]="isCleaningUp()"
            class="flex items-center gap-2 bg-transparent border-2 border-primary text-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary hover:text-background-dark transition-all disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-lg" [class.animate-spin]="isCleaningUp()">cleaning_services</span>
            Force Cleanup
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    @if (error()) {
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-red-400">error</span>
        <p class="text-red-400 text-sm">{{ error() }}</p>
        <button (click)="loadData()" class="ml-auto text-red-400 hover:text-white text-sm font-bold">Retry</button>
      </div>
    }

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      @for (stat of stats(); track stat.label) {
        <div class="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <p class="text-muted text-sm font-medium">{{ stat.label }}</p>
            <span class="material-symbols-outlined text-primary">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-white text-2xl font-bold">{{ stat.value }}</p>
            <div class="w-full bg-border-dark h-1.5 rounded-full mt-2">
              <div
                class="h-full rounded-full transition-all duration-500"
                [ngClass]="{
                  'bg-primary': stat.color === 'primary',
                  'bg-orange-400': stat.color === 'orange',
                  'bg-red-400': stat.color === 'red'
                }"
                [style.width.%]="stat.percentage"
              ></div>
            </div>
          </div>
          <p
            class="text-xs font-bold"
            [ngClass]="{
              'text-primary': stat.color === 'primary',
              'text-orange-400': stat.color === 'orange',
              'text-red-400': stat.color === 'red'
            }"
          >
            {{ stat.percentageChange }}
            <span class="text-muted font-normal italic">{{ stat.percentageLabel }}</span>
          </p>
        </div>
      }
    </div>

    <!-- Table Section -->
    <div class="bg-surface-dark border border-border-dark rounded-xl overflow-hidden flex flex-col">
      <div class="p-6 border-b border-border-dark flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-4">
          <h3 class="text-white font-bold text-lg">All Tunnels</h3>
          <span
            class="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded border border-primary/20 uppercase font-black"
            >Live</span
          >
        </div>
        <div class="flex gap-2">
          <select
            class="bg-background-dark border-border-dark rounded-lg text-sm text-white focus:ring-primary focus:border-primary px-4 py-2"
            [(ngModel)]="statusFilter"
            (ngModelChange)="filterTunnels()"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="available">Available</option>
          </select>
          <button
            class="bg-border-dark text-white p-2 rounded-lg hover:bg-surface-dark transition-colors border border-transparent hover:border-border-dark"
          >
            <span class="material-symbols-outlined text-xl">filter_list</span>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="p-12 flex items-center justify-center">
          <span class="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
        </div>
      } @else {
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-background-dark/50">
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">
                  Subdomain
                </th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">
                  Remote Port
                </th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">User ID</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Expiry</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-dark/50">
              @for (tunnel of filteredTunnels(); track tunnel.id) {
                <tr class="hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4 font-mono text-primary text-sm">{{ tunnel.subdomain }}</td>
                  <td class="px-6 py-4 text-white text-sm">{{ tunnel.remote_port }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      @if (tunnel.status === 'active') {
                        <span class="relative flex h-2 w-2">
                          <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
                          ></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span class="text-primary text-xs font-bold uppercase tracking-widest">Active</span>
                      } @else if (tunnel.status === 'waiting') {
                        <span class="relative flex h-2 w-2">
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-400"></span>
                        </span>
                        <span class="text-orange-400 text-xs font-bold uppercase tracking-widest">Waiting</span>
                      } @else {
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-muted"></span>
                        <span class="text-muted text-xs font-bold uppercase tracking-widest">Available</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    @if (tunnel.user_id) {
                      <span class="text-white text-sm font-mono">{{ tunnel.user_id }}</span>
                    } @else {
                      <span class="text-muted text-sm italic">-</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-muted text-sm italic">{{ formatExpiry(tunnel.expires_at) }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      @if (tunnel.status !== 'available') {
                        <button
                          (click)="killTunnel(tunnel)"
                          class="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                          Kill
                        </button>
                      }
                      <button
                        (click)="viewDetails(tunnel)"
                        class="bg-surface-dark text-white border border-border-dark px-3 py-1.5 rounded text-xs font-bold hover:bg-white hover:text-background-dark transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center gap-4">
                      <div class="bg-border-dark p-6 rounded-full">
                        <span class="material-symbols-outlined text-6xl text-muted">leak_remove</span>
                      </div>
                      <div class="text-center">
                        <p class="text-white text-xl font-bold">No Tunnels Found</p>
                        <p class="text-muted">Try adjusting your search or filter settings.</p>
                      </div>
                      <button
                        (click)="resetFilters()"
                        class="text-primary font-bold text-sm underline underline-offset-4"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border-dark flex items-center justify-between">
          <p class="text-muted text-xs">
            Showing {{ filteredTunnels().length }} of {{ tunnels().length }} tunnels
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #102216;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #28392e;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #13ec5b;
      }
    `,
  ],
})
export class TunnelManagementComponent implements OnInit {
  private apiService = inject(ApiService);
  
  statusFilter = 'all';
  isLoading = signal(true);
  isCleaningUp = signal(false);
  error = signal<string | null>(null);

  tunnels = signal<Tunnel[]>([]);
  tunnelStats = signal<TunnelStats | null>(null);
  
  stats = computed<StatCard[]>(() => {
    const ts = this.tunnelStats();
    if (!ts) {
      return [
        { label: 'Total Tunnels', value: '-', icon: 'dns', percentage: 0, percentageChange: '', percentageLabel: 'loading...', color: 'primary' },
        { label: 'Active Tunnels', value: '-', icon: 'hub', percentage: 0, percentageChange: '', percentageLabel: 'loading...', color: 'primary' },
        { label: 'Waiting', value: '-', icon: 'hourglass_empty', percentage: 0, percentageChange: '', percentageLabel: 'loading...', color: 'orange' },
        { label: 'Available', value: '-', icon: 'check_circle', percentage: 0, percentageChange: '', percentageLabel: 'loading...', color: 'primary' },
      ];
    }
    
    const activePercentage = ts.total > 0 ? (ts.active / ts.total) * 100 : 0;
    const waitingPercentage = ts.total > 0 ? (ts.waiting / ts.total) * 100 : 0;
    const availablePercentage = ts.total > 0 ? (ts.available / ts.total) * 100 : 0;
    
    return [
      {
        label: 'Total Tunnels',
        value: `${ts.total}`,
        icon: 'dns',
        percentage: 100,
        percentageChange: `${ts.runningProcesses}`,
        percentageLabel: 'running processes',
        color: 'primary',
      },
      {
        label: 'Active Tunnels',
        value: `${ts.active}`,
        icon: 'hub',
        percentage: activePercentage,
        percentageChange: `${activePercentage.toFixed(1)}%`,
        percentageLabel: 'of total',
        color: 'primary',
      },
      {
        label: 'Waiting',
        value: `${ts.waiting}`,
        icon: 'hourglass_empty',
        percentage: waitingPercentage,
        percentageChange: `${waitingPercentage.toFixed(1)}%`,
        percentageLabel: 'pending connection',
        color: 'orange',
      },
      {
        label: 'Available',
        value: `${ts.available}`,
        icon: 'check_circle',
        percentage: availablePercentage,
        percentageChange: `${availablePercentage.toFixed(1)}%`,
        percentageLabel: 'ready for use',
        color: 'primary',
      },
    ];
  });

  filteredTunnels = computed(() => {
    const allTunnels = this.tunnels();
    if (this.statusFilter === 'all') {
      return allTunnels;
    }
    return allTunnels.filter((t) => t.status === this.statusFilter);
  });
  
  ngOnInit(): void {
    this.loadData();
  }
  
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const [tunnelsResponse, statsResponse] = await Promise.all([
        this.apiService.getTunnels(),
        this.apiService.getStats(),
      ]);
      
      this.tunnels.set(tunnelsResponse.tunnels);
      this.tunnelStats.set(statsResponse.tunnels);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      this.error.set(message);
      console.error('Error loading tunnel data:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  filterTunnels(): void {
    // Filtering is handled by the computed signal
  }

  resetFilters(): void {
    this.statusFilter = 'all';
  }

  async killTunnel(tunnel: Tunnel): Promise<void> {
    if (!confirm(`Are you sure you want to kill tunnel ${tunnel.subdomain}?`)) {
      return;
    }
    
    try {
      await this.apiService.killTunnel(tunnel.id);
      // Reload data after killing
      await this.loadData();
    } catch (err) {
      console.error('Error killing tunnel:', err);
      alert('Failed to kill tunnel');
    }
  }
  
  async forceCleanup(): Promise<void> {
    if (!confirm('Are you sure you want to force cleanup expired tunnels?')) {
      return;
    }
    
    this.isCleaningUp.set(true);
    
    try {
      const result = await this.apiService.forceCleanup();
      alert(`Cleanup complete. ${result.cleaned} tunnel(s) cleaned.`);
      await this.loadData();
    } catch (err) {
      console.error('Error during cleanup:', err);
      alert('Failed to run cleanup');
    } finally {
      this.isCleaningUp.set(false);
    }
  }

  viewDetails(tunnel: Tunnel): void {
    console.log('View details:', tunnel);
    // TODO: Implement view details modal
  }
  
  formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return 'N/A';
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `In ${minutes} min`;
  }
  
  getStatusDisplay(status: string): 'active' | 'available' {
    return status === 'active' || status === 'waiting' ? 'active' : 'available';
  }
}

