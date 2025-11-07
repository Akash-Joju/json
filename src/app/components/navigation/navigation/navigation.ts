import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlobalThemeToggleComponent } from '../../global-theme/global-theme';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, GlobalThemeToggleComponent],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-brand">
          <a routerLink="/" class="logo-link">
            <img 
              [src]="getLogoImage()" 
              alt="AWCS Labs" 
              class="logo-img" 
            />
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

          <!-- Tools Link - No Dropdown -->
          <a 
            routerLink="/tools" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            Tools
          </a>

          <a 
            routerLink="/about" 
            routerLinkActive="active" 
            class="nav-link"
            (click)="closeMobileMenu()">
            About
          </a>

          <!-- Global Theme Toggle -->
          <div class="nav-link theme-toggle-container">
            <app-global-theme-toggle></app-global-theme-toggle>
          </div>
        </div>

        <!-- Mobile menu button and theme toggle -->
        <div class="mobile-menu">
          <!-- Theme toggle for mobile -->
          <div class="mobile-theme-toggle">
            <app-global-theme-toggle></app-global-theme-toggle>
          </div>
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
export class NavigationComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  currentTheme: 'light' | 'dark' = 'light';
  private themeSubscription!: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  getLogoImage(): string {
    return this.currentTheme === 'dark' 
      ? 'assets/icons/white.png' 
      : 'assets/icons/black.png';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateBodyScroll();
  }

  openDropdown(): void {
    this.isDropdownOpen = true;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private updateBodyScroll(): void {
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-container') && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    this.closeMobileMenu();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-open');
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}