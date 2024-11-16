import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { IUser } from 'apps/shared-models/user.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IEvent } from 'apps/shared-models/event.model';
import { AuthService, CommunityChannelManagerService, CommunityChannelsService } from '@commudle/shared-services';
import { EDbModels, ICommunityChannel } from '@commudle/shared-models';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'apps/commudle-admin/src/environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  community: ICommunity = null;
  EUserRoles = EUserRoles;
  organizers: IUser[] = [];
  events: IEvent[] = [];
  upcomingEvents: IEvent[] = [];
  isLoadingEvents = false;
  isLoading = false;
  defaultChannel: ICommunityChannel;
  currentUser: IUser;
  eventForSchema = [];

  icons = {
    faUsers,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private userRolesUsersService: UserRolesUsersService,
    private seoService: SeoService,
    private eventsService: EventsService,
    private communityChannelsService: CommunityChannelsService,
    private communityChannelManagerService: CommunityChannelManagerService,
    private authWatchService: AuthService,
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe((data) => {
      this.community = data.community;
      if (this.community.upcoming_events_count > 0) {
        this.getEvents();
      }
      this.seoService.setTitle(this.community.name);
    });
    this.setCurrentUser();
  }

  setCurrentUser() {
    this.authWatchService.currentUser$.subscribe((data) => {
      this.currentUser = data;
      this.getDefaultChannel();
      this.getOrganizers([EUserRoles.ORGANIZER, EUserRoles.EVENT_VOLUNTEER]);
      if (data) {
        this.communityChannelManagerService.setCurrentUser(data);
      }
    });
  }

  getOrganizers(roles: EUserRoles[]) {
    this.isLoading = true;
    this.organizers = [];
    roles.forEach((role) => {
      this.userRolesUsersService.pGetCommunityLeadersByRole(this.community.id, role).subscribe((data) => {
        this.organizers = this.organizers.concat(data.users);
        this.isLoading = false;
      });
    });
  }

  getEvents() {
    this.isLoadingEvents = true;
    this.eventsService.pGetCommunityEvents('future', this.community.id).subscribe((data) => {
      this.upcomingEvents = data.values;
      this.isLoadingEvents = false;
      this.setSchema();
    });
  }

  getDefaultChannel() {
    this.communityChannelsService
      .getDefaultChannel(this.community.id, EDbModels.KOMMUNITY)
      .subscribe((data: ICommunityChannel) => {
        if (this.currentUser) this.communityChannelManagerService.getChannelRoles(data);
        this.defaultChannel = data;
      });
  }

  setSchema() {
    for (const event of this.upcomingEvents) {
      let location: object, eventStatus: string;
      if (event.event_locations && Object.keys(event.event_locations).length > 0) {
        location = {
          '@type': 'Place',
          name: event.event_locations[0].name,
          address: event.event_locations[0].address,
        };
        eventStatus = 'OfflineEventAttendanceMode';
      } else {
        location = {
          '@type': 'VirtualLocation',
          url: environment.app_url + '/communities/' + event.kommunity_slug + '/events/' + event.slug,
        };
        eventStatus = 'OnlineEventAttendanceMode';
      }
      this.eventForSchema.push({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description.replace(/<[^>]*>/g, '').substring(0, 200),
        image: event.header_image_path ? event.header_image_path : event.kommunity.logo_image_path.url,
        startDate: event.start_time,
        endDate: event.end_time,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/' + eventStatus,
        location: location,
        organizer: {
          '@type': 'Organization',
          name: event.kommunity.name,
          url: environment.app_url + '/communities/' + event.kommunity_slug,
        },
        offers: {
          '@type': 'Offer',
          name: event.name,
          url: environment.app_url + '/communities/' + event.kommunity_slug + '/events/' + event.slug,
        },
      });
    }

    this.seoService.setSchema(this.eventForSchema);
  }
}
