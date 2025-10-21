import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Welcome to JSON Tools</h1>
        <p class="subtitle">Your all-in-one solution for working with JSON data</p>
        
        <div class="cta-buttons">
          <button routerLink="/viewer" class="cta-btn primary">
            🚀 Start Using JSON Viewer
          </button>
          <button routerLink="/tools" class="cta-btn secondary">
            🛠️ Explore All Tools
          </button>
        </div>
      </div>

      <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>JSON Viewer</h3>
            <p>Visualize and explore your JSON data with our interactive tree viewer</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Fast Validation</h3>
            <p>Real-time JSON validation with detailed error messages</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Format & Minify</h3>
            <p>Beautiful formatting and minification for your JSON data</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Copy & Share</h3>
            <p>Easy copying and sharing of formatted JSON</p>
          </div>
        </div>
      </div>

      <div class="quick-start">
        <h2>Quick Start</h2>
        <div class="code-example">
          <pre>{{ sampleJson }}</pre>
          <button (click)="copySampleJson()" class="copy-btn">
            📋 Copy Sample JSON
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "isStudent": false,
  "hobbies": ["reading", "gaming"],
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}`;

  copySampleJson() {
    navigator.clipboard.writeText(this.sampleJson);
    // You can add a toast notification here later
    alert('Sample JSON copied to clipboard!');
  }
}