<div align="center">
  <img
    src="peowly.svg"
    width="512"
    height="auto"
    alt="peowly"
  />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/peowly.svg?style=flat)](https://www.npmjs.com/package/peowly)
[![npm downloads](https://img.shields.io/npm/dm/peowly.svg?style=flat)](https://www.npmjs.com/package/peowly)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

</div>

[`meow`](https://github.com/sindresorhus/meow) inspired [`parseArgs()`](https://nodejs.org/api/util.html#utilparseargsconfig) based CLI parser. Also contains help text helpers

## Usage

### Simple

```javascript
const { flags } = peowly({
  options: {
    fix: {
      description: 'Fixes stuff',
      type: 'boolean',
    },
  },
});
```

### Example

See [`example/basic.js`](./example/basic.js)

## API

### peowly()

```ts
peowly(options): { flags, input, remainderArgs, showHelp }
```

#### Parser Options

These options control how command-line arguments are parsed and define the CLI flags/options your tool accepts:

* `args` - _string[]_ - same as for [`parseArgs()`](https://nodejs.org/api/util.html#utilparseargsconfig) (defaults to `process.argv` with `execPath` and `filename` removed)
* `options` - _`Flags`_ - superset of that of [`parseArgs()`](https://nodejs.org/api/util.html#utilparseargsconfig). Every option / flag is expected to have a `description` string property in addition to what `parseArgs()` require and they may have a `listGroup` string property as well
* `returnRemainderArgs` - _boolean_ - if set, then all parts of `args` that doesn't match a flag in `options` will be returned as `remainderArgs`, which can eg. be forwarded to another parser

#### Meta Options

These options configure help text, process metadata, and other CLI tool presentation:

* `description` - _string_ | _false_ - a description that will be prefixed to the help text (defaults to `pkg.description`, deactivated by `false`)
* `examples` - see [`HelpMessageInfo`](#helpmessageinfo)
* `help` - _string_ - the help text to show on `--help`, preferably generated with `formatHelpMessage()` (defaults to being rendered with `formatHelpMessage()` using available data)
* `indent` - see [`HelpMessageInfo`](#helpmessageinfo)
* `name` - _string_ - the name of the CLI command. Used by a couple of other defaults. (defaults to the first key in `pkg.bin` and else to `pkg.name`)
* `pkg` - _`PackageJsonLike`_ - a `package.json` which some meta data can be derived from
* `processTitle` - _string_ | _false_ - sets the `process.title` to this (defaults to `name`, deactivated by `false`)
* `usage` - see [`HelpMessageInfo`](#helpmessageinfo)
* `version` - _string_ - the version to show on `--version` (defaults to `pkg.version`)

### formatHelpMessage()

```ts
formatHelpMessage(name: string, info?: HelpMessageInfo): string
```

#### Arguments

* `name` - _string_ - the name of the CLI command

#### HelpMessageInfo

* `aliases` - _`HelpListBasic`_ - list of help items to join with `commands` but with group name defaulting to `'Aliases'` and other group names being prefixed with `' Aliases'`
* `commands` - _`HelpListBasic`_ - list of help items to add prior to the flags list and with a default group name of `'Commands'`
* `examples` - _`(string | { prefix?: string, suffix?: string })[]`_ - will be added as examples on individual lines prefixed with `$ ${name}` or, if provided as prefix and suffix, then the prefix will go inbetween `$ ` and the `name` and the suffix after that, separated by spaces
* `flags` - _`HelpList`_ - the flags to output in the help, compatible with _`Flags`_
* `indent` - _number_ - the number of spaces to indent the help text with (defaults to `2`)
* `noDefaultFlags` - _boolean_ - excludes the default flags from the help text
* `usage` - _string_ - what, if anything, that follows the `$ ${name}` in `'Usage'` headline in the initial help text

#### Types

```ts
import type { AnyFlag } from 'peowly';

interface HelpListBasicItem {
  listGroup?: string;
  description: string;
}

type HelpListItem = AnyFlag | HelpListBasicItem;

type HelpListBasic = Record<string, HelpListBasicItem>;

type HelpList = Record<string, HelpListItem | string>;
```

### defaultFlags

Contains the definition of the two default flags `--help` and `--version`.

### formatHelpList()

Most of the time you should use [`formatHelpMessage()`](#formathelpmessage) instead.

```ts
function formatHelpList(list: HelpList, indent: number, options?: HelpListOptions): string
```

#### Arguments

* `list` - _HelpList_ - the list that represents the flags, see types in [`formatHelpMessage()`](#formathelpmessage)
* `indent` - _number_ - how far to indent the list

#### HelpListOptions

* `fixedPadName` - _boolean_ - when set, `padName` will be treated as a fixed rather than minimum padding
* `keyPrefix` - _string_ - a prefix for the name
* `padName` - _number_ - the minimum padding between names and descriptions
* `shortFlagPrefix` - _string_ - a prefix for a `shortFlag` (defaults to `'-'`)

### formatFlagList()

```ts
function formatFlagList(list: HelpList, indent: number, options?: HelpListOptions): string
```

Same as [`formatHelpList()`](#formathelplist) but with the [`keyPrefix`](#helplistoptions) option defaulting to `'--'`.

### formatGroupedHelpList()

```ts
formatGroupedHelpList(list: HelpList, indent: number, options?: HelpListGroupOptions): string
```

Similar to [`formatHelpList()`](#formathelplist) but prints help items grouped and has some additional options to support it in that.

#### HelpListGroupOptions

Same as [`HelpListOptions`](#helplistoptions) but with these additional options:

* `alignWithinGroups` - _boolean_ - when set (and unless [`fixedPadName`](#helplistoptions) is set) the padding between name and description will be calculated within each group instead of across all groups
* `defaultGroupName` - _string_ - the default group name where all items that have no explicit group belonging will be placed (defaults to `'Default'`)
* `defaultGroupOrderFirst` - _boolean_ - if set the default group is added at the start rather than at the end

### formatGroupedFlagList()

```ts
formatGroupedFlagList(list: HelpList, indent: number, options?: HelpListGroupOptions): string
```

Same as [`formatGroupedHelpList()`](#formatgroupedhelplist) but with the [`keyPrefix`](#helplistoptions) option defaulting to `'--'` and [`defaultGroup`](#helplistgroupoptions) defaulting to `'Options'`.

<!-- ## Used by

* [`example`](https://example.com/) - used by this one to do X and Y -->

## Similar modules

* [`argsclopts`](https://github.com/bcomnes/argsclopts) - also concerned with generating help texts for `parseArgs()`
* [`meow`](https://github.com/sindresorhus/meow) - a more full fledged alternative and name inspiration (`p` as in `parseArgs`, `eow` as in `meow`, `ly` to avoid being perceived as a typejacking)
* [`meow-with-subcommands`](https://github.com/voxpelli/meow-with-subcommands) - a companion module to `meow` that provides the same help functionality as this module
* [`peowly-commands`](https://github.com/voxpelli/peowly-commands) - a companion module to this module that makes it on par with `meow-with-subcommands`

## See also

* [`parseArgs()`](https://nodejs.org/api/util.html#utilparseargsconfig) - the node.js API this module is built around. Available since `v18.3.0` and `v16.17.0`, non-experimental since `v20.0.0`.
