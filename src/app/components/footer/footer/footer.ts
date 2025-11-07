import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <!-- Copyright and Links -->
        <div class="footer-section">
          <div class="copyright">
            © 2025 Powered by Adhwaitha Web Consultancy Services
          </div>
          
        </div>

         <div class="footer-section">
          <div class="copyright">
            All Rights reserved
          </div>
          
        </div>

        <div class="footer-section">
          <div class="footer-links">
            
            <a routerLink="/privacy-policy" class="footer-link">Privacy Policy</a>
            <span class="link-separator">|</span>
            <a routerLink="/terms" class="footer-link">Terms and Conditions</a>
          </div>
        </div>

        <!-- Social Links -->
        <div class="footer-section">
          <div class="social-container">
            <span class="follow-text">Follow us on</span>
            <a 
              href="https://www.linkedin.com/company/adhwaitha-web-consultancy-services/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="social-link"
              aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: #ecf0f1;
      padding: 20px 0;
      margin: 0;
      border-top: 1px solid #34495e;
      width: 100%;
      box-sizing: border-box;
    }

    .footer-content {
      max-width: 1200px;
      // margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap;
      gap: 15px;
      box-sizing: border-box;
    }

    .footer-section {
      display: flex;
      align-items: center;
      flex: 0 1 auto;
      white-space: nowrap;
    }

    .footer-section:first-child {
      justify-content: flex-start;
    }

    .footer-section:nth-child(2) {
      justify-content: center;
    }

    .footer-section:last-child {
      justify-content: flex-end;
    }

    .copyright {
      font-size: 0.85rem;
      color: #bdc3c7;
      line-height: 1.4;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
    }

    .footer-link {
      color: #ecf0f1;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease;
      white-space: nowrap;
    }

    .footer-link:hover {
      color: #3498db;
      text-decoration: underline;
    }

    .link-separator {
      color: #7f8c8d;
      font-size: 0.85rem;
    }

    .social-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .follow-text {
      font-size: 0.85rem;
      color: #bdc3c7;
      white-space: nowrap;
    }

    .social-link {
      color: #ecf0f1;
      padding: 6px;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .social-link:hover {
      color: #3498db;
      background: rgba(52, 152, 219, 0.1);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .footer-section {
        justify-content: center;
        // width: 100%;
      }

      .copyright, .follow-text {
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: 0 15px;
      }
      
      .copyright {
        font-size: 0.8rem;
      }
      
      .footer-link, .follow-text {
        font-size: 0.8rem;
      }
    }
  `]
})
export class FooterComponent {
  logoPath = 'assets/images/awcs-labs-logo.png';
}