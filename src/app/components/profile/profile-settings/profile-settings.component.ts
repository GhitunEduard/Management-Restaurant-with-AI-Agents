import { Component, inject, type OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileSettingsService } from '../../../services/profile-settings.service';
import type { User } from '../../../models/user/user.model';
import type { UpdateUserRequest } from '../../../models/user/update-user.model';
import { HttpEventType } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  private serverUrl = 'http://localhost:8082';
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  editableUser: UpdateUserRequest = {};

  isLoading = true;
  isEditing = false;
  isSaving = false;
  isUploading = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  imagePreview: string | ArrayBuffer | null = null;

  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  private profileService = inject(ProfileSettingsService);

  ngOnInit(): void {
    this.isLoading = true;
    this.profileService
      .getCurrentUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.resetEditableUser();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.showNotification('Failed to load profile information', 'error');
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * NOU: Am reintrodus metoda pentru butonul "Try Again".
   * Acum, ea doar comandă o reîmprospătare a datelor.
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.refreshUserData();
  }

  resetEditableUser(): void {
    if (this.currentUser) {
      this.editableUser = {
        name: this.currentUser.name,
        phone: this.currentUser.phone,
        role: this.currentUser.role,
      };
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.resetEditableUser();
    }
  }

  saveProfile(): void {
    if (!this.isFormValid()) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }
    this.isSaving = true;
    const updateData: UpdateUserRequest = {};
    if (this.editableUser.name !== this.currentUser?.name)
      updateData.name = this.editableUser.name;
    if (this.editableUser.phone !== this.currentUser?.phone)
      updateData.phone = this.editableUser.phone;
    if (this.canEditRole() && this.editableUser.role !== this.currentUser?.role)
      updateData.role = this.editableUser.role;

    if (Object.keys(updateData).length === 0) {
      this.isEditing = false;
      this.isSaving = false;
      this.showNotification('No changes to save', 'info');
      return;
    }

    this.profileService
      .updateUserProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isEditing = false;
          this.isSaving = false;
          this.showNotification('Profile updated successfully!', 'success');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.showNotification('Failed to update profile', 'error');
          this.isSaving = false;
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showNotification('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        this.showNotification('File size must be less than 5MB', 'error');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = e.target?.result ?? null);
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadProgress = 0;

    this.profileService
      .uploadProfileImage(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event.type === HttpEventType.Response) {
            this.isUploading = false;
            this.selectedFile = null;
            this.imagePreview = null;
            this.showNotification(
              'Profile image updated successfully!',
              'success'
            );
            this.profileService.refreshUserData();
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.showNotification('Failed to upload image', 'error');
          this.isUploading = false;
        },
      });
  }

  cancelImageSelection(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  isFormValid(): boolean {
    return !!(
      this.editableUser.name?.trim() && this.editableUser.phone?.trim()
    );
  }

  canEditRole(): boolean {
    return this.profileService.canPerformAdminActions();
  }

  getProfileImageUrl(): string {
    if (this.currentUser?.profileImageUrl) {
      if (this.currentUser.profileImageUrl.startsWith('http')) {
        return this.currentUser.profileImageUrl;
      }
      return `${this.serverUrl}${this.currentUser.profileImageUrl}`;
    }
    return 'https://placehold.co/150x150/EBF4FF/76A9FA?text=No+Image';
  }

  showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ): void {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      message,
      type,
    };
    this.notifications.push(notification);
    setTimeout(() => this.removeNotification(notification.id), 5000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
