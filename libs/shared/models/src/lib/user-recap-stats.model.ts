import { IUser } from './user.model';

export interface IUserRecapStats {
  attended_events: number;
  attended_hackathons: number;
  builds: number;
  days_on_commudle: number;
  expert_badges: [];
  joined_communities: number;
  labs: number;
  people_met_at_events: number;
  profile_visits: number;
  registered_events: number;
  registered_hackathons: number;
  speaker_events: number;
  total_community_events_organized: number;
  total_community_hackathons_organized: number;
  total_followers: number;
  total_members_gained: number;
  total_network: number;
  user: IUser;
  volunteered_events: number;
  links: number;
  hackathons_mentored: number;
}

// user: IUser;
// created_at: string;
// total_page_visits: number;
// total_events_attended: number;
// events_attended: IEventsAttended[];
// total_speaker_events: number;
// total_builds_published: number;
// total_labs_published: number;
// total_communities_joined: number;
// total_followers_gained: number;
// total_followed_users: number;
// total_votes: number;
// total_content_posted: number;
// total_talks_delivered: number;
// total_hackathons_mentored: number;
// total_events_voluntered: number;

interface IEventsAttended {
  name: string;
}
