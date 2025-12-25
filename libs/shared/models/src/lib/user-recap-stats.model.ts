import { IAttachedFile } from './attached-file.model';

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
  volunteered_events: number;
  social_resources: number;
  hackathon_judges: number;
  name: string;
  photo: IAttachedFile;
  is_community_leader: boolean;
  username: string;
}
interface IEventsAttended {
  name: string;
}
