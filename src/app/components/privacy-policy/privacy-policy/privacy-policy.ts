import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="privacy-container">
      <div class="privacy-header">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: November 2025</p>
      </div>

      <div class="privacy-content">
        <section class="intro-section">
          <p>
            Welcome to AWCS Labs (“we,” “our,” “us”). 
            Your privacy is important to us. This Privacy Policy explains how we handle information 
            when you use our website awcslabs.com (“Site”) and any tools or services we provide.
          </p>
        </section>

        <section class="policy-section">
          <h2>1. Overview</h2>
          <p>
            AWCS Labs provides a suite of online utilities for developers to view, compare, and convert 
            structured data formats like JSON, XML, and CSV. Our tools are designed to run entirely in 
            your web browser, ensuring that your data never leaves your device and is not stored on our servers.
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Information We Do NOT Collect</h2>
          <p>We do not collect, store, or share:</p>
          <ul>
            <li>Any JSON, XML, CSV, or file content you upload or paste into our tools.</li>
            <li>Any personal or sensitive information contained in your data.</li>
            <li>Any identifiable user data such as name, email, or IP address (except what's automatically handled by your browser for basic website operation).</li>
          </ul>
          <p>
            Your data is processed locally in your browser's memory, and is cleared as soon as you close or refresh the page.
          </p>
        </section>

        <section class="policy-section">
          <h2>3. Information We May Collect</h2>
          <p>To maintain and improve our website performance, we may collect:</p>
          <ul>
            <li>Basic usage analytics (via tools like Google Analytics or self-hosted equivalents).</li>
            <li>These include:
              <ul>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent</li>
                <li>Anonymous usage patterns (no personal identification)</li>
              </ul>
            </li>
          </ul>
          <p>You can disable such tracking through your browser settings or ad-blocking tools.</p>
        </section>

        <section class="policy-section">
          <h2>4. Cookies and Local Storage</h2>
          <p>We use cookies or local storage only to:</p>
          <ul>
            <li>Remember your theme or layout preferences (e.g., dark/light mode).</li>
            <li>Improve user experience across sessions.</li>
          </ul>
          <p>We do not use cookies for advertising, behavioral profiling, or third-party tracking.</p>
        </section>

        <section class="policy-section">
          <h2>5. Third-Party Services</h2>
          <p>Some tools may integrate with third-party APIs (for example, for validation or conversions). When this happens:</p>
          <ul>
            <li>We clearly indicate the API being used.</li>
            <li>Any data transmitted is minimal and temporary.</li>
            <li>We ensure the external service complies with privacy best practices.</li>
          </ul>
          <p>AWCS Labs is not responsible for the privacy policies of external sites or APIs linked from our platform.</p>
        </section>

        <section class="policy-section">
          <h2>6. Data Security</h2>
          <p>Although we don't store your data, we take all reasonable technical and organizational measures to protect:</p>
          <ul>
            <li>The integrity of our code and website;</li>
            <li>The security of any connections to external services.</li>
          </ul>
          <p>All connections to our site use HTTPS encryption by default.</p>
        </section>

        <section class="policy-section">
          <h2>7. Children's Privacy</h2>
          <p>
            Our website is intended for general audiences and is not directed toward children under 13 years of age.
            We do not knowingly collect personal data from minors.
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Your Rights (GDPR Compliance)</h2>
          <p>
            If you are located in the European Union (EU) or European Economic Area (EEA), you have the right to:
          </p>
          <ul>
            <li>Request information about any data we hold (we typically hold none).</li>
            <li>Request deletion or correction of any data submitted through contact forms.</li>
          </ul>
          <p>
            You may contact us anytime at <a href="mailto:privacy@awcslabs.com">privacy@awcslabs.com</a> for related requests.
          </p>
        </section>

        <section class="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. When we make significant changes, we'll post 
            an updated version on this page with a revised "Last Updated" date.
          </p>
        </section>

        <section class="policy-section">
          <h2>10. Contact Us</h2>
          <p>For questions or concerns about this Privacy Policy or your data privacy, contact us at:</p>
          <div class="contact-info">
            <p>📧 <a href="mailto:privacy@awcslabs.com">privacy@awcslabs.com</a></p>
            <p>🌐 <a href="https://awcslabs.com" target="_blank">https://awcslabs.com</a></p>
          </div>
          <p class="company-tagline">AWCS Labs - Innovation in Every Line of Code.</p>
        </section>
      </div>

      <div class="privacy-footer">
        <a routerLink="/" class="back-link">← Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .privacy-header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 30px;
    }

    .privacy-header h1 {
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

    .privacy-content {
      margin-bottom: 40px;
    }

    .intro-section {
      margin-bottom: 30px;
      font-size: 1.1rem;
    }

    .policy-section {
      margin-bottom: 35px;
    }

    .policy-section h2 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #ecf0f1;
    }

    .policy-section p {
      margin: 0 0 15px 0;
      font-size: 1rem;
    }

    .policy-section ul {
      margin: 15px 0;
      padding-left: 20px;
    }

    .policy-section li {
      margin-bottom: 8px;
      font-size: 1rem;
    }

    .policy-section ul ul {
      margin: 8px 0;
      padding-left: 20px;
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

    .privacy-footer {
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
      .privacy-container {
        padding: 20px 15px;
      }

      .privacy-header h1 {
        font-size: 2rem;
      }

      .policy-section h2 {
        font-size: 1.2rem;
      }

      .policy-section p, .policy-section li {
        font-size: 0.95rem;
      }
    }

    @media (max-width: 480px) {
      .privacy-header h1 {
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
export class PrivacyPolicyComponent implements OnInit {
  
  ngOnInit() {
    this.scrollToTop();
  }

  private scrollToTop() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }
}