import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-alert-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="privacy-alert-banner" *ngIf="!isDismissed">
      <div class="alert-content">
        <div class="alert-icon">
  <i class="fas fa-shield-alt"></i>
</div>

        
        <div class="alert-text">
          <span class="alert-title">Your Privacy Matters</span>
          <span class="alert-message">
            We use minimal cookies for preferences. Your data stays in your browser. 
            <a routerLink="/privacy-policy" class="alert-link">Learn more</a>
          </span>
        </div>

        <div class="alert-actions">
          <button class="accept-btn" (click)="accept()">I Understand</button>
          <button class="dismiss-btn" (click)="dismiss()">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-alert-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      background: #2c3e50;
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideUp 0.5s ease-out;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
    }

    .alert-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .alert-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .alert-title {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .alert-message {
      font-size: 0.85rem;
      opacity: 0.9;
      line-height: 1.4;
    }

    .alert-link {
      color: #3498db;
      text-decoration: underline;
      margin-left: 4px;
    }

    .alert-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .accept-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .accept-btn:hover {
      background: #2980b9;
      transform: translateY(-1px);
    }

    .dismiss-btn {
      background: transparent;
      color: white;
      border: none;
      font-size: 1.2rem;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dismiss-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .privacy-alert-banner {
        bottom: 10px;
        width: 95%;
      }

      .alert-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .alert-actions {
        width: 100%;
        justify-content: center;
      }

      .accept-btn {
        flex: 1;
      }
    }

    @media (max-width: 480px) {
      .alert-content {
        padding: 12px 16px;
      }
    }
  `]
})
export class PrivacyAlertBannerComponent {
  isDismissed = false;

  ngOnInit() {
    // Check if user already dismissed the banner
    const dismissed = localStorage.getItem('privacyBannerDismissed');
    this.isDismissed = dismissed === 'true';
  }

  accept() {
    this.dismiss();
    // You can also set a cookie preference here if needed
  }

  dismiss() {
    this.isDismissed = true;
    // Remember user's choice
    localStorage.setItem('privacyBannerDismissed', 'true');
  }
}