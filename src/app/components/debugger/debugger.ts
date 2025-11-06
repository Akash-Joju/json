import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-debug',
  standalone: true,
  template: `
    <div style="position: fixed; top: 0; left: 0; background: red; color: white; padding: 10px; z-index: 9999;">
      Debug Info:<br>
      Body margin: {{bodyMargin}}<br>
      Body padding: {{bodyPadding}}<br>
      HTML margin: {{htmlMargin}}<br>
      HTML padding: {{htmlPadding}}
    </div>
  `
})
export class DebugComponent implements OnInit {
  bodyMargin = '';
  bodyPadding = '';
  htmlMargin = '';
  htmlPadding = '';

  ngOnInit() {
    const bodyStyle = window.getComputedStyle(document.body);
    const htmlStyle = window.getComputedStyle(document.documentElement);
    
    this.bodyMargin = bodyStyle.margin;
    this.bodyPadding = bodyStyle.padding;
    this.htmlMargin = htmlStyle.margin;
    this.htmlPadding = htmlStyle.padding;

    console.log('Body styles:', {
      margin: bodyStyle.margin,
      padding: bodyStyle.padding,
      width: bodyStyle.width
    });
    
    console.log('HTML styles:', {
      margin: htmlStyle.margin,
      padding: htmlStyle.padding,
      width: htmlStyle.width
    });

    // Try to force remove margins and padding
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }
}