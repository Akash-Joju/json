import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="terms-container">
      <div class="terms-header">
        <h1>Terms and Conditions</h1>
        <p class="last-updated">Last Updated: November 2025</p>
      </div>

      <div class="terms-content">
        <section class="intro-section">
          <p>
            Welcome to AWCS Labs (“we,” “our,” “us”).
            By accessing or using our website awcslabs.com, you agree to be bound by these Terms and Conditions (“Terms”). 
            Please read them carefully before using our services. If you do not agree with these Terms, you should not use the website.
          </p>
        </section>

        <section class="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using this website or any of its tools and services, you acknowledge that you have read, understood, 
            and agree to comply with these Terms and our <a routerLink="/privacy">Privacy Policy</a>.
          </p>
        </section>

        <section class="terms-section">
          <h2>2. Description of Service</h2>
          <p>
            AWCS Labs provides online tools designed to help developers and users view, compare, and convert data 
            between different formats, including JSON, XML, and CSV.
          </p>
          <p>
            All tools are provided “as is” and primarily run in your web browser, meaning your data is not stored 
            or transmitted to our servers unless explicitly stated.
          </p>
        </section>

        <section class="terms-section">
          <h2>3. Use of the Website</h2>
          <p>You agree to use the website and its tools only for lawful purposes and in accordance with these Terms.</p>
          <p>You must not:</p>
          <ul>
            <li>Use the tools for illegal, unethical, or malicious activities.</li>
            <li>Attempt to reverse-engineer, hack, or interfere with the website's functionality.</li>
            <li>Upload or process data that violates any third-party rights or laws.</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website — including logos, designs, text, code, and graphics — is the intellectual 
            property of AWCS Labs or its parent company Adhwaitha Web Consultancy Services Pvt. Ltd., unless otherwise stated.
          </p>
          <p>
            You may use the website and tools for personal or professional tasks, but you may not copy, resell, 
            or distribute any part of the website's code or design without written consent.
          </p>
        </section>

        <section class="terms-section">
          <h2>5. Data Privacy</h2>
          <p>
            AWCS Labs respects your privacy. Most tools run entirely in your browser, and we do not collect or store 
            your files, JSON, or XML data.
          </p>
          <p>
            If any service requires external API calls or data transmission, that will be clearly indicated, 
            and such operations will follow our <a routerLink="/privacy">Privacy Policy</a>.
          </p>
        </section>

        <section class="terms-section">
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            All services and tools on AWCS Labs are provided “as is” and without warranties of any kind, 
            whether express or implied.
          </p>
          <p>We make no guarantees about:</p>
          <ul>
            <li>The accuracy or reliability of tool outputs.</li>
            <li>The continuous availability of the website.</li>
            <li>The suitability of the tools for any particular purpose.</li>
          </ul>
          <p>Use of our website is entirely at your own risk.</p>
        </section>

        <section class="terms-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AWCS Labs and its affiliates shall not be liable for any direct, 
            indirect, incidental, or consequential damages arising from:
          </p>
          <ul>
            <li>Use or inability to use the tools;</li>
            <li>Loss of data or business interruption;</li>
            <li>Errors or inaccuracies in tool results.</li>
          </ul>
          <p>
            If you are dissatisfied with any portion of the website, your sole remedy is to stop using it.
          </p>
        </section>

        <section class="terms-section">
          <h2>8. External Links</h2>
          <p>
            Our website may contain links to third-party websites or tools. We are not responsible for the content, 
            policies, or practices of those third parties.
          </p>
          <p>Accessing any external site through AWCS Labs is at your own risk.</p>
        </section>

        <section class="terms-section">
          <h2>9. Updates and Modifications</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the website or these Terms at any time without prior notice.
          </p>
          <p>The most current version of the Terms will always be available on this page.</p>
        </section>

        <section class="terms-section">
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and interpreted in accordance with the laws of Ireland, 
            without regard to conflict of law principles.
          </p>
          <p>Any disputes arising under these Terms will be subject to the exclusive jurisdiction of the courts in Ireland.</p>
        </section>

        <section class="terms-section">
          <h2>11. Contact Us</h2>
          <p>If you have questions or feedback about these Terms, please contact us at:</p>
          <div class="contact-info">
            <p>📧 <a href="mailto:contact@awcslabs.com">contact@awcslabs.com</a></p>
            <p>🌐 <a href="https://awcslabs.com" target="_blank">https://awcslabs.com</a></p>
          </div>
          <p class="company-tagline">AWCS Labs - Innovation in Every Line of Code.</p>
        </section>
      </div>

      <div class="terms-footer">
        <a routerLink="/" class="back-link">← Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .terms-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .terms-header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 30px;
    }

    .terms-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 10px 0;
    }

    .last-updated {
      font-size: 1rem;
      color: #7f8c8d;
      font-style: italic;
      margin: 0;
    }

    .terms-content {
      margin-bottom: 40px;
    }

    .intro-section {
      margin-bottom: 30px;
      font-size: 1.1rem;
    }

    .terms-section {
      margin-bottom: 35px;
    }

    .terms-section h2 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #ecf0f1;
    }

    .terms-section p {
      margin: 0 0 15px 0;
      font-size: 1rem;
    }

    .terms-section ul {
      margin: 15px 0;
      padding-left: 20px;
    }

    .terms-section li {
      margin-bottom: 8px;
      font-size: 1rem;
    }

    a {
      color: #3498db;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    a:hover {
      color: #2980b9;
      text-decoration: underline;
    }

    .contact-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .contact-info p {
      margin: 8px 0;
      font-size: 1.1rem;
    }

    .company-tagline {
      font-style: italic;
      color: #7f8c8d;
      text-align: center;
      font-weight: 500;
      margin-top: 20px !important;
    }

    .terms-footer {
      text-align: center;
      padding-top: 30px;
      border-top: 2px solid #f0f0f0;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .back-link:hover {
      background: #2980b9;
      text-decoration: none;
      transform: translateY(-1px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .terms-container {
        padding: 20px 15px;
      }

      .terms-header h1 {
        font-size: 2rem;
      }

      .terms-section h2 {
        font-size: 1.2rem;
      }

      .terms-section p, .terms-section li {
        font-size: 0.95rem;
      }
    }

    @media (max-width: 480px) {
      .terms-header h1 {
        font-size: 1.8rem;
      }

      .contact-info {
        padding: 15px;
      }

      .back-link {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class TermsConditionsComponent implements OnInit {
  
  ngOnInit() {
    this.scrollToTop();
  }

  private scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }
}