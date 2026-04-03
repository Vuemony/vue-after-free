import type { HelpListBasicItem } from './help-list-types.d.ts';

type ParseArgsOptionConfigType = 'string' | 'boolean';
type ParseArgsOptionConfigDefault = string | boolean | string[] | boolean[] | undefined;

// Borrowed from @types/node
interface ParseArgsOptionConfig {
  type: ParseArgsOptionConfigType;
  multiple?: boolean | undefined;
  // "shortFlag" in meow
  'short'?: string | undefined;
  'default'?: ParseArgsOptionConfigDefault;
}

type TypeMap = {
  'string': string,
  'boolean': boolean,
  // Meow extension
  // 'number': number|number[],
};

// Meow extensions
// interface FlagExtensions {
//   readonly choices?: Type extends unknown[] ? Type : Type[];
//   readonly isRequired?: boolean;
// }

interface BaseFlag extends ParseArgsOptionConfig, HelpListBasicItem {}

interface Flag<
  PrimitiveType extends ParseArgsOptionConfigType,
  DefaultType extends TypeMap[PrimitiveType]
> extends BaseFlag {
  type: PrimitiveType,
  'default'?: DefaultType,
  multiple?: false | undefined,
}

interface MultiFlag<
  PrimitiveType extends ParseArgsOptionConfigType,
  DefaultType extends ParseArgsOptionConfigDefault
> extends BaseFlag {
  type: PrimitiveType,
  'default'?: DefaultType,
  multiple: true,
}

export type StringFlag = Flag<'string', string> | MultiFlag<'string', string[]>;
export type BooleanFlag = Flag<'boolean', false>;
// Meow extension
// type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>;
export type AnyFlag = StringFlag | BooleanFlag;// | NumberFlag;
export type AnyFlags = Record<string, AnyFlag>;
