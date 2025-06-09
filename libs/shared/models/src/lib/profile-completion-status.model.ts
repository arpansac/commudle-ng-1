export interface IProfileCompletionStatus {
  completion_percentage: number;
  missing_fields: string[];
  weights: Weights;
}

export interface Weights {
  goals: number;
  skills: number;
  experience_level: number;
  avatar: number;
  name: number;
  designation: number;
  location: number;
  about_me: number;
  gender: number;
  username: number;
  user_domain: number;
}
