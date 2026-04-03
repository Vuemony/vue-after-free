import { groupBy } from './utils.js';

/**
 * @typedef HelpListOptions
 * @property {boolean} [fixedPadName] When set to true, padName will be treated as a fixed rather than minimum padding
 * @property {string} [keyPrefix] A prefix for the name, eg. "--"
 * @property {number} [padName] The minimum padding between names and descriptions
 * @property {string} [shortFlagPrefix] A prefix for the shortFlag, defaults to "-"
 */

/**
 * @param {string} name
 * @param {string|import('./help-list-types.d.ts').HelpListItem|undefined} item
 * @param {Readonly<Pick<HelpListOptions, 'keyPrefix'|'padName'|'shortFlagPrefix'>>} options
 * @returns {string}
 */
function formatHelpListName (name, item, options = {}) {
  if (!item) {
    return '';
  }

  const {
    keyPrefix = '',
    padName = 0,
    shortFlagPrefix = '-',
  } = options;

  const richItem = typeof item === 'string' ? { description: item } : item;

  let formattedShortFlag = '';

  if ('type' in richItem) {
    if (richItem.type === 'string' && richItem.default) {
      name = richItem.multiple
        ? `${name} [${richItem.default.join(', ')}]`
        : `${name} [${richItem.default}]`;
    }

    if (richItem.short) {
      formattedShortFlag = `  ${shortFlagPrefix}${richItem.short}`;
    }
  }

  return (keyPrefix + name).padEnd(padName - formattedShortFlag.length) + formattedShortFlag;
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {Readonly<Pick<HelpListOptions, 'keyPrefix'>>} options
 * @returns {number}
 */
export function getHelpListMaxNamePadding (list, options = {}) {
  let longestLength = 0;

  for (const name in list) {
    const item = list[name];
    const itemName = formatHelpListName(name, item, options);

    if (longestLength < itemName.length) {
      longestLength = itemName.length;
    }
  }

  return longestLength;
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListOptions} options
 * @returns {string}
 */
export function formatHelpList (list, indent, options = {}) {
  const {
    fixedPadName = false,
    padName = 0,
  } = options;

  const names = Object.keys(list).sort();

  const calculatedPadName = fixedPadName
    ? padName
    : Math.max(padName, getHelpListMaxNamePadding(list, options));

  let result = '';

  for (const name of names) {
    const item = list[name];

    result += ''.padEnd(indent) +
      formatHelpListName(name, item, { ...options, padName: calculatedPadName }) + '  ' +
      (typeof item === 'object' ? item.description : item) + '\n';
  }

  return result.trim();
}

/**
 * @typedef HelpListGroupOptionsExtras
 * @property {boolean} [alignWithinGroups]
 * @property {string} [defaultGroupName]
 * @property {boolean} [defaultGroupOrderFirst]
 */

/** @typedef {Readonly<HelpListOptions & HelpListGroupOptionsExtras>} HelpListGroupOptions */

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListGroupOptions} options
 * @returns {string}
 */
export function formatGroupedHelpList (list, indent, options = {}) {
  const {
    alignWithinGroups = false,
    defaultGroupName = 'Default',
    defaultGroupOrderFirst = false,

    fixedPadName = false,
    padName = 0,

    ...incomingListOptions
  } = options;

  const calculatedPadName = (alignWithinGroups || fixedPadName)
    ? undefined
    : Math.max(padName, getHelpListMaxNamePadding(list, options));

  const defaultGroupSymbol = Symbol('Default group');

  const {
    [defaultGroupSymbol]: defaultGroup,
    ...groups
  } = groupBy(
    Object.entries(list),
    ([, item]) => (typeof item === 'object' && item.listGroup) || defaultGroupSymbol
  );

  const sortedGroupNames = Object.keys(groups).sort();
  const groupNames = defaultGroup
    ? (
        defaultGroupOrderFirst
          ? /** @type {const} */ ([defaultGroupSymbol, ...sortedGroupNames])
          : /** @type {const} */ ([...sortedGroupNames, defaultGroupSymbol])
      )
    : sortedGroupNames;

  /** @type {HelpListOptions} */
  const listOptions = {
    ...incomingListOptions,
    fixedPadName: calculatedPadName === undefined ? fixedPadName : true, // Avoids redoing calculation
    padName: calculatedPadName || padName,
  };
  const flagIndent = indent + 2;

  let result = '';

  for (const groupKey of groupNames) {
    const groupItem = groupKey === defaultGroupSymbol ? defaultGroup : groups[groupKey];
    const groupList = Object.fromEntries(groupItem || []);
    const groupName = groupKey === defaultGroupSymbol ? defaultGroupName : groupKey;

    result += '\n' + ''.padEnd(indent) + groupName + '\n';
    result += ''.padEnd(flagIndent) + formatHelpList(groupList, flagIndent, listOptions) + '\n';
  }

  return result;
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {Readonly<HelpListOptions>} options
 * @returns {string}
 */
export function formatFlagList (list, indent, options = {}) {
  return formatHelpList(list, indent, { keyPrefix: '--', ...options });
}

/**
 * @param {import('./help-list-types.d.ts').HelpList} list
 * @param {number} indent
 * @param {HelpListGroupOptions} options
 * @returns {string}
 */
export function formatGroupedFlagList (list, indent, options = {}) {
  return formatGroupedHelpList(list, indent, { defaultGroupName: 'Options', keyPrefix: '--', ...options });
}
