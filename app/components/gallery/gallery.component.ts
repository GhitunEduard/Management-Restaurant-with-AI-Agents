import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  title: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent {
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'Tutte', icon: 'photo_library' },
    { id: 'food', name: 'Cibo', icon: 'restaurant' },
    { id: 'interior', name: 'Interni', icon: 'chair' },
    { id: 'events', name: 'Eventi', icon: 'celebration' },
  ];

  galleryImages: GalleryImage[] = [
    // Food Images
    {
      id: 1,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Spaghetti Carbonara',
      category: 'food',
      title: 'Spaghetti alla Carbonara',
    },
    {
      id: 2,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Pizza Margherita',
      category: 'food',
      title: 'Pizza Margherita Napoletana',
    },
    {
      id: 3,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Tiramisu',
      category: 'food',
      title: 'Tiramisù della Casa',
    },
    {
      id: 4,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Risotto ai Funghi',
      category: 'food',
      title: 'Risotto ai Funghi Porcini',
    },
    {
      id: 5,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Osso Buco',
      category: 'food',
      title: 'Osso Buco alla Milanese',
    },
    {
      id: 6,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Antipasto Misto',
      category: 'food',
      title: 'Antipasto Misto della Casa',
    },

    // Interior Images
    {
      id: 7,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Sala principale',
      category: 'interior',
      title: 'Sala Principale',
    },
    {
      id: 8,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Terrazza',
      category: 'interior',
      title: 'Terrazza Panoramica',
    },
    {
      id: 9,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Cucina aperta',
      category: 'interior',
      title: 'Cucina a Vista',
    },
    {
      id: 10,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Bar area',
      category: 'interior',
      title: 'Area Bar',
    },
    {
      id: 11,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Sala privata',
      category: 'interior',
      title: 'Sala Privata',
    },

    // Events Images
    {
      id: 12,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Cena romantica',
      category: 'events',
      title: 'Cena Romantica',
    },
    {
      id: 13,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Festa di compleanno',
      category: 'events',
      title: 'Festa di Compleanno',
    },
    {
      id: 14,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Evento aziendale',
      category: 'events',
      title: 'Evento Aziendale',
    },
    {
      id: 15,
      src: '/placeholder.svg?height=400&width=600',
      alt: 'Serata wine tasting',
      category: 'events',
      title: 'Serata Wine Tasting',
    },
  ];

  constructor(private dialog: MatDialog) {}

  get filteredImages(): GalleryImage[] {
    if (this.selectedCategory === 'all') {
      return this.galleryImages;
    }
    return this.galleryImages.filter(
      (image) => image.category === this.selectedCategory
    );
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  openLightbox(image: GalleryImage) {
    // In a real application, you would open a lightbox dialog here
    console.log('Opening lightbox for:', image.title);
  }
}
