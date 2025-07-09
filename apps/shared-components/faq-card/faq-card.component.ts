import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { IFaq } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { faAdd, faMinus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-faq-card',
  templateUrl: './faq-card.component.html',
  styleUrls: ['./faq-card.component.scss'],
})
export class FaqCardComponent implements OnInit {
  @Input() faq: IFaq;
  @Input() isAdmin = false;
  @Output() destroyFaqEvent: EventEmitter<IFaq> = new EventEmitter();
  @Output() editFaqEvent: EventEmitter<IFaq> = new EventEmitter();
  showAnswers = [];
  icons = { faAdd, faMinus, faTrash, faEdit };

  showAnswer = false;

  constructor(private dialogService: NbDialogService) {}

  ngOnInit() {}

  toggleShowAnswers() {
    this.showAnswer = !this.showAnswer;
  }

  deleteFaq(faq: IFaq) {
    this.destroyFaqEvent.emit(faq);
  }

  editFaq(faq: IFaq) {
    this.editFaqEvent.emit(faq);
  }

  openConfirmDialogBox(faq: IFaq, dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, { context: { faq } });
  }
}
