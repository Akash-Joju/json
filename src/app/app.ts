import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation/navigation';
import { FooterComponent } from './components/footer/footer/footer';
import { DebugComponent } from "./components/debugger/debugger";
import { PrivacyAlertBannerComponent } from './components/privacy-summary/privacy-summary/privacy-summary';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, FooterComponent, DebugComponent, PrivacyAlertBannerComponent],
  template: `
   <!-- <app-debug></app-debug> -->
    <div class="app-container">
      <app-navigation></app-navigation>
      <main class="main-content">
        <router-outlet></router-outlet>
        
      </main>
      <app-footer></app-footer>
        <!-- Privacy Alert Banner - shows on all pages -->
      <app-privacy-alert-banner></app-privacy-alert-banner>
    </div>
    
  `,
 styles: [`
  /* Global reset */
  :host {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    display: block !important;
  }
  
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
  }
  
  .main-content {
    flex: 1;
    width: 100% !important;
    background-color: var(--bg-primary) !important;
    margin: 0 !important;
    padding: 0 !important;
     padding-top: 50px !important;
    min-width: 100% !important;
    color: var(--text-primary) !important;
  }

  /* Ensure router outlet content takes full width */
  router-outlet {
    display: block;
    width: 100% !important;
  }

  router-outlet + * {
    width: 100% !important;
    display: block;
  }
`]
})
export class AppComponent {
  title = 'JSON Tools';

  constructor(private themeService: ThemeService) {
    // Force apply theme on app start - FIXED: use getCurrentThemeValue() instead
    setTimeout(() => {
      this.themeService.setTheme(this.themeService.getCurrentThemeValue());
    }, 100);
  }
}