/** @type {Record<'help' | 'version', import('./flag-types.d.ts').BooleanFlag>} */
export const defaultFlags = {
  help: {
    'default': false,
    description: 'Prints this help and exits.',
    type: 'boolean',
  },
  version: {
    'default': false,
    description: 'Prints current version and exits.',
    type: 'boolean',
  },
};
