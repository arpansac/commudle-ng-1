import { SanityImageObject } from '@sanity/image-url/lib/types/types';

export interface IWhatsNew {
  title: string;
  date: string;
  content: any;
  image?: SanityImageObject;
  images?: SanityImageObject[];
}
