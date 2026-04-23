import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  AuthService,
  CommunityChannelManagerService,
  CommunityChannelsService,
  ToastrService,
} from '@commudle/shared-services';
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { EUserRoles, ICommunityChannel, IPageInfo, IUser, IUserRolesUser } from '@commudle/shared-models';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'commudle-channel-members',
  templateUrl: './channel-members.component.html',
  styleUrls: ['./channel-members.component.scss'],
  standalone: false,
})
export class ChannelMembersComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() channelOrForum: ICommunityChannel;
  @Input() discussionType;
  subscriptions: Subscription[] = [];
  EUserRoles = EUserRoles;
  channelMembers: IUserRolesUser[] = [];
  admins: IUserRolesUser[] = [];
  allUsers: IUserRolesUser[] = [];
  currentUser: IUser;
  currentUserIsAdmin = false;
  isLoading = false;
  @Output() closeMembersList = new EventEmitter<number>();
  channelRoles = {};
  forumsRoles = {};
  isSuperAdmin = true;

  pageInfo: IPageInfo;
  totalMembers = 0;
  totalOrganizers = 0;

  private destroy$ = new Subject<void>();
  @ViewChildren('memberDiv') memberDivs!: QueryList<ElementRef>;
  channelForm: FormGroup;
  query = '';
  private readonly isBrowser: boolean;

  constructor(
    private communityChannelsService: CommunityChannelsService,
    private authService: AuthService,
    private toastrService: ToastrService,
    private communityChannelManagerService: CommunityChannelManagerService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.channelForm = this.fb.group({
      q: '',
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();

    // get roles as per discussion type
    if (this.discussionType === 'channel') {
      this.getChannelRoles();
    } else if (this.discussionType === 'forum') {
      this.getForumsRoles();
    }

    this.search();
  }

  search() {
    this.channelForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.query = this.channelForm.controls['q'].value;
      this.pageInfo = null;
      this.admins = [];
      this.channelMembers = [];
      this.getMembers();
      this.getAdmins();
    });
  }

  ngAfterViewInit(): void {
    this.observeThirdLastElement();
  }

  observeThirdLastElement() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.channelMembers.length < this.totalMembers) {
            this.getMembers();
          }
        });
      },
      { threshold: 1.0, rootMargin: '100px' }, // Root margin ensures early detection
    );

    this.memberDivs.changes.subscribe(() => {
      this.attachObserver(observer);
    });

    // Initial check if elements are already available
    this.attachObserver(observer);
  }

  attachObserver(observer: IntersectionObserver) {
    observer.disconnect(); // Clear previous observers

    if (this.memberDivs.length >= 3) {
      // Observe the third last element
      const thirdLastIndex = this.memberDivs.length - 3;
      observer.observe(this.memberDivs.get(thirdLastIndex).nativeElement);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    this.channelMembers = [];
    this.admins = [];
    this.getAdmins();
    this.getMembers();
  }

  // details of current user
  getCurrentUser() {
    this.subscriptions.push(
      this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.currentUser = data;
        if (this.currentUser.user_roles.includes(EUserRoles.SYSTEM_ADMINISTRATOR)) {
          this.isSuperAdmin = true;
        }
      }),
    );
  }

  // get roles of channels and check admin for forums
  getChannelRoles() {
    this.subscriptions.push(
      this.communityChannelManagerService.allChannelRoles$.subscribe((data) => {
        this.channelRoles = data;
        this.channelRoles[this.channelOrForum.id].find((k) => {
          this.currentUserIsAdmin = k === EUserRoles.COMMUNITY_CHANNEL_ADMIN;
        });
      }),
    );
  }

  // get roles of forums and check admin for forums
  getForumsRoles() {
    this.subscriptions.push(
      this.communityChannelManagerService.allForumRoles$.subscribe((data) => {
        this.forumsRoles = data;
        if (this.forumsRoles[this.channelOrForum.id]) {
          this.forumsRoles[this.channelOrForum.id].find((k) => {
            this.currentUserIsAdmin = k === EUserRoles.COMMUNITY_CHANNEL_ADMIN;
          });
        }
      }),
    );
  }

  // get members only not admins
  getMembers() {
    if (!this.isLoading) {
      this.isLoading = true;

      this.subscriptions.push(
        this.communityChannelsService
          .channelForumMembersIndex(this.channelOrForum.id, this.query, this.pageInfo?.end_cursor)
          .subscribe((data) => {
            this.channelMembers = this.channelMembers.concat(
              data.page.reduce((acc, value) => [...acc, value.data], []),
            );
            this.pageInfo = data.page_info;
            this.totalMembers = data.total;
            this.isLoading = false;
          }),
      );
    }
  }

  // get admin of channels not members
  getAdmins() {
    this.subscriptions.push(
      this.communityChannelsService.getChannelAdmins(this.channelOrForum.id, this.query).subscribe((data) => {
        this.admins = this.admins.concat(data.user_roles_users);
        this.totalOrganizers = data.total;
      }),
    );
  }

  //make admin
  addAdmin(index: number, userRolesUserId: number) {
    const username = this.channelMembers[index].user.name;
    const alertMessage = `Are you sure you want to Add ${username} as admin of ${this.channelOrForum.name}?`;
    if (window.confirm(alertMessage)) {
      this.communityChannelsService.memberToggleAdmin(userRolesUserId).subscribe((data) => {
        this.channelMembers.splice(index, 1);
        this.admins.push(data);
      });
    }
  }

  // remove from admin
  removeAdmin(index: number, userRolesUserId: number) {
    const username = this.admins[index].user.name;
    const alertMessage = `Are you sure you want to Remove ${username} as admin of ${this.channelOrForum.name}?`;
    if (window.confirm(alertMessage)) {
      this.communityChannelsService.memberToggleAdmin(userRolesUserId).subscribe((data) => {
        this.admins.splice(index, 1);
        this.channelMembers.unshift(data);
      });
    }
  }

  leaveChannel(index) {
    if (window.confirm(`Are you sure you want to exit ${this.channelOrForum.name}?`)) {
      this.communityChannelsService.memberExitChannel(this.channelOrForum.id).subscribe((data) => {
        if (data) {
          this.allUsers.splice(index, 1);
          this.toastrService.successDialog('You have exited this channel');
          if (this.isBrowser) {
            window.location.reload();
          }
        }
      });
    }
  }

  removeFromChannel(index) {
    let userName = '';
    let isAdmin = false;
    let userRolesUserId = 0;

    if (this.channelMembers[index]) {
      userName = this.channelMembers[index].user.name;
      userRolesUserId = this.channelMembers[index].id;
    }
    if (this.admins[index]) {
      userName = this.admins[index].user.name;
      userRolesUserId = this.admins[index].id;
      isAdmin = true;
    }
    if (window.confirm(`Are you sure you want to remove ${userName} from ${this.channelOrForum.name}?`)) {
      this.communityChannelsService.removeMemberFromChannelForum(userRolesUserId).subscribe((data) => {
        if (data) {
          if (isAdmin) {
            this.admins.splice(index, 1);
          } else {
            this.channelMembers.splice(index, 1);
          }
          this.toastrService.successDialog('Removed');
          this.totalMembers = -1;
        }
      });
    }
  }

  close() {
    this.closeMembersList.emit();
  }
}
