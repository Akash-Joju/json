import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">🚀 Powerful JSON & XML Tools</div>
          <h1 class="hero-title">Transform Your Data Workflow</h1>
          <p class="hero-subtitle">
            Experience the ultimate suite of JSON & XML processing tools designed for developers, 
            data analysts, and professionals who demand precision and efficiency.
          </p>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">5+</div>
              <div class="stat-label">Powerful Tools</div>
            </div>
            <div class="stat">
              <div class="stat-number">100%</div>
              <div class="stat-label">Free & Open</div>
            </div>
            <div class="stat">
              <div class="stat-number">⚡</div>
              <div class="stat-label">Lightning Fast</div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-card card-1">📊</div>
          <div class="floating-card card-2">🔧</div>
          <div class="floating-card card-3">🎯</div>
          <div class="floating-card card-4">⚡</div>
        </div>
      </div>

      <!-- Features Grid -->
      <section class="features-section">
        <h2 class="section-title">Why Choose Our Tools?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Beautiful Interface</h3>
            <p>Clean, intuitive design that makes data processing a pleasure</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Process large datasets instantly with optimized algorithms</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>Your data never leaves your browser - complete privacy guaranteed</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Works perfectly on desktop and tablets</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Precision Tools</h3>
            <p>Accurate conversions and validations you can trust</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>No Setup Required</h3>
            <p>Start using immediately in your browser - zero installation</p>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="mission-content">
          <div class="mission-text">
            <h2>Our Vision</h2>
            <p>
              We believe that powerful data tools should be accessible to everyone. 
              Our mission is to break down barriers in data processing by providing 
              professional-grade tools that are completely free and easy to use.
            </p>
            <div class="mission-highlights">
              <div class="highlight">
                <span class="highlight-icon">💝</span>
                <span>Always Free</span>
              </div>
              <div class="highlight">
                <span class="highlight-icon">🌍</span>
                <span>Accessible Worldwide</span>
              </div>
              <div class="highlight">
                <span class="highlight-icon">🔓</span>
                <span>No Restrictions</span>
              </div>
            </div>
          </div>
          <div class="mission-visual">
            <div class="visual-element globe">🌐</div>
          </div>
        </div>
      </section>

      <!-- Contact CTA -->
      <section class="contact-section">
        <div class="contact-card">
          <div class="contact-content">
            <h2>Ready to Transform Your Workflow?</h2>
            <p>Start using our powerful JSON tools today and experience the difference</p>
            <div class="cta-buttons">
              <button class="cta-primary" routerLink="/">Get Started Now</button>
              <button class="cta-secondary">Learn More</button>
            </div>
          </div>
          <div class="contact-visual">
            <div class="rocket">🚀</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./about.scss']
})
export class AboutComponent {}