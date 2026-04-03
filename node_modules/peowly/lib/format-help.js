import { defaultFlags } from './flags.js';
import {
  getHelpListMaxNamePadding,
  formatGroupedFlagList,
  formatGroupedHelpList,
} from './format-lists.js';

/**
 * @param {string} name
 * @param {Readonly<import('./help-list-types.js').HelpMessageInfo>} info
 * @returns {string}
 */
export function formatHelpMessage (name, info = {}) {
  const {
    aliases = {},
    commands = {},
    examples = [],
    flags = {},
    indent = 2,
    noDefaultFlags = false,
    usage = '',
  } = info;

  const aliasesWithGroups = Object.fromEntries(
    Object.entries(aliases).map(
      ([key, { listGroup, ...value }]) => [key, {
        listGroup: (listGroup ? listGroup + ' ' : '') + 'Aliases',
        ...value,
      }]
    )
  );

  const commandList = { ...aliasesWithGroups, ...commands };
  const flagList = { ...flags, ...(noDefaultFlags ? {} : defaultFlags) };

  const padName = Math.max(
    getHelpListMaxNamePadding(commandList),
    getHelpListMaxNamePadding(flagList, { keyPrefix: '--' })
  );

  /** @type {import('./format-lists.js').HelpListGroupOptions} */
  const listOptions = { fixedPadName: true, padName };

  return (
    ''.padEnd(indent) + 'Usage\n' +
    ''.padEnd(indent + 2) + `$ ${name} ${usage}\n` +
    formatGroupedHelpList(commandList, indent, { defaultGroupName: 'Commands', defaultGroupOrderFirst: true, ...listOptions }) +
    formatGroupedFlagList(flagList, indent, listOptions) +
    (
      examples.length
        ? '\n' + ''.padEnd(indent) + ['Examples', ...formatExamples(name, examples)].join('\n' + ''.padEnd(indent + 2))
        : ''
    )
  );
}

/**
 * @param {string} name
 * @param {NonNullable<import('./help-list-types.js').HelpMessageInfo["examples"]>} examples
 * @returns {string[]}
 */
function formatExamples (name, examples) {
  /** @type {string[]} */
  const result = [];

  for (const item of examples) {
    if (typeof item === 'string') {
      result.push(`$ ${name} ${item}`);
    } else {
      result.push(`$ ${item.prefix ? item.prefix + ' ' : ''}${name} ${item.suffix || ''}`);
    }
  }

  return result;
}
