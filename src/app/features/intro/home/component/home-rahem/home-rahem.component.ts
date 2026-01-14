import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
      selector: 'app-home-rahem',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './home-rahem.component.html',
      styleUrl: './home-rahem.component.css'
})
export class HomeRahemComponent {
      isSidebarOpen: boolean = false;

      toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
      }
}
