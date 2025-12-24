import { IUser } from './user.model';

export interface IUserRecapStats {
  user: IUser;
  created_at: string;
  total_page_visits: number;
  total_events_attended: number;
  events_attended: IEventsAttended[];
  total_speaker_events: number;
  total_builds_published: number;
  total_labs_published: number;
  total_communities_joined: number;
  total_followers_gained: number;
  total_followed_users: number;
  total_votes: number;
  total_content_posted: number;
  total_talks_delivered: number;
  total_hackathons_mentored: number;
  total_events_voluntered: number;
}

interface IEventsAttended {
  name: string;
}
