import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { DiscussionsService } from 'apps/commudle-admin/src/app/services/discussions.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { IDiscussion } from 'apps/shared-models/discussion.model';
import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';
import { IEvent } from 'apps/shared-models/event.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { environment } from 'apps/commudle-admin/src/environments/environment';
import { DiscussionService } from '@commudle/shared-services';
import { NbMenuService } from '@commudle/theme';
import { map } from 'rxjs';
import { faEllipsisVertical, faCalendar, faClockFour, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { IUser } from '@commudle/shared-models';
import { EventDataFormEntityGroupsService } from 'apps/commudle-admin/src/app/services/event-data-form-entity-groups.service';
import { IEventDataFormEntityGroup } from 'apps/shared-models/event_data_form_enity_group.model';
import { ERegistationTypes } from 'apps/shared-models/enums/registration_types.enum';

@Component({
  selector: 'app-home-event',
  templateUrl: './home-event.component.html',
  styleUrls: ['./home-event.component.scss'],
  standalone: false,
})
export class HomeEventComponent implements OnInit, OnDestroy {
  moment = moment;
  momentTimezone = momentTimezone;
  EEventStatuses = EEventStatuses;

  community: ICommunity;
  event: IEvent;
  discussionChat: IDiscussion;

  hasUpdates = false;
  hasAgenda = false;
  hasSpeakers = false;
  hasCollaborationCommunities = false;
  hasVolunteers = false;
  hasOpenForms = false;
  hasInterestedMembers = false;
  hasSponsors = false;
  isBottomSheetOpen = false;

  environment = environment;

  managedCommunities: ICommunity[] = [];

  subscriptions = [];

  isOrganizer = false;
  isLoading = true;
  faEllipsisVertical = faEllipsisVertical;
  faCalendar = faCalendar;
  faClockFour = faClockFour;
  faGlobe = faGlobe;
  interestedUsers: IUser[];
  interestedUsersCount: number;
  formsData: IEventDataFormEntityGroup[] = [];
  attendeeForms: IEventDataFormEntityGroup[] = [];
  speakersData: IUser[] = [];
  isSpeakersLoaded = false;
  isInterestedMembersLoaded = false;
  isAttendeeFormsLoaded = false;
  private schemaRendered = false;

  items: [{ title: string }];
  @ViewChild('updatesSection', { static: false }) updatesSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('descriptionSection', { static: false }) descriptionSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('agendaSection', { static: false }) agendaSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('speakersSection', { static: false }) speakersSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('sponsorsSection', { static: false }) sponsorsSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('collaborationCommunitiesSection', { static: false })
  collaborationCommunitiesSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('commentsSection', { static: false }) commentsSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('volunteersSection', { static: false }) volunteersSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('eventFormSection', { static: false }) eventFormSectionRef: ElementRef<HTMLDivElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventsService: EventsService,
    private communitiesService: CommunitiesService,
    private seoService: SeoService,
    private discussionsService: DiscussionsService,
    private discussionService: DiscussionService,
    private menuService: NbMenuService,
    private eventService: EventsService,
    private eventDataFormEntityGroupsService: EventDataFormEntityGroupsService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.getEvent(params.event_id);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  scroll(element: ElementRef<HTMLDivElement>) {
    element.nativeElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
  }

  getEvent(eventId) {
    this.eventsService.pGetEvent(eventId).subscribe((event) => {
      this.event = event;
      this.isSpeakersLoaded = this.event.event_speakers_count === 0;
      this.fetchInterestedMembers();
      this.fetchOpenForms();
      this.isLoading = false;
      this.getCommunity(event.kommunity_id);
    });
  }

  fetchOpenForms() {
    this.eventDataFormEntityGroupsService.pGetPublicOpenDataForms(this.event.id).subscribe((data) => {
      if (data.event_data_form_entity_groups.length > 0) {
        this.formsData = data.event_data_form_entity_groups;
        this.attendeeForms = this.formsData.filter(
          (form) => form.registration_type.name === ERegistationTypes.ATTENDEE,
        );
        this.checkAndSetSchema();
        this.isAttendeeFormsLoaded = true;
      } else {
        this.isAttendeeFormsLoaded = true;
        this.checkAndSetSchema();
      }
    });
  }

  getCommunity(communityId) {
    this.communitiesService.getCommunityDetails(communityId).subscribe((community) => {
      this.community = community;
      this.isOrganizerCheck(this.community.slug);
      this.getDiscussionChat();

      this.seoService.setTags(
        `${this.event.name} | ${this.community.name}`,
        this.event.description.replace(/<[^>]*>/g, '').substring(0, 200),
        this.event.header_image_path ? this.event.header_image_path : this.community.logo_image_path.url,
      );
    });
  }

  fetchInterestedMembers() {
    this.eventService.pGetEventsInterestedMembers(this.event.id).subscribe((res) => {
      this.interestedUsers = res.users;
      this.interestedUsersCount = res.total_count;
      this.isInterestedMembersLoaded = true;
      this.checkAndSetSchema();
    });
  }

  onSpeakersData(speakers: IUser[]) {
    this.speakersData = speakers;
    if (this.speakersData.length === this.event.event_speakers_count) {
      this.isSpeakersLoaded = true;
      this.checkAndSetSchema();
    }
  }

  private getPerformersSchema() {
    if (this.speakersData.length > 0) {
      return this.speakersData.map((speaker) => ({
        '@type': 'Person',
        name: speaker.name,
        url: speaker.username ? `${environment.app_url}/users/${speaker.username}` : '',
        image: speaker.avatar,
        jobTitle: speaker.designation,
      }));
    }
    return undefined;
  }

  private getOffersSchema() {
    if (this.attendeeForms.length > 0) {
      return this.attendeeForms.map((form) => ({
        '@type': 'Offer',
        name: form.name,
        url: `${environment.app_url}/fill-form/${form.data_form_entity_id}`,
        price: form.is_paid && form.paid_ticket_setting ? form.paid_ticket_setting.price / 100 : 0,
        priceCurrency: form.is_paid && form.paid_ticket_setting ? form.paid_ticket_setting.currency : 'INR',
        availability: 'https://schema.org/InStock',
      }));
    }

    return {
      '@type': 'Offer',
      name: this.event.name,
      url: `${environment.app_url}/communities/${this.community.slug}/events/${this.event.slug}`,
      price: 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    };
  }

  private checkAndSetSchema() {
    if (this.schemaRendered) {
      return;
    }
    if (
      this.community &&
      this.isInterestedMembersLoaded &&
      this.isSpeakersLoaded &&
      this.event.start_time &&
      this.isAttendeeFormsLoaded
    ) {
      this.schemaRendered = true;
      this.setSchema();
    }
  }

  setSchema() {
    const performers = this.getPerformersSchema();

    const schemaObject: any = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: this.event.name,
      description: this.event.description.replace(/<[^>]*>/g, '').substring(0, 200),
      image: this.event.header_image_path ? this.event.header_image_path : this.community?.logo_image_path?.url,

      startDate: this.event.start_time,
      endDate: this.event.end_time,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',

      location: {
        '@type': 'VirtualLocation',
        url: `${environment.app_url}/communities/${this.community.slug}/events/${this.event.slug}`,
      },

      organizer: {
        '@type': 'Organization',
        name: this.community.name,
        url: `${environment.app_url}/communities/${this.community.slug}`,
      },

      offers: this.getOffersSchema(),

      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/JoinAction',
        userInteractionCount: this.interestedUsersCount || 0,
      },
    };

    // Only add performer if it exists (clean conditional property)
    if (performers && performers.length > 0) {
      schemaObject.performer = performers;
    }

    this.seoService.setSchema(schemaObject);
  }

  isOrganizerCheck(community) {
    this.subscriptions.push(
      this.communitiesService.userManagedCommunities$.subscribe((data: ICommunity[]) => {
        if (data.find((cSlug) => cSlug.slug === community) !== undefined) {
          this.isOrganizer = true;
        }
      }),
    );
  }

  getDiscussionChat() {
    this.discussionsService.pGetOrCreateForEventChat(this.event.id).subscribe((data) => {
      this.discussionChat = data;
      if (this.isOrganizer) {
        this.setContextMenu();
      }
    });
  }

  setContextMenu() {
    this.updateContextMenu();
    this.handleContextMenuItemClick();
  }

  handleContextMenuItemClick() {
    this.subscriptions.push(
      this.menuService
        .onItemClick()
        .pipe(map(({ item }) => item.title))
        .subscribe((menuItemTitle) => {
          if (menuItemTitle === 'Turn OFF Comments' || menuItemTitle === 'Turn ON Comments') {
            this.toggleDiscussionOpen();
          }
        }),
    );
  }

  toggleDiscussionOpen() {
    this.discussionService.toggleDiscussionOpen(this.discussionChat.id).subscribe((value: boolean) => {
      this.discussionChat.open = value;
      this.updateContextMenu();
    });
  }

  updateContextMenu() {
    this.items = [{ title: this.discussionChat.open ? 'Turn OFF Comments' : 'Turn ON Comments' }];
  }

  openBottomSheet() {
    this.isBottomSheetOpen = true;
  }

  closeBottomSheet() {
    this.isBottomSheetOpen = false;
  }
}
