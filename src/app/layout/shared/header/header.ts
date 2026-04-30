import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
toggleMobileMenu() {
throw new Error('Method not implemented.');
}
toggleProductMenu() {
throw new Error('Method not implemented.');
}
}

export class NavbarComponent {
  isMobileOpen = false;
  isProductOpen = false;

  toggleMobileMenu() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  toggleProductMenu() {
    this.isProductOpen = !this.isProductOpen;
  }
}