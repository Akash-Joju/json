import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
   <!-- home.component.html (replace current template) -->
 <!-- Hero Section -->
    <section class="hero-section">
      
      <div class="content">
        <p class="eyebrow">AWCS Labs</p>
        <h1>Your Everyday Developer Toolkit — Simple. Fast. Free.</h1>
        <p class="subtitle">
          View, compare, and convert JSON, XML, and CSV files — all in one clean workspace.
        </p>

        <div class="cta-buttons">
          <a routerLink="/viewer" class="cta-btn primary">Launch JSON Viewer</a>
          <a routerLink="/tools" class="cta-btn secondary">Explore All Tools</a>
        </div>
      </div>

      <div class="image">
        <img
          src="assets/icons/code.svg"
          alt="Illustration showing XML and JSON conversion"
        />
      </div>
    </section>

    <!-- Tools Section -->
     
    <section class="tools-section">
      <h2 class="section-title">Tools</h2>

      <div class="tools-grid">
        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/brain.svg" alt="" />
          </div>
          <h3>JSON Viewer</h3>
          <p>Pretty print and explore JSON instantly.</p>
          <a routerLink="/viewer" class="card-cta">Open Tool →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/arrow-both.svg" alt="" />
          </div>
          <h3>JSON Diff</h3>
          <p>Compare two JSON files side by side.</p>
          <a routerLink="/json-differ" class="card-cta">Compare Now →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/a-b-2.svg" alt="" />
          </div>
          <h3>XML Compare</h3>
          <p>Spot differences in XML structures.</p>
          <a routerLink="/xml-differ" class="card-cta">Try XML Diff →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/api-app-off.svg" alt="" />
          </div>
          <h3>JSON ↔ CSV Converter</h3>
          <p>Convert between structured formats in one click.</p>
          <a routerLink="/json-csv" class="card-cta">Convert Data →</a>
        </article>


        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/activity.svg" alt="" />
          </div>
          <h3>XML Viewer</h3>
          <p>Beautify and analyze XML Documents</p>
          <a routerLink="/xml-viewer" class="card-cta">Open Viewer →</a>
        </article>


        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/article.svg" alt="" />
          </div>
          <h3>XML ↔ CSV Converter</h3>
          <p>Convert between structured formats in one click.</p>
          <a routerLink="/xml-csv" class="card-cta">Open Converter →</a>
        </article>


          
      </div>
    </section>


     

    <!-- Why Section -->
    <section class="why-section">
      <h2>Why AWCS Labs</h2>
      <div class="why-grid">
        <div class="why-item">
          <img src="assets/icons/user-off.svg" alt="" />
          <h4>No Signup Required</h4>
          <p>Use tools instantly without barriers.</p>
        </div>
        <div class="why-item">
          <img src="assets/icons/bolt.svg" alt="" />
          <h4>Lightning Fast</h4>
          <p>Built with optimized parsers & a minimal UI.</p>
        </div>
        <div class="why-item">
          <img src="assets/icons/lock.svg" alt="" />
          <h4>Secure & Private</h4>
          <p>All processing happens in your browser.</p>
        </div>
      </div>
    </section>

    

  `,
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  
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
