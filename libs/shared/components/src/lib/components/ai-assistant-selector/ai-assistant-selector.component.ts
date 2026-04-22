import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClaude, faOpenai, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface AiAssistant {
  id: string;
  name: string;
  icon: any;
  url: string;
  color: string;
}

@Component({
  selector: 'commudle-ai-assistant-selector',
  standalone: true,
  imports: [CommonModule, NbButtonModule, FontAwesomeModule],
  templateUrl: './ai-assistant-selector.component.html',
  styleUrls: ['./ai-assistant-selector.component.scss'],
})
export class AiAssistantSelectorComponent {
  @Input() prompt = '';
  @Input() title = 'Explore with AI';
  @Input() description = 'Choose an AI assistant to explore this article further:';

  @Output() assistantSelected = new EventEmitter<string>();
  @Output() promptCopied = new EventEmitter<boolean>();

  isCopied = false;

  readonly icons = {
    faClaude,
    faXTwitter,
    faOpenai,
    faCopy,
  };

  // TODO: Move to static assets store or local file instead of using external URL
  // Should be stored in assets folder like: assets/images/icons/icon-ai-sparkles.svg
  readonly staticAssets = {
    icon_ai_sparkles:
      'https://json.commudle.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0ZpQmc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--bd690c690e8a6a3f0407a30eca21333fd3fe0a79/icon-ai-sparkles-1.svg',
  };

  assistants: AiAssistant[] = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      icon: faOpenai,
      url: 'https://chat.openai.com/',
      color: 'primary',
    },
    {
      id: 'claude',
      name: 'Claude',
      icon: faClaude,
      url: 'https://claude.ai/',
      color: 'warning',
    },
    {
      id: 'grok',
      name: 'Grok',
      icon: faXTwitter,
      url: 'https://grok.com',
      color: 'info',
    },
  ];

  /**
   * Copies text to clipboard using modern Clipboard API with fallback
   * @param text - The text to copy to clipboard
   * @returns Promise<boolean> - True if copy succeeded, false otherwise
   */
  private async copyToClipboard(text: string): Promise<boolean> {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('Clipboard API failed:', error);
        // Fall through to fallback method
      }
    }

    // Fallback for older browsers or non-secure contexts
    return this.fallbackCopyToClipboard(text);
  }

  /**
   * Fallback clipboard copy using document.execCommand
   * @param text - The text to copy to clipboard
   * @returns boolean - True if copy succeeded, false otherwise
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');

    document.body.appendChild(textarea);

    try {
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      document.body.removeChild(textarea);
      return false;
    }
  }

  /**
   * Builds the complete URL for an AI assistant with the encoded prompt
   * @param assistant - The AI assistant object
   * @param encodedPrompt - The URL-encoded prompt string
   * @returns string - The complete URL to open the assistant with the prompt
   */
  private buildAssistantUrl(assistant: AiAssistant, encodedPrompt: string): string {
    const urlMap: Record<string, string> = {
      chatgpt: `https://chat.openai.com/?q=${encodedPrompt}`,
      claude: `https://claude.ai/new?q=${encodedPrompt}`,
      grok: `https://grok.com/?q=${encodedPrompt}`,
    };

    return urlMap[assistant.id] || `${assistant.url}?q=${encodedPrompt}`;
  }

  /**
   * Validates that the prompt is not empty or whitespace-only
   * @returns boolean - True if prompt is valid, false otherwise
   */
  private validatePrompt(): boolean {
    if (!this.prompt || this.prompt.trim().length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Sanitizes and prepares the prompt for URL encoding
   * Handles special characters, Unicode, and very long prompts
   * @param prompt - The raw prompt string
   * @returns string - The sanitized prompt ready for encoding
   */
  private sanitizePrompt(prompt: string): string {
    let sanitized = prompt.trim();

    const MAX_PROMPT_LENGTH = 8000;
    if (sanitized.length > MAX_PROMPT_LENGTH) {
      sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
      console.warn(`Prompt truncated to ${MAX_PROMPT_LENGTH} characters for URL compatibility`);
    }

    return sanitized;
  }

  /**
   * Gets the full URL for an AI assistant with the encoded prompt
   * @param assistant - The AI assistant
   * @returns string - The complete URL with prompt
   */
  getAssistantUrl(assistant: AiAssistant): string {
    if (!this.validatePrompt()) {
      return assistant.url;
    }

    try {
      const sanitizedPrompt = this.sanitizePrompt(this.prompt);
      const encodedPrompt = encodeURIComponent(sanitizedPrompt);
      return this.buildAssistantUrl(assistant, encodedPrompt);
    } catch (error) {
      console.error('Error building assistant URL:', error);
      return assistant.url;
    }
  }

  /**
   * Copies the prompt to clipboard and provides user feedback
   * @param event - The click event
   */
  async copyPrompt(event?: MouseEvent): Promise<void> {
    if (event) {
      event.preventDefault(); // Prevent default anchor behavior
    }

    if (!this.validatePrompt()) {
      console.error('Cannot copy: prompt is empty');
      this.promptCopied.emit(false);
      return;
    }

    try {
      const success = await this.copyToClipboard(this.prompt);

      if (success) {
        this.isCopied = true;
        this.promptCopied.emit(true);

        // Reset the "Copied" state after 3 seconds
        setTimeout(() => {
          this.isCopied = false;
        }, 3000);
      } else {
        console.error('✗ Failed to copy prompt to clipboard');
        this.promptCopied.emit(false);
      }
    } catch (error) {
      console.error('Error copying prompt:', error);
      this.promptCopied.emit(false);
    }
  }
}
