import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageAdCampaignsComponent } from './page-ad-campaigns.component';
import { NbButtonModule } from '@commudle/theme';

/**
 * Manual Theme Testing Component for Ad Campaigns Page
 *
 * This component allows manual testing of the ad campaigns page
 * in both light and dark modes by providing theme switching buttons.
 *
 * To use this component:
 * 1. Add it to a route temporarily
 * 2. Navigate to the route in the browser
 * 3. Use the theme toggle buttons to test both modes
 * 4. Verify all sections display correctly
 * 5. Check glassmorphism effects work properly
 *
 * Requirements: 15.9 - Visual consistency across themes
 */
@Component({
  selector: 'commudle-theme-test-manual',
  standalone: true,
  imports: [CommonModule, PageAdCampaignsComponent, NbButtonModule],
  template: `
    <div class="theme-test-wrapper" [attr.data-theme]="currentTheme">
      <!-- Theme Control Panel -->
      <div class="theme-controls">
        <h2>Theme Testing Controls</h2>
        <p>Use the buttons below to test the ad campaigns page in different themes:</p>

        <div class="control-buttons">
          <button nbButton status="primary" [class.active]="currentTheme === 'light'" (click)="setTheme('light')">
            Light Mode
          </button>

          <button nbButton status="info" [class.active]="currentTheme === 'dark'" (click)="setTheme('dark')">
            Dark Mode
          </button>
        </div>

        <div class="test-checklist">
          <h3>Testing Checklist:</h3>
          <ul>
            <li>✓ Hero section displays correctly</li>
            <li>✓ Statistics section shows animated counters</li>
            <li>✓ Features section has proper card styling</li>
            <li>✓ Ad placements section shows all formats</li>
            <li>✓ Targeting section displays categories properly</li>
            <li>✓ CTA section has proper contrast</li>
            <li>✓ All text is readable (4.5:1 contrast ratio)</li>
            <li>✓ Buttons and interactive elements work</li>
            <li>✓ Glassmorphism effects display correctly</li>
            <li>✓ Animations and transitions work smoothly</li>
          </ul>
        </div>

        <div class="current-theme-info"><strong>Current Theme:</strong> {{ currentTheme | titlecase }}</div>
      </div>

      <!-- Ad Campaigns Page Component -->
      <div class="page-content">
        <commudle-page-ad-campaigns></commudle-page-ad-campaigns>
      </div>
    </div>
  `,
  styles: [
    `
      .theme-test-wrapper {
        min-height: 100vh;
        transition: all 0.3s ease;
      }

      /* Light theme styles */
      .theme-test-wrapper[data-theme='light'] {
        --color-yankees-blue: #222b45;
        --color-tyankees-blue: #222b45;
        --color-auro-metal-saurus: #667085;
        --color-bright-gray: #e4e9f2;
        --color-white: #ffffff;
        --color-twhite: #ffffff;
        --color-alice-blue: #edf5ff;
        --color-slate-100: #f1f5f9;
        --color-gunmetal: #2f2e41;
        --color-sonic-silver: #777777;
        --color-raisin-black: #231f20;
        --color-spanish-gray: #979797;
        --color-dark-spring-green: #10654c;
        --color-black-coral: #595867;
        --color-charcoal: #344054;
        --color-dark-jungle-green: #101828;
        --color-vampire-black: #0a0a0a;
        --color-anti-flash-white: #f2f2f2;
        --color-anti-flash: #edf1f7;
        --color-new-car: #1d4ed8;
        --color-quartz: #4b4b5c;
        --color-chocolate-traditional: #7d4402;
        --color-black: #000000;
        --color-tblack: #000000;
        --color-blue-50: #eff6ff;
        --color-gray-900: #111827;
        --color-gray-50: #f9fafb;
        --color-gray-500: #6b7280;
        --color-tgray-500: #6b7280;
        --color-gray-100: #f3f4f6;
        --color-gray-700: #374151;
        --color-gray-800: #1f2937;
        --color-gray-600: #4b5563;
        --color-gray-500-opacity-50: rgba(107, 114, 128, 0.5);
        --color-gray-custom-1: #f8fafc;
        --color-Bright-Gray-opacity-60: rgba(228, 233, 242, 0.6);
        --color-Bright-Gray-opacity-30: rgba(228, 233, 242, 0.3);
        --color-Ghost-White: #f8f8ff;
        --color-azure-opacity-10: rgba(0, 135, 241, 0.1);
        --color-white-opacity-40: rgba(255, 255, 255, 0.4);

        background-color: var(--color-white);
        color: var(--color-yankees-blue);
      }

      /* Dark theme styles */
      .theme-test-wrapper[data-theme='dark'] {
        --color-yankees-blue: #ffffff;
        --color-tyankees-blue: #222b45;
        --color-auro-metal-saurus: #a0a0a0;
        --color-bright-gray: #2c2c2c;
        --color-white: #1e1e1e;
        --color-twhite: #ffffff;
        --color-alice-blue: #1a1a2e;
        --color-slate-100: #2a2a3a;
        --color-gunmetal: #d0d0d0;
        --color-sonic-silver: #888888;
        --color-raisin-black: #dcecdf;
        --color-spanish-gray: #686868;
        --color-dark-spring-green: #ef9ab3;
        --color-black-coral: #a6a798;
        --color-charcoal: #cbbfab;
        --color-dark-jungle-green: #efe7d7;
        --color-vampire-black: #f5f5f5;
        --color-anti-flash-white: #0d0d0d;
        --color-anti-flash: #120e08;
        --color-new-car: #e2b127;
        --color-quartz: #b4b4a3;
        --color-chocolate-traditional: #82bbfd;
        --color-black: #ffffff;
        --color-tblack: #000000;
        --color-blue-50: #100906;
        --color-gray-900: #eee7d8;
        --color-gray-50: #060504;
        --color-gray-500: #948d7f;
        --color-tgray-500: #6b7280;
        --color-gray-100: #0c0b09;
        --color-gray-700: #c8beae;
        --color-gray-800: #e0d6c8;
        --color-gray-600: #b4aa9c;
        --color-gray-500-opacity-50: rgba(148, 141, 127, 0.5);
        --color-gray-custom-1: #070503;
        --color-Bright-Gray-opacity-60: rgba(44, 44, 44, 0.6);
        --color-Bright-Gray-opacity-30: rgba(44, 44, 44, 0.3);
        --color-Ghost-White: #070700;
        --color-azure-opacity-10: rgba(255, 120, 14, 0.1);
        --color-white-opacity-40: rgba(0, 0, 0, 0.4);

        background-color: var(--color-white);
        color: var(--color-yankees-blue);
      }

      .theme-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        padding: 20px;
        max-width: 300px;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      [data-theme='dark'] .theme-controls {
        background: rgba(30, 30, 30, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .theme-controls h2 {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 600;
      }

      .theme-controls p {
        margin: 0 0 15px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      .control-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      .control-buttons button {
        flex: 1;
        transition: all 0.2s ease;
      }

      .control-buttons button.active {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(51, 102, 255, 0.3);
      }

      .test-checklist {
        margin-bottom: 15px;
      }

      .test-checklist h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .test-checklist ul {
        margin: 0;
        padding-left: 20px;
        font-size: 12px;
        line-height: 1.4;
      }

      .test-checklist li {
        margin-bottom: 4px;
      }

      .current-theme-info {
        padding: 10px;
        background: rgba(51, 102, 255, 0.1);
        border-radius: 8px;
        font-size: 14px;
        text-align: center;
      }

      [data-theme='dark'] .current-theme-info {
        background: rgba(51, 102, 255, 0.2);
      }

      .page-content {
        width: 100%;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .theme-controls {
          position: relative;
          top: auto;
          right: auto;
          margin: 20px;
          max-width: none;
        }
      }
    `,
  ],
})
export class ThemeTestManualComponent implements OnInit {
  currentTheme: 'light' | 'dark' = 'light';

  ngOnInit(): void {
    // Set initial theme
    this.applyTheme();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.applyTheme();
    console.log(`Theme switched to: ${theme}`);
  }

  private applyTheme(): void {
    // Apply theme to document body for global effects
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', this.currentTheme);

      // Also apply to html element for comprehensive theming
      document.documentElement.setAttribute('data-theme', this.currentTheme);

      // Log theme change for debugging
      console.log(`Applied theme: ${this.currentTheme}`);
    }
  }
}
