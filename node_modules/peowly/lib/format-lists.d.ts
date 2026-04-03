export function getHelpListMaxNamePadding(list: import("./help-list-types.d.ts").HelpList, options?: Readonly<Pick<HelpListOptions, "keyPrefix">>): number;
export function formatHelpList(list: import("./help-list-types.d.ts").HelpList, indent: number, options?: HelpListOptions): string;
export function formatGroupedHelpList(list: import("./help-list-types.d.ts").HelpList, indent: number, options?: HelpListGroupOptions): string;
export function formatFlagList(list: import("./help-list-types.d.ts").HelpList, indent: number, options?: Readonly<HelpListOptions>): string;
export function formatGroupedFlagList(list: import("./help-list-types.d.ts").HelpList, indent: number, options?: HelpListGroupOptions): string;
export type HelpListOptions = {
    fixedPadName?: boolean;
    keyPrefix?: string;
    padName?: number;
    shortFlagPrefix?: string;
};
export type HelpListGroupOptionsExtras = {
    alignWithinGroups?: boolean;
    defaultGroupName?: string;
    defaultGroupOrderFirst?: boolean;
};
export type HelpListGroupOptions = Readonly<HelpListOptions & HelpListGroupOptionsExtras>;
//# sourceMappingURL=format-lists.d.ts.map