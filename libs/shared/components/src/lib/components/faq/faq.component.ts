import { Component, Input, OnInit } from '@angular/core';
import { IFaq } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  @Input() faqs: IFaq[];
  showAnswers = [];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.setSchema();
  }

  setSchema() {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs.map((faq: { question: string; answer: string }) => {
        return {
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        };
      }),
    };

    this.seoService.setSchema(faqSchema);
  }
}
