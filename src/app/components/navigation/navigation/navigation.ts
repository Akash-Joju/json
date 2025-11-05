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
            <span class="logo-icon">📋</span>
            <span class="logo-text">AWCS Labs</span>
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
            🏠 Home
          </a>
          <!-- <a 
            routerLink="/viewer" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            🔍 JSON Viewer
          </a>
          <a 
            routerLink="/json-differ" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            ⚡ JSON Differ
          </a> -->
          <!-- <a 
            routerLink="/xml-viewer" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            📄 XML Viewer
          </a> -->
          <!-- <a 
            routerLink="/xml-differ" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            🔄 XML Differ
          </a> -->
          <a 
            routerLink="/tools" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            🛠️ Tools
          </a>
          <a 
            routerLink="/about" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            ℹ️ About
          </a>
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

  // Update body scroll based on menu state
  private updateBodyScroll(): void {
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  // Close menu when clicking outside on mobile
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-container') && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Close menu on window resize (if resizing to desktop)
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Close menu when navigating (using browser buttons)
  @HostListener('window:popstate')
  onPopState(): void {
    this.closeMobileMenu();
  }

  // Clean up when component is destroyed
  ngOnDestroy(): void {
    document.body.classList.remove('menu-open');
  }
}