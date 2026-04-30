import { SectionType } from './section.registry';

export interface SectionConfig<T = any> {
  type: SectionType;
  config: T;
}
