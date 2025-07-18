import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  values = [
    {
      icon: 'restaurant',
      title: 'Tradiție Autentică',
      description:
        'Rețete transmise din generație în generație, preparate cu ingrediente importate direct din Italia.',
    },
    {
      icon: 'eco',
      title: 'Ingrediente Proaspete',
      description:
        'Utilizăm doar ingrediente de primă calitate, selectate cu grijă de la cei mai buni furnizori locali și italieni.',
    },
    {
      icon: 'favorite',
      title: 'Pasiune Italiană',
      description:
        'Fiecare preparat este gătit cu dragoste și dedicare, respectând vechea tradiție culinară italiană.',
    },
  ];
}
