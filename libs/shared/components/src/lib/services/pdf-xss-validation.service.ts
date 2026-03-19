import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PdfXssValidationService {
  checkPdfFileForXss(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        // Check for XSS patterns in content
        const isSafe = !this.containsXssContent(content);
        resolve(isSafe);
      };
      reader.readAsText(file);
    });
  }

  private containsXssContent(content: string): boolean {
    const xssPatterns = [/javascript:/i, /<script/i, /onload=/i, /eval\(/i];
    return xssPatterns.some((pattern) => pattern.test(content));
  }
}
