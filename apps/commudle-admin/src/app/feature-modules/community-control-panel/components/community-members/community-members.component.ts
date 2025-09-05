import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NbDialogService, NbMenuService, NbToastrService } from '@commudle/theme';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Subject, takeUntil, Subscription, distinctUntilChanged } from 'rxjs';
import { EDomain, EExperienceLevel, ICommunity, IUser, IUserRolesUser } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { faEnvelope, faSort } from '@fortawesome/free-solid-svg-icons';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';

@Component({
  selector: 'commudle-community-members',
  templateUrl: './community-members.component.html',
  styleUrls: ['./community-members.component.scss'],
})
export class CommunityMembersComponent implements OnInit, OnDestroy {
  page = 1;
  count = 10;
  total = 0;
  userRolesUsers;
  query = '';
  isLoading = false;
  EUserRoles = EUserRoles;
  speaker = false;
  contributor = false;
  mostActive = false;
  employer = false;
  contentCreator = false;
  employee = false;
  faEnvelope = faEnvelope;
  faSort = faSort;
  EExperienceLevel = EExperienceLevel;
  EDomain = EDomain;
  queryParamsString = '';

  contextMenuItems = [
    {
      title: 'Remove',
    },
    {
      title: 'Remove & Block',
    },
  ];
  activeContextMenuUser: IUser;

  searchForm;
  communityFilterForm;

  selectedUserRoles: IUserRolesUser[] = [];
  removeUserForm;

  subscriptions: Subscription[] = [];
  community: ICommunity;
  loadingData = false;

  options = ['active', 'contributor', 'content_creator', 'speaker'];

  private destroy$ = new Subject<void>();

  @ViewChild('removeUserDialog', { static: true }) removeUserDialog: TemplateRef<unknown>;
  @ViewChild('blockUserDialog', { static: true }) blockUserDialog: TemplateRef<unknown>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userRolesUsersService: UserRolesUsersService,
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private menuService: NbMenuService,
    private seoService: SeoService,
    private communityService: CommunitiesService,
    private location: Location,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
    this.removeUserForm = this.fb.group({
      user_roles_user_ids: this.fb.array([]),
    });

    this.communityFilterForm = this.fb.group({
      experience_level: [[]],
      employment_status: [null],
      skills: [[]],
      gender: [null],
      domains: [[]],
    });
  }

  get userRolesUserIds(): FormArray {
    return this.removeUserForm.get('user_roles_user_ids') as FormArray;
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    const params = this.activatedRoute.snapshot.queryParams;
    if (Object.keys(params).length > 0) {
      if (params.skills) {
        let skillsArray: string[];
        if (typeof params.skills === 'string' && params.skills.includes(',')) {
          skillsArray = params.skills.split(',');
        } else {
          skillsArray = [params.skills];
        }
        this.communityFilterForm.get('skills').setValue(skillsArray);
      }
      if (params.experience_level) {
        let experienceArray: string[];
        if (typeof params.experience_level === 'string' && params.experience_level.includes(',')) {
          experienceArray = params.experience_level.split(',');
        } else {
          experienceArray = [params.experience_level];
        }
        this.communityFilterForm.get('experience_level').setValue(experienceArray);
      }
      if (params.employer === 'true') {
        this.communityFilterForm.get('employment_status').setValue('employer');
        this.employer = true;
        this.employee = false;
      } else if (params.employee === 'true') {
        this.communityFilterForm.get('employment_status').setValue('employee');
        this.employer = false;
        this.employee = true;
      }
      if (params.gender) {
        this.communityFilterForm.get('gender').setValue(params.gender);
      }
      if (params.domains) {
        let domainsArray: string[];
        if (typeof params.domains === 'string' && params.domains.includes(',')) {
          domainsArray = params.domains.split(',');
        } else {
          domainsArray = [params.domains];
        }
        this.communityFilterForm.get('domains').setValue(domainsArray);
      }
      if (params.most_active === 'true') {
        this.mostActive = true;
      }
      if (params.contributor === 'true') {
        this.contributor = true;
      }
      if (params.content_creator === 'true') {
        this.contentCreator = true;
      }
      if (params.speaker === 'true') {
        this.speaker = true;
      }
      if (params.query) {
        this.query = params.query;
        this.searchForm.get('name').setValue(this.query);
      }
      this.page = 1;
      this.userRolesUsers = [];
      this.total = 0;
    }

    this.subscriptions.push(
      this.activatedRoute.parent.parent.data.subscribe((value) => {
        if (value.community) {
          this.community = value.community;
          console.log(this.community);
          this.setMeta();
        }
      }),
    );
    this.getMembers();
    this.search();
    this.handleContextMenu();
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
    // destroy$ used in the search method
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Community Members | Dashboard | ${this.community.name}`);
  }

  onTagAdd(value: string) {
    const currentSkills = this.communityFilterForm.get('skills').value || [];
    if (!currentSkills.includes(value)) {
      this.communityFilterForm.get('skills').setValue([...currentSkills, value]);
      this.generateParams();
    }
  }

  onTagDelete(value: string) {
    const currentSkills = this.communityFilterForm.get('skills').value || [];
    const updatedSkills = currentSkills.filter((tag: string) => tag !== value);
    this.communityFilterForm.get('skills').setValue(updatedSkills);
    this.generateParams();
  }

  getMembers() {
    this.isLoading = true;
    const skills = this.communityFilterForm.get('skills').value || [];
    const experienceLevel = this.communityFilterForm.get('experience_level').value || [];
    const domains = this.communityFilterForm.get('domains').value || [];
    const gender = this.communityFilterForm.get('gender').value;
    this.userRolesUsersService
      .getCommunityMembers(
        this.query,
        this.community.id,
        this.count,
        this.page,
        skills,
        experienceLevel,
        this.employer,
        this.employee,
        gender,
        domains,
        this.mostActive,
        this.contributor,
        this.contentCreator,
        this.speaker,
      )
      .subscribe((data) => {
        this.isLoading = false;
        this.userRolesUsers = data.user_roles_users;
        console.log(this.userRolesUsers);
        this.page = +data.page;
        this.total = data.total;
      });
  }

  originalOrder = (): number => {
    return 0;
  };

  // search() {
  //   this.searchForm.valueChanges
  //     .pipe(
  //       debounceTime(800),
  //       takeUntil(this.destroy$),
  //       switchMap(() => {
  //         this.page = 1;
  //         this.isLoading = true;
  //         this.query = this.searchForm.get('name').value;
  //         return this.userRolesUsersService.getCommunityMembers(
  //           this.query,
  //           this.community.id,
  //           this.count,
  //           this.page,
  //           this.employer,
  //           this.employee,
  //           this.contentCreator,
  //           this.speaker,
  //         );
  //       }),
  //     )
  //     .subscribe((data) => {
  //       this.isLoading = false;
  //       this.userRolesUsers = data.user_roles_users;
  //       this.page = +data.page;
  //       this.total = data.total;
  //     });
  // }

  search() {
    this.query = '';
    this.searchForm.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.loadingData) {
          return;
        }
        this.userRolesUsers = [];
        this.page = 1;
        this.total = 0;
        this.loadingData = true;
        this.query = this.searchForm.get('name').value;
        this.queryParamsString = this.query;
        this.generateParams();
      });
  }

  getPageData(page) {
    this.page = page;
    this.getMembers();
  }

  openDialog(template: TemplateRef<unknown>, user: IUser) {
    this.dialogService.open(template, { context: { user } });
  }

  handleContextMenu(): void {
    this.menuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'community-member-context-menu'),
        map(({ item: title }) => title),
      )
      .subscribe((menuItem) => {
        switch (menuItem.title) {
          case 'Remove':
            this.getUserRoles(this.activeContextMenuUser.id, this.community.id);
            this.openDialog(this.removeUserDialog, this.activeContextMenuUser);
            break;
          case 'Remove & Block':
            this.openDialog(this.blockUserDialog, this.activeContextMenuUser);
            break;
        }
      });
  }

  removeUser() {
    this.userRolesUsersService.removeUser(this.removeUserForm.value, this.community.id).subscribe(() => {
      this.toastrService.success('User removed from community', 'Success');
      this.getMembers();
    });
  }

  getUserRoles(userId, communityId) {
    this.userRolesUsersService.getRoles(userId, communityId).subscribe((value) => {
      this.selectedUserRoles = value.user_roles_users;
      this.selectedUserRoles.forEach((userRole) => {
        this.userRolesUserIds.push(this.fb.control(userRole.id));
      });
    });
  }

  toggleUserRole(userRoleId) {
    const index = this.userRolesUserIds.controls.findIndex((control) => control.value === userRoleId);
    if (index !== -1) {
      this.userRolesUserIds.removeAt(index);
    } else {
      this.userRolesUserIds.push(this.fb.control(userRoleId));
    }
  }

  blockUser(userId) {
    this.userRolesUsersService.blockUser(userId, this.community.id).subscribe(() => {
      this.toastrService.success('User blocked from community', 'Success');
      this.getMembers();
    });
  }

  filterByTags(event) {
    if (event === 'active') {
      this.mostActive = !this.mostActive;
    }
    if (event === 'contributor') {
      this.contributor = !this.contributor;
    }
    if (event === 'content_creator') {
      this.contentCreator = !this.contentCreator;
    }
    if (event === 'speaker') {
      this.speaker = !this.speaker;
    }
    console.log(this.mostActive, this.contributor, this.contentCreator, this.speaker);
    this.generateParams();
  }

  onFilterChange() {
    const filterValues = this.communityFilterForm.value;

    if (filterValues.employment_status === 'employer') {
      this.employer = true;
      this.employee = false;
    } else if (filterValues.employment_status === 'employee') {
      this.employer = false;
      this.employee = true;
    } else {
      this.employer = false;
      this.employee = false;
    }

    this.generateParams();
  }

  generateParams() {
    const queryParams: { [key: string]: string | string[] | boolean } = {};
    const skills = this.communityFilterForm.get('skills').value || [];
    const experienceLevel = this.communityFilterForm.get('experience_level').value || [];
    const gender = this.communityFilterForm.get('gender').value;
    const domains = this.communityFilterForm.get('domains').value || [];

    if (this.query) {
      queryParams.query = this.query;
    }
    if (skills && skills.length > 0) {
      queryParams.skills = skills.join(',');
    }
    if (experienceLevel && experienceLevel.length > 0) {
      queryParams.experience_level = experienceLevel.join(',');
    }
    if (this.employer) {
      queryParams.employer = true;
    }
    if (this.employee) {
      queryParams.employee = true;
    }
    if (gender) {
      queryParams.gender = gender;
    }
    if (domains && domains.length > 0) {
      queryParams.domains = domains.join(',');
    }
    if (this.mostActive) {
      queryParams.most_active = true;
    }
    if (this.contributor) {
      queryParams.contributor = true;
    }
    if (this.contentCreator) {
      queryParams.content_creator = true;
    }
    if (this.speaker) {
      queryParams.speaker = true;
    }

    const urlSearchParams = new URLSearchParams(queryParams as Record<string, string>);
    const queryParamsString = urlSearchParams.toString();
    this.location.replaceState(location.pathname, queryParamsString);

    this.page = 1;
    this.getMembers();
  }

  sortBy() {
    console.log('sorting');
  }

  clearAllFilters() {
    this.communityFilterForm.reset();
    this.searchForm.get('name').setValue('');
    this.mostActive = false;
    this.contributor = false;
    this.contentCreator = false;
    this.speaker = false;
    this.employer = false;
    this.employee = false;
    this.page = 1;
    this.userRolesUsers = [];
    this.total = 0;
    this.getMembers();
    this.location.replaceState(location.pathname, '');
  }
}
