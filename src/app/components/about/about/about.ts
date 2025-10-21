import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="about-header">
        <h1>About JSON Tools</h1>
        <p class="subtitle">Learn more about our application and its features</p>
      </div>

      <div class="about-content">
        <section class="about-section">
          <h2>🚀 What is JSON Tools?</h2>
          <p>
            JSON Tools is a comprehensive web application designed to make working with JSON data 
            easier and more efficient. Whether you're a developer, data analyst, or student, 
            our tools help you visualize, validate, and manipulate JSON data with ease.
          </p>
        </section>

        <section class="about-section">
          <h2>🎯 Our Mission</h2>
          <p>
            To provide free, accessible, and powerful JSON processing tools that help developers 
            and data professionals work more efficiently with JSON data formats.
          </p>
        </section>

        <section class="about-section">
          <h2>🛠️ Technologies Used</h2>
          <div class="tech-grid">
            <div class="tech-item">
              <h3>Angular</h3>
              <p>Modern frontend framework</p>
            </div>
            <div class="tech-item">
              <h3>TypeScript</h3>
              <p>Type-safe JavaScript</p>
            </div>
            <div class="tech-item">
              <h3>SCSS</h3>
              <p>Advanced styling</p>
            </div>
            <div class="tech-item">
              <h3>HTML5</h3>
              <p>Modern web standards</p>
            </div>
          </div>
        </section>

        <section class="about-section">
          <h2>📞 Contact & Support</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you! 
            This is a learning project, so your feedback helps us improve.
          </p>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./about.scss']
})
export class AboutComponent {}