import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IForum } from '@commudle/shared-models';
import { Subject, takeUntil } from 'rxjs';
import { faArrowLeft, faThumbsUp, faEye } from '@fortawesome/free-solid-svg-icons';
import { CommunityChannelHandlerService } from '@commudle/shared-components';
import { ToastrService } from '@commudle/shared-services';
import { ForumsStore } from '@commudle/shared-services';

@Component({
  standalone: false,
  selector: 'commudle-forum-messages',
  templateUrl: './forum-messages.component.html',
  styleUrls: ['./forum-messages.component.scss'],
})
export class ForumMessagesComponent implements OnInit, OnDestroy {
  categorySlug: string;
  userMessageSlug: string;
  forum: IForum;
  replyForm: FormGroup;

  readonly icons = {
    faArrowLeft,
    faThumbsUp,
    faEye,
  };

  readonly userMessage$ = this.forumsStore.currentUserMessage$;
  readonly isLoadingUserMessage$ = this.forumsStore.isLoadingUserMessage$;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly communityChannelHandlerService: CommunityChannelHandlerService,
    private readonly toastrService: ToastrService,
    private readonly forumsStore: ForumsStore,
  ) {
    this.replyForm = this.fb.group({
      reply: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.categorySlug = params['category_slug'];
      this.userMessageSlug = params['user_message_slug'];
      this.forumsStore.loadUserMessage(this.userMessageSlug);
    });

    this.activatedRoute.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.forum = data.forum;
    });
  }

  ngOnDestroy(): void {
    this.forumsStore.clearUserMessage();
    this.destroy$.next();
    this.destroy$.complete();
  }

  backToDiscussions() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
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
    this.communityChannelHandlerService.sendReply(this.userMessageSlug, message);
  }
}
