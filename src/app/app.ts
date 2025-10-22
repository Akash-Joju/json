import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation/navigation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <div class="app-container">
      <app-navigation></app-navigation>
      <main class="main-content">
        <div class="container-fluid">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    
    .main-content {
      flex: 1;
      width: 100%;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      
      /* Critical: Ensure content starts below fixed navbar */
      padding-top: 80px;
      
      @media (max-width: 768px) {
        padding-top: 70px;
      }
      
      @media (max-width: 480px) {
        padding-top: 66px;
      }
      
      @media (max-width: 360px) {
        padding-top: 62px;
      }
    }
    
    .container-fluid {
      width: 100%;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
    }
  `]
})
export class AppComponent {
  title = 'JSON Tools';
}