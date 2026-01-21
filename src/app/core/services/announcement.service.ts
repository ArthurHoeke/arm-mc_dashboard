import { Injectable, inject, signal } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';

export type AnnouncementType = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
  createdAt: Date;
  priority: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private firestore = inject(Firestore);
  private collectionName = 'announcements';
  private unsubscribe: Unsubscribe | null = null;
  
  announcements = signal<Announcement[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  constructor() {
    this.subscribeToAnnouncements();
  }
  
  /**
   * Subscribe to real-time updates from Firestore
   */
  private subscribeToAnnouncements(): void {
    this.isLoading.set(true);
    
    const announcementsRef = collection(this.firestore, this.collectionName);
    const q = query(announcementsRef, orderBy('priority', 'desc'), orderBy('createdAt', 'desc'));
    
    this.unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const announcements: Announcement[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data()['title'] || '',
          message: doc.data()['message'] || '',
          type: doc.data()['type'] || 'INFO',
          isActive: doc.data()['isActive'] ?? false,
          createdAt: doc.data()['createdAt']?.toDate() || new Date(),
          priority: doc.data()['priority'] || 0,
        }));
        this.announcements.set(announcements);
        this.isLoading.set(false);
        this.error.set(null);
      },
      (err) => {
        console.error('Error fetching announcements:', err);
        this.error.set('Failed to load announcements');
        this.isLoading.set(false);
      }
    );
  }
  
  /**
   * Create a new announcement
   */
  async create(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const announcementsRef = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(announcementsRef, {
        ...announcement,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw new Error('Failed to create announcement');
    }
  }
  
  /**
   * Update an existing announcement
   */
  async update(id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error('Error updating announcement:', err);
      throw new Error('Failed to update announcement');
    }
  }
  
  /**
   * Delete an announcement
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      throw new Error('Failed to delete announcement');
    }
  }
  
  /**
   * Toggle the active status of an announcement
   */
  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await this.update(id, { isActive });
  }
  
  /**
   * Cleanup subscription on destroy
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
