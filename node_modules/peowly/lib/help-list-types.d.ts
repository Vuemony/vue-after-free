import type { AnyFlag } from './flag-types.d.ts';

export interface HelpListBasicItem {
  listGroup?: string;
  description: string;
}
export type HelpListBasic = Record<string, HelpListBasicItem>;

export type HelpListItem = AnyFlag | HelpListBasicItem;
export type HelpList = Record<string, HelpListItem | string>;

export interface PeowlyHelpMessageMeta {
  examples?: (string | { prefix?: string, suffix?: string })[] | undefined;
  indent?: number | undefined;
  usage?: string | undefined;
}

export interface HelpMessageInfo extends PeowlyHelpMessageMeta {
  aliases?: HelpListBasic;
  commands?: HelpListBasic;
  flags?: HelpList;
  noDefaultFlags?: boolean;
}
