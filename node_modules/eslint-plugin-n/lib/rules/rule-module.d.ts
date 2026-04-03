import {
  RuleContext,
  RuleContextTypeOptions,
  RuleDefinition,
} from "@eslint/core";
import { Linter, SourceCode, Rule } from "eslint";
import * as ESTree from "estree";
import { Rule } from "eslint";

export interface PluginRuleContext<
  Options extends {} = { RuleOptions: RuleContextTypeOptions["RuleOptions"] },
> extends Rule.RuleContext {
  options: Options extends { RuleOptions: infer T }
    ? T
    : RuleContextTypeOptions["RuleOptions"];
}

export interface RuleModule<
  Options extends {} = { RuleOptions: RuleContextTypeOptions["RuleOptions"] },
> extends Rule.RuleModule {
  create(context: PluginRuleContext<Options>): Rule.NodeListener;
}
