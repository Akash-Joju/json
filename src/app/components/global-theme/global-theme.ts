import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ADD THIS
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-global-theme-toggle',
  standalone: true,
  imports: [CommonModule], // ADD THIS for AsyncPipe
  template: `
    <button 
      class="global-theme-toggle"
      (click)="toggleTheme()"
      [title]="(themeService.getCurrentTheme() | async) === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
      type="button"
    >
      <span class="theme-icon">
        {{ (themeService.getCurrentTheme() | async) === 'light' ? '🌙' : '☀️' }}
      </span>
      <span class="theme-text">
        {{ (themeService.getCurrentTheme() | async) === 'light' ? 'Dark' : 'Light' }}
      </span>
    </button>
  `,
  styles: [`
    .global-theme-toggle {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      font-family: inherit;
      
      &:hover {
        background: var(--bg-tertiary);
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    .theme-icon {
      font-size: 16px;
    }
    
    .theme-text {
      font-weight: 500;
      
      @media (max-width: 768px) {
        display: none;
      }
    }
  `]
})
export class GlobalThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}