<div align="center">

# ts-declaration-location

[![npm
version](https://img.shields.io/npm/v/ts-declaration-location.svg)](https://www.npmjs.com/package/ts-declaration-location)
[![jsr Version](https://img.shields.io/jsr/v/@rebeccastevens/ts-declaration-location.svg)](https://jsr.io/@rebeccastevens/ts-declaration-location)
[![CI](https://github.com/RebeccaStevens/ts-declaration-location/actions/workflows/release.yml/badge.svg)](https://github.com/RebeccaStevens/ts-declaration-location/actions/workflows/release.yml)
[![Coverage Status](https://codecov.io/gh/RebeccaStevens/ts-declaration-location/branch/main/graph/badge.svg?token=MVpR1oAbIT)](https://codecov.io/gh/RebeccaStevens/ts-declaration-location)\
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub Discussions](https://img.shields.io/github/discussions/RebeccaStevens/ts-declaration-location?style=flat-square)](https://github.com/RebeccaStevens/ts-declaration-location/discussions)
[![BSD 3 Clause license](https://img.shields.io/github/license/RebeccaStevens/ts-declaration-location.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

</div>

## Donate

[Any donations would be much appreciated](./DONATIONS.md). 😄

### Enterprise Users

`ts-declaration-location` is available as part of the [Tidelift Subscription](https://tidelift.com/funding/github/npm/ts-declaration-location).

Tidelift is working with the maintainers of `ts-declaration-location` and a growing network of open source maintainers
to ensure your open source software supply chain meets enterprise standards now and into the future.
[Learn more.](https://tidelift.com/subscription/pkg/npm-ts-declaration-location?utm_source=npm-ts-declaration-location&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Installation

### npm

```sh
# Install with npm
npm install ts-declaration-location

# Install with pnpm
pnpm add ts-declaration-location

# Install with yarn
yarn add ts-declaration-location

# Install with bun
`bun add ts-declaration-location
```

### jsr

```sh
# Install in a node project
npx jsr add @rebeccastevens/ts-declaration-location

# Install in a deno project
deno add jsr:@rebeccastevens/ts-declaration-location

# Install in a bun project
bunx jsr add @rebeccastevens/ts-declaration-location
```

## Usage Example

```ts
import typeMatchesSpecifier from "ts-declaration-location";
import type ts from "typescript";

function isTypeFromSomePackage(program: ts.Program, type: ts.Type) {
  const specifier = {
    from: "package",
    package: "some-package",
  };

  return typeMatchesSpecifier(program, specifier, type);
}

function isTypeFromSomeFile(program: ts.Program, type: ts.Type) {
  const specifier = {
    from: "file",
    path: "src/**/some.ts",
  };

  return typeMatchesSpecifier(program, specifier, type);
}

function isTypeFromTSLib(program: ts.Program, type: ts.Type) {
  const specifier = {
    from: "lib",
  };

  return typeMatchesSpecifier(program, specifier, type);
}
```
