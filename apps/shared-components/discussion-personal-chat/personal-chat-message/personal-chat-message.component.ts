import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { InViewportDirective } from '@commudle/in-viewport';
import { faGrin } from '@fortawesome/free-regular-svg-icons';
import { faCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { IUserMessage } from 'apps/shared-models/user_message.model';
import { IEditorValidator } from '@commudle/editor';
import * as moment from 'moment';
import { SVotesService } from 'apps/shared-components/services/s-votes.service';
import { EditorComponent } from '@commudle/editor';

@Component({
  selector: 'app-personal-chat-message',
  templateUrl: './personal-chat-message.component.html',
  styleUrls: ['./personal-chat-message.component.scss'],
  providers: [InViewportDirective],
  standalone: false,
})
export class PersonalChatMessageComponent implements OnInit {
  @Input() canReply: boolean;
  @Input() message: IUserMessage;
  @Input() currentUser: ICurrentUser;
  @Input() allActions;
  @Input() permittedActions;
  @Input() showFlagIcon = true;
  @Input() showReplyIcon = true;
  @Input() showFullDateTime = false;
  @Output() sendReply: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendFlag: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendDelete = new EventEmitter();
  faCircle = faCircle;
  faTrash = faTrash;
  showActionButton: boolean[] = [false];

  moment = moment;

  showReplyForm = false;
  showEmojiPicker = false;
  isVotingBlocked = false;
  totalVotesCount: number;

  @ViewChild('messageInput') messageInput: ElementRef<HTMLInputElement>;
  @ViewChild('replyEditor') replyEditor: EditorComponent;

  faGrin = faGrin;

  constructor(private fb: FormBuilder, private injector: Injector, private votesService: SVotesService) {}

  validators: IEditorValidator = {
    required: true,
    minLength: 1,
    maxLength: 200,
    noWhitespace: true,
  };

  ngOnInit(): void {
    this.getAllVotes();
  }

  emitReply(value): void {
    this.sendReply.emit({ content: value });
    this.showReplyForm = false;
  }

  emitFlag(messageId: number): void {
    this.sendFlag.emit(messageId);
  }

  emitDelete(messageId: number, isSelfMessage: boolean): void {
    this.sendDelete.emit({ messageId, isSelfMessage });
  }

  markAsRead(messageId: number, { visible }: { visible: boolean }): void {
    if (visible) {
      // this.message.is_read = true;
    }
  }

  isSelfMessage(): boolean {
    return !!this.currentUser && this.message?.user?.id === this.currentUser.id;
  }

  onHoverEnter(id) {
    this.showActionButton[id] = true;
  }

  onHoverLeave(id) {
    this.showActionButton[id] = false;
  }

  onLongPress(id) {
    this.showActionButton[id] = true;
  }

  getAllVotes() {
    this.votesService.pGetVotesCount('UserMessage', this.message.id).subscribe((data) => {
      this.totalVotesCount = data.total;
    });
  }

  onReplyClick(): void {
    this.showReplyForm = !this.showReplyForm;
    setTimeout(() => {
      if (this.replyEditor && this.replyEditor.editor && this.showReplyForm) {
        this.replyEditor.editor.commands.focus();
      }
    }, 0);
  }
}
