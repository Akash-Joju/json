import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-brand">
          <a routerLink="/" class="logo-link">
            <img src="assets/icons/black.png" alt="AWCS Labs" class="logo-img" />
            
          </a>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="nav-links" [class.active]="isMobileMenuOpen">
          <a 
            routerLink="/" 
            routerLinkActive="active" 
            [routerLinkActiveOptions]="{ exact: true }" 
            class="nav-link"
            (click)="closeMobileMenu()">
            Home
          </a>

          <!-- Tools Dropdown -->
          <div 
            class="nav-link dropdown" 
            (mouseenter)="openDropdown()" 
            (mouseleave)="closeDropdown()">
            <button class="dropdown-btn" type="button">
              Tools ▾
            </button>
            <div class="dropdown-menu" [class.show]="isDropdownOpen">
              <a routerLink="/viewer" routerLinkActive="active" (click)="closeMobileMenu()">JSON Viewer</a>
              <a routerLink="/json-differ" routerLinkActive="active" (click)="closeMobileMenu()">JSON Diff</a>
              <a routerLink="/xml-viewer" routerLinkActive="active" (click)="closeMobileMenu()">XML Viewer</a>
              <a routerLink="/xml-differ" routerLinkActive="active" (click)="closeMobileMenu()">XML Diff</a>
              <a routerLink="/json-csv" routerLinkActive="active" (click)="closeMobileMenu()">JSON → CSV</a>
              <a routerLink="/xml-csv" routerLinkActive="active" (click)="closeMobileMenu()">XML → CSV</a>
            </div>
          </div>

          <!-- <a 
            routerLink="/docs" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            Docs
          </a> -->

          <a 
            routerLink="/about" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            About
          </a>

          <!-- <a 
            routerLink="/contact" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            Contact
          </a> -->
        </div>

        <!-- Mobile menu button -->
        <div class="mobile-menu">
          <button 
            class="menu-btn" 
            (click)="toggleMobileMenu()"
            [class.active]="isMobileMenuOpen"
            aria-label="Toggle menu"
            [attr.aria-expanded]="isMobileMenuOpen">
            <span class="menu-icon">☰</span>
            <span class="close-icon">✕</span>
          </button>
        </div>
      </div>

      <!-- Mobile menu overlay -->
      <div 
        class="mobile-overlay" 
        [class.active]="isMobileMenuOpen"
        (click)="closeMobileMenu()"
        aria-hidden="true">
      </div>
    </nav>
  `,
  styleUrls: ['./navigation.scss']
})
export class NavigationComponent implements OnDestroy {
  isMobileMenuOpen = false;
  isDropdownOpen = false;

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScroll();
  }

  // Close mobile menu
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateBodyScroll();
  }

  // Dropdown controls
  openDropdown(): void {
    this.isDropdownOpen = true;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Manage scroll
  private updateBodyScroll(): void {
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-container') && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Close on resize
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Close on browser navigation
  @HostListener('window:popstate')
  onPopState(): void {
    this.closeMobileMenu();
  }

  // Cleanup
  ngOnDestroy(): void {
    document.body.classList.remove('menu-open');
  }
}
