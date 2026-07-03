export interface IUserStat {
  events_attended_count: number;
  profile_views: {
    overall: {
      ninety_days: number;
    };
  };
  published_community_builds_count: number;
  published_labs_count: number;
  social_resources_count: number;
  speaker_events_count: number;
  speaker_sessions_count: number;
  community_leader_count: number;
  community_member_count: number;
  hackathon_participant_count: number;
  hackathon_won_count: number;
  hackathon_judge_count: number;
  hackathon_mentor_count: number;
  event_volunteer_count: number;
}
