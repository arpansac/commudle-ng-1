import { environment } from '@commudle/shared-environments';

const env = environment;

export const staticIcons = {
  hackathons: {
    primary: env.base_url + '/icons/hackathon-icon-primary.svg',
    cadetGrey: env.base_url + '/icons/hackathon-icon-cadet-grey.svg',
    gray: env.base_url + '/icons/hackathon-icon-gray.svg',
    info: env.base_url + '/icons/hackathon-icon-info.svg',
    white: env.base_url + '/icons/hackathon-icon-white.svg',
  },

  banner: env.base_url + '/icons/add-banner-icon.svg',

  darkModeSun: env.base_url + '/icons/dark-mode-sun-icon.svg',
};
