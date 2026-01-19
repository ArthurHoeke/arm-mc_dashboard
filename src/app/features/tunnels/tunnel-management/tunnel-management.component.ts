import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tunnel {
  id: string;
  subdomain: string;
  remotePort: number;
  status: 'active' | 'available';
  userId: string;
  expiry: string;
}

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
        <button
          class="flex items-center gap-2 bg-transparent border-2 border-primary text-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary hover:text-background-dark transition-all"
        >
          <span class="material-symbols-outlined text-lg">cleaning_services</span>
          Force Cleanup
        </button>
      </div>
    </div>

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
                class="h-full"
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
          <h3 class="text-white font-bold text-lg">Live Connections</h3>
          <span
            class="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded border border-primary/20 uppercase font-black"
            >Real-time</span
          >
        </div>
        <div class="flex gap-2">
          <select
            class="bg-background-dark border-border-dark rounded-lg text-sm text-white focus:ring-primary focus:border-primary px-4 py-2"
            [(ngModel)]="statusFilter"
            (change)="filterTunnels()"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="available">Available</option>
          </select>
          <button
            class="bg-border-dark text-white p-2 rounded-lg hover:bg-surface-dark transition-colors border border-transparent hover:border-border-dark"
          >
            <span class="material-symbols-outlined text-xl">filter_list</span>
          </button>
        </div>
      </div>

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
                <td class="px-6 py-4 text-white text-sm">{{ tunnel.remotePort }}</td>
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
                    } @else {
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-muted"></span>
                      <span class="text-muted text-xs font-bold uppercase tracking-widest">Available</span>
                    }
                  </div>
                </td>
                <td class="px-6 py-4">
                  <a
                    class="text-muted text-sm hover:text-white underline underline-offset-4 decoration-border-dark cursor-pointer"
                  >
                    {{ tunnel.userId }}
                  </a>
                </td>
                <td class="px-6 py-4 text-muted text-sm italic">{{ tunnel.expiry }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      (click)="killTunnel(tunnel)"
                      class="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Kill
                    </button>
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
        <div class="flex gap-2">
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-surface-dark text-muted border border-border-dark cursor-not-allowed opacity-50"
          >
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-primary text-background-dark font-bold text-xs"
          >
            1
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-surface-dark text-white border border-border-dark text-xs hover:bg-border-dark"
          >
            2
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-surface-dark text-white border border-border-dark text-xs hover:bg-border-dark"
          >
            3
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded bg-surface-dark text-white border border-border-dark hover:bg-border-dark"
          >
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
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
export class TunnelManagementComponent {
  statusFilter = 'all';

  stats = signal<StatCard[]>([
    {
      label: 'RAM Usage',
      value: '6.2GB / 8GB',
      icon: 'memory',
      percentage: 77.5,
      percentageChange: '+5.2%',
      percentageLabel: 'from last hour',
      color: 'primary',
    },
    {
      label: 'CPU Load',
      value: '42%',
      icon: 'developer_board',
      percentage: 42,
      percentageChange: '-2.1%',
      percentageLabel: 'from last hour',
      color: 'orange',
    },
    {
      label: 'Active Tunnels',
      value: '128 / 500',
      icon: 'hub',
      percentage: 25.6,
      percentageChange: '+12%',
      percentageLabel: 'new connections',
      color: 'primary',
    },
    {
      label: 'Network Traffic',
      value: '1.2 GB/s',
      icon: 'speed',
      percentage: 60,
      percentageChange: '-1.2%',
      percentageLabel: 'downlink delta',
      color: 'red',
    },
  ]);

  tunnels = signal<Tunnel[]>([
    {
      id: '1',
      subdomain: 'survival.armmc.com',
      remotePort: 25565,
      status: 'active',
      userId: 'usr_9921_beta',
      expiry: 'In 2 days',
    },
    {
      id: '2',
      subdomain: 'creative.armmc.com',
      remotePort: 25566,
      status: 'available',
      userId: 'usr_4401_lite',
      expiry: 'Expired',
    },
    {
      id: '3',
      subdomain: 'hardcore.armmc.com',
      remotePort: 25600,
      status: 'active',
      userId: 'usr_0012_god',
      expiry: 'In 14 hours',
    },
    {
      id: '4',
      subdomain: 'testing.dev.armmc.com',
      remotePort: 30001,
      status: 'active',
      userId: 'dev_internal_01',
      expiry: 'Infinite',
    },
  ]);

  filteredTunnels = signal<Tunnel[]>(this.tunnels());

  filterTunnels(): void {
    if (this.statusFilter === 'all') {
      this.filteredTunnels.set(this.tunnels());
    } else {
      this.filteredTunnels.set(
        this.tunnels().filter((t) => t.status === this.statusFilter)
      );
    }
  }

  resetFilters(): void {
    this.statusFilter = 'all';
    this.filteredTunnels.set(this.tunnels());
  }

  killTunnel(tunnel: Tunnel): void {
    console.log('Kill tunnel:', tunnel);
    // TODO: Implement tunnel kill logic
  }

  viewDetails(tunnel: Tunnel): void {
    console.log('View details:', tunnel);
    // TODO: Implement view details modal
  }
}
