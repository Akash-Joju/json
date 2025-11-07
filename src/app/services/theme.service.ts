import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';
  private renderer: Renderer2;
  private themeSubject: BehaviorSubject<'light' | 'dark'>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.themeSubject = new BehaviorSubject<'light' | 'dark'>(this.currentTheme);
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('global-theme') as 'light' | 'dark';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    // Remove existing theme attribute
    this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
    
    // Add new theme attribute
    this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);
    
    this.currentTheme = theme;
    localStorage.setItem('global-theme', theme);
    
    // Update the theme subject
    this.themeSubject.next(theme);
    
    // Force update body and html styles
    this.updateBodyStyles(theme);
  }

  private updateBodyStyles(theme: 'light' | 'dark'): void {
    const body = this.document.body;
    const html = this.document.documentElement;
    
    if (theme === 'dark') {
      this.renderer.setStyle(body, 'background-color', '#1a1a1a');
      this.renderer.setStyle(body, 'color', '#ffffff');
      this.renderer.setStyle(html, 'background-color', '#1a1a1a');
    } else {
      this.renderer.setStyle(body, 'background-color', '#ffffff');
      this.renderer.setStyle(body, 'color', '#212529');
      this.renderer.setStyle(html, 'background-color', '#ffffff');
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  // FIXED: Remove duplicate method, keep only the observable version
  getCurrentTheme(): Observable<'light' | 'dark'> {
    return this.themeSubject.asObservable();
  }

  // ADD THIS: Method to get current theme value synchronously
  getCurrentThemeValue(): 'light' | 'dark' {
    return this.currentTheme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.applyTheme(theme);
  }
}