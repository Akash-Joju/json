import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <div class="header-icon"></div>
          <h1>About AWCS Labs</h1>
          <p class="header-subtitle">Innovation arm of Adhwaitha Web Consultancy Services</p>
        </div>
      </section>

      <!-- Main Content -->
      <div class="content-container">
        <!-- Who We Are -->
        <section class="content-section">
          <h2>Who We Are</h2>
          <div class="section-content">
            <p>
              AWCS Labs is the innovation arm of <strong>Adhwaitha Web Consultancy Services Pvt. Ltd.</strong>, 
              dedicated to creating fast, reliable, and developer-friendly tools that simplify everyday technical tasks.
            </p>
            <p>
              We believe that innovation should make life easier — not more complicated. That's why AWCS Labs builds 
              lightweight, powerful utilities designed to help developers view, compare, and transform data with just a few clicks.
            </p>
          </div>
        </section>

        <!-- Mission -->
        <section class="content-section mission-section">
          <div class="mission-header">
            <!-- <span class="mission-icon">🎯</span> -->
            <h2>Our Mission</h2>
          </div>
          <div class="section-content">
            <p>
              To empower developers and tech enthusiasts around the world with simple yet powerful web tools 
              that transform how they interact with data.
            </p>
            <p class="mission-highlight">
              We focus on speed, precision, and accessibility, ensuring our tools remain open, secure, and user-centric.
            </p>
          </div>
        </section>

        <!-- What We Do -->
        <section class="content-section">
          <h2>What We Do</h2>
          <div class="section-content">
            <p>At AWCS Labs, we specialize in building online tools for:</p>
            <div class="tools-list">
              <div class="tool-item">
                <span class="tool-bullet">•</span>
                <div>
                  <strong>JSON Viewing & Formatting</strong> – Beautify, structure, and validate JSON effortlessly.
                </div>
              </div>
              <div class="tool-item">
                <span class="tool-bullet">•</span>
                <div>
                  <strong>XML Comparison & Diffing</strong> – Identify differences between XML files in seconds.
                </div>
              </div>
              <div class="tool-item">
                <span class="tool-bullet">•</span>
                <div>
                  <strong>Data Conversion Tools</strong> – Convert between JSON, XML, and CSV formats instantly.
                </div>
              </div>
              <div class="tool-item">
                <span class="tool-bullet">•</span>
                <div>
                  <strong>More Utilities Coming Soon</strong> – YAML tools, CSV diff, and advanced data analytics support are on our roadmap.
                </div>
              </div>
            </div>
            <p class="note-text">
              Each tool is built with performance-first architecture, ensuring a seamless experience even for large data sets.
            </p>
          </div>
        </section>

        <!-- Philosophy -->
        <section class="content-section">
          <h2>Our Philosophy</h2>
          <div class="section-content">
            <p>
              We believe that technology should be accessible to everyone, from seasoned developers to beginners 
              experimenting with APIs and data formats.
            </p>
            <div class="philosophy-grid">
              <div class="philosophy-item">
                <h3>Simplicity</h3>
                <p>Tools that work right out of the box.</p>
              </div>
              <div class="philosophy-item">
                <h3>Transparency</h3>
                <p>No hidden data collection; everything runs securely in your browser.</p>
              </div>
              <div class="philosophy-item">
                <h3>Innovation</h3>
                <p>Constantly improving and experimenting to bring better developer experiences.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Roots -->
        <section class="content-section">
          <h2>Our Roots</h2>
          <div class="section-content">
            <p>
              AWCS Labs is part of <strong>Adhwaitha Web Consultancy Services</strong>, a technology company 
              committed to "Customization Through Innovation."
            </p>
            <p>
              We carry forward that spirit — crafting modular, adaptable, and forward-thinking solutions 
              to help businesses and individuals thrive in the digital age.
            </p>
          </div>
        </section>

        <!-- CTA -->
        <section class="cta-section">
          <div class="cta-content">
            <h2>Join the Journey</h2>
            <p>We're just getting started. Explore our tools, share your feedback, and help us build the next generation of developer utilities.</p>
            <div class="cta-buttons">
              <a routerLink="/" class="btn btn-primary">Explore Tools</a>
              <!-- <a routerLink="/contact" class="btn btn-secondary">Get In Touch</a> -->
            </div>
          </div>
        </section>

        <!-- Footer Quote -->
        <section class="quote-section">
          <p class="quote-text">AWCS Labs – Innovation in Every Line of Code.</p>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./about.scss']
})
export class AboutComponent implements OnInit {
  
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