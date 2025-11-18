import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUserMessage } from '@commudle/shared-models';
import { UserMessagesService } from 'apps/commudle-admin/src/app/services/user-messages.service';
import { Subject, takeUntil } from 'rxjs';
import { faArrowLeft, faThumbsUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { CommunityChannelHandlerService } from '@commudle/shared-components';
import { ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-forum-messages',
  templateUrl: './forum-messages.component.html',
  styleUrls: ['./forum-messages.component.scss'],
})
export class ForumMessagesComponent implements OnInit, OnDestroy {
  slug: string;
  forumId: string;
  discussionId: string;
  userMessageId: string;
  userMessage: IUserMessage;
  replyForm: FormGroup;

  readonly icons = {
    faArrowLeft,
    faThumbsUp,
    faEye,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly userMessagesService: UserMessagesService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly communityChannelHandlerService: CommunityChannelHandlerService,
    private readonly toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.replyForm = this.fb.group({
      reply: ['', Validators.required],
    });

    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.slug = params['slug'];
      this.forumId = params['forumId'];
      this.discussionId = params['discussionId'];
      this.userMessageId = params['userMessageId'];
      this.initChannel();
      this.getUserMessages();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserMessages() {
    this.userMessagesService.showUserMessage(Number(this.userMessageId)).subscribe((userMessage: IUserMessage) => {
      this.userMessage = userMessage;
    });
  }

  backToDiscussions() {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  onSubmit(): void {
    if (this.replyForm.valid) {
      const { reply } = this.replyForm.value;
      this.sendMessage(reply);
      this.replyForm.reset();
    } else {
      this.replyForm.markAllAsTouched();
    }
  }

  private sendMessage(message: string): void {
    if (!this.communityChannelHandlerService.CommunityChannelChatChannel) {
      console.error('CommunityChannelChatChannel not initialized');
      this.toastrService.warningDialog('Unable to send message. Channel not connected.');
      return;
    }

    this.communityChannelHandlerService.sendReply(Number(this.userMessageId), message);
  }

  private initChannel() {
    // Initialize channel if context is provided and not already subscribed
    if (this.discussionId && !this.communityChannelHandlerService.CommunityChannelChatChannel) {
      this.communityChannelHandlerService.init(parseInt(this.discussionId), 'channels');
    }
  }
}
