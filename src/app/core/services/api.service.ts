import { Injectable, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

export interface Tunnel {
  id: number;
  subdomain: string;
  bind_port: number;
  remote_port: number;
  status: 'available' | 'reserved' | 'waiting' | 'active';
  user_id: string | null;
  token: string | null;
  expires_at: string | null;
  connection_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface TunnelStats {
  total: number;
  active: number;
  waiting: number;
  available: number;
  runningProcesses: number;
}

export interface UserStats {
  total: number;
  supporters: number;
}

export interface AdminStats {
  tunnels: TunnelStats;
  users: UserStats;
}

export interface TunnelsResponse {
  tunnels: Tunnel[];
  runningCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private auth = inject(Auth);
  private baseUrl = environment.apiUrl;
  
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  /**
   * Get the current user's Firebase ID token for API authentication
   */
  private async getAuthToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.getIdToken();
  }
  
  /**
   * Make an authenticated API request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Get all tunnels (admin only)
   */
  async getTunnels(): Promise<TunnelsResponse> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await this.request<TunnelsResponse>('/api/admin/tunnels');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tunnels';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Get admin dashboard stats (admin only)
   */
  async getStats(): Promise<AdminStats> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await this.request<AdminStats>('/api/admin/stats');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Kill a specific tunnel (admin only)
   */
  async killTunnel(tunnelId: number): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.request<{ success: boolean; message: string }>(
        `/api/admin/tunnel/${tunnelId}/kill`,
        { method: 'POST' }
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to kill tunnel';
      this.error.set(message);
      throw err;
    }
  }
  
  /**
   * Force cleanup of expired tunnels (admin only)
   */
  async forceCleanup(): Promise<{ success: boolean; cleaned: number }> {
    try {
      const result = await this.request<{ success: boolean; cleaned: number }>(
        '/api/admin/cleanup',
        { method: 'POST' }
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run cleanup';
      this.error.set(message);
      throw err;
    }
  }
  
  /**
   * Get server health status (public)
   */
  async getHealth(): Promise<{ status: string; runningTunnels: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
}
