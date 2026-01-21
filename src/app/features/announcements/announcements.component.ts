import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService, Announcement, AnnouncementType } from '../../core/services/announcement.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Breadcrumbs & Heading -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 text-sm font-medium">
        <span class="text-muted">Admin</span>
        <span class="material-symbols-outlined text-xs text-muted">chevron_right</span>
        <span class="text-white">Announcements</span>
      </div>
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-white text-4xl font-bold tracking-tight">Announcements</h2>
          <p class="text-muted text-base">
            Manage service announcements shown to app users.
          </p>
        </div>
        <button
          (click)="openCreateModal()"
          class="flex items-center gap-2 bg-primary text-background-dark px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          New Announcement
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-muted text-sm font-medium">Total Announcements</p>
          <span class="material-symbols-outlined text-primary">campaign</span>
        </div>
        <p class="text-white text-2xl font-bold">{{ totalCount() }}</p>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-muted text-sm font-medium">Active</p>
          <span class="material-symbols-outlined text-primary">visibility</span>
        </div>
        <p class="text-white text-2xl font-bold">{{ activeCount() }}</p>
      </div>
      
      <div class="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-muted text-sm font-medium">Inactive</p>
          <span class="material-symbols-outlined text-muted">visibility_off</span>
        </div>
        <p class="text-white text-2xl font-bold">{{ inactiveCount() }}</p>
      </div>
    </div>

    <!-- Announcements Table -->
    <div class="bg-surface-dark border border-border-dark rounded-xl overflow-hidden flex flex-col">
      <div class="p-6 border-b border-border-dark flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-4">
          <h3 class="text-white font-bold text-lg">All Announcements</h3>
        </div>
        <div class="flex gap-2">
          <select
            class="bg-background-dark border-border-dark rounded-lg text-sm text-white focus:ring-primary focus:border-primary px-4 py-2"
            [(ngModel)]="statusFilter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            class="bg-background-dark border-border-dark rounded-lg text-sm text-white focus:ring-primary focus:border-primary px-4 py-2"
            [(ngModel)]="typeFilter"
          >
            <option value="all">All Types</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
            <option value="SUCCESS">Success</option>
          </select>
        </div>
      </div>

      @if (announcementService.isLoading()) {
        <div class="p-12 flex items-center justify-center">
          <span class="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
        </div>
      } @else if (filteredAnnouncements().length === 0) {
        <div class="p-12 flex flex-col items-center justify-center gap-4">
          <span class="material-symbols-outlined text-muted text-5xl">campaign</span>
          <p class="text-muted text-sm">No announcements found</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-background-dark/50">
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Title</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Priority</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider">Created</th>
                <th class="px-6 py-4 text-muted font-medium text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-dark/50">
              @for (announcement of filteredAnnouncements(); track announcement.id) {
                <tr class="hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4">
                    <button
                      (click)="toggleActive(announcement)"
                      class="flex items-center gap-2 cursor-pointer"
                    >
                      @if (announcement.isActive) {
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span class="text-primary text-xs font-bold uppercase tracking-widest">Active</span>
                      } @else {
                        <span class="relative flex h-2 w-2">
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-muted"></span>
                        </span>
                        <span class="text-muted text-xs font-bold uppercase tracking-widest">Inactive</span>
                      }
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      class="text-xs font-bold uppercase px-2 py-1 rounded"
                      [ngClass]="getTypeClasses(announcement.type)"
                    >
                      {{ announcement.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col gap-1">
                      <span class="text-white text-sm font-medium">{{ announcement.title }}</span>
                      <span class="text-muted text-xs line-clamp-1">{{ announcement.message }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-white text-sm">{{ announcement.priority }}</td>
                  <td class="px-6 py-4 text-muted text-sm">{{ formatDate(announcement.createdAt) }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        (click)="openEditModal(announcement)"
                        class="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                        title="Edit"
                      >
                        <span class="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        (click)="confirmDelete(announcement)"
                        class="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" (click)="closeModal()">
        <div 
          class="bg-surface-dark border border-border-dark rounded-xl w-full max-w-lg mx-4"
          (click)="$event.stopPropagation()"
        >
          <div class="p-6 border-b border-border-dark flex items-center justify-between">
            <h3 class="text-white font-bold text-lg">
              {{ editingAnnouncement() ? 'Edit Announcement' : 'New Announcement' }}
            </h3>
            <button (click)="closeModal()" class="text-muted hover:text-white transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 flex flex-col gap-4">
            <!-- Title -->
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted font-medium">Title</label>
              <input
                type="text"
                [(ngModel)]="formData.title"
                class="bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                placeholder="Announcement title..."
              />
            </div>
            
            <!-- Message -->
            <div class="flex flex-col gap-2">
              <label class="text-sm text-muted font-medium">Message</label>
              <textarea
                [(ngModel)]="formData.message"
                rows="4"
                class="bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                placeholder="Announcement message..."
              ></textarea>
            </div>
            
            <!-- Type & Priority -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm text-muted font-medium">Type</label>
                <select
                  [(ngModel)]="formData.type"
                  class="bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="SUCCESS">Success</option>
                </select>
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm text-muted font-medium">Priority (0-100)</label>
                <input
                  type="number"
                  [(ngModel)]="formData.priority"
                  min="0"
                  max="100"
                  class="bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            
            <!-- Active Toggle -->
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-muted font-medium">Active (visible to users)</span>
              <button
                (click)="formData.isActive = !formData.isActive"
                class="relative w-12 h-6 rounded-full transition-colors"
                [ngClass]="formData.isActive ? 'bg-primary' : 'bg-border-dark'"
              >
                <span
                  class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                  [ngClass]="formData.isActive ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
          
          <div class="p-6 border-t border-border-dark flex justify-end gap-3">
            <button
              (click)="closeModal()"
              class="px-6 py-2.5 rounded-lg border border-border-dark text-white font-medium hover:bg-border-dark transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="saveAnnouncement()"
              [disabled]="isSaving()"
              class="px-6 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              @if (isSaving()) {
                <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              } @else {
                {{ editingAnnouncement() ? 'Update' : 'Create' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" (click)="closeDeleteModal()">
        <div 
          class="bg-surface-dark border border-border-dark rounded-xl w-full max-w-md mx-4"
          (click)="$event.stopPropagation()"
        >
          <div class="p-6 flex flex-col items-center gap-4">
            <div class="bg-red-500/20 p-4 rounded-full">
              <span class="material-symbols-outlined text-red-400 text-4xl">delete_forever</span>
            </div>
            <h3 class="text-white font-bold text-lg">Delete Announcement?</h3>
            <p class="text-muted text-sm text-center">
              Are you sure you want to delete "{{ deletingAnnouncement()?.title }}"? This action cannot be undone.
            </p>
          </div>
          
          <div class="p-6 border-t border-border-dark flex justify-center gap-3">
            <button
              (click)="closeDeleteModal()"
              class="px-6 py-2.5 rounded-lg border border-border-dark text-white font-medium hover:bg-border-dark transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="deleteAnnouncement()"
              [disabled]="isDeleting()"
              class="px-6 py-2.5 rounded-lg bg-red-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              @if (isDeleting()) {
                <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              } @else {
                Delete
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
    
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class AnnouncementsComponent {
  announcementService = inject(AnnouncementService);
  adminService = inject(AdminService);
  
  statusFilter = 'all';
  typeFilter = 'all';
  
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingAnnouncement = signal<Announcement | null>(null);
  deletingAnnouncement = signal<Announcement | null>(null);
  isSaving = signal(false);
  isDeleting = signal(false);
  
  formData = {
    title: '',
    message: '',
    type: 'INFO' as AnnouncementType,
    priority: 0,
    isActive: true,
  };
  
  // Computed values
  totalCount = computed(() => this.announcementService.announcements().length);
  activeCount = computed(() => this.announcementService.announcements().filter(a => a.isActive).length);
  inactiveCount = computed(() => this.announcementService.announcements().filter(a => !a.isActive).length);
  
  filteredAnnouncements = computed(() => {
    let announcements = this.announcementService.announcements();
    
    if (this.statusFilter === 'active') {
      announcements = announcements.filter(a => a.isActive);
    } else if (this.statusFilter === 'inactive') {
      announcements = announcements.filter(a => !a.isActive);
    }
    
    if (this.typeFilter !== 'all') {
      announcements = announcements.filter(a => a.type === this.typeFilter);
    }
    
    return announcements;
  });
  
  getTypeClasses(type: AnnouncementType): string {
    switch (type) {
      case 'INFO':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'WARNING':
        return 'bg-orange-400/20 text-orange-400 border border-orange-400/30';
      case 'CRITICAL':
        return 'bg-red-400/20 text-red-400 border border-red-400/30';
      case 'SUCCESS':
        return 'bg-green-400/20 text-green-400 border border-green-400/30';
      default:
        return 'bg-primary/20 text-primary border border-primary/30';
    }
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  openCreateModal(): void {
    this.editingAnnouncement.set(null);
    this.formData = {
      title: '',
      message: '',
      type: 'INFO',
      priority: 0,
      isActive: true,
    };
    this.showModal.set(true);
  }
  
  openEditModal(announcement: Announcement): void {
    this.editingAnnouncement.set(announcement);
    this.formData = {
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      isActive: announcement.isActive,
    };
    this.showModal.set(true);
  }
  
  closeModal(): void {
    this.showModal.set(false);
    this.editingAnnouncement.set(null);
  }
  
  async saveAnnouncement(): Promise<void> {
    if (!this.formData.title.trim() || !this.formData.message.trim()) {
      return;
    }
    
    this.isSaving.set(true);
    
    try {
      const editing = this.editingAnnouncement();
      if (editing?.id) {
        await this.announcementService.update(editing.id, {
          title: this.formData.title,
          message: this.formData.message,
          type: this.formData.type,
          priority: this.formData.priority,
          isActive: this.formData.isActive,
        });
      } else {
        await this.announcementService.create({
          title: this.formData.title,
          message: this.formData.message,
          type: this.formData.type,
          priority: this.formData.priority,
          isActive: this.formData.isActive,
        });
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
  
  async toggleActive(announcement: Announcement): Promise<void> {
    if (!announcement.id) return;
    await this.announcementService.toggleActive(announcement.id, !announcement.isActive);
  }
  
  confirmDelete(announcement: Announcement): void {
    this.deletingAnnouncement.set(announcement);
    this.showDeleteModal.set(true);
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingAnnouncement.set(null);
  }
  
  async deleteAnnouncement(): Promise<void> {
    const announcement = this.deletingAnnouncement();
    if (!announcement?.id) return;
    
    this.isDeleting.set(true);
    
    try {
      await this.announcementService.delete(announcement.id);
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      this.isDeleting.set(false);
    }
  }
}
