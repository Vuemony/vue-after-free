import IdGenerator = require("./id-generator")

export = CodePathState;
/**
 * A class which manages state to analyze code paths.
 */
declare class CodePathState {
    /**
     * Creates a new instance.
     * @param {IdGenerator} idGenerator An id generator to generate id for code
     *   path segments.
     * @param {Function} onLooped A callback function to notify looping.
     */
    constructor(idGenerator: IdGenerator, onLooped: Function);
    /**
     * The ID generator to use when creating new segments.
     * @type {IdGenerator}
     */
    idGenerator: IdGenerator;
    /**
     * A callback function to call when there is a loop.
     * @type {Function}
     */
    notifyLooped: Function;
    /**
     * The root fork context for this state.
     * @type {ForkContext}
     */
    forkContext: ForkContext;
    /**
     * Context for logical expressions, conditional expressions, `if` statements,
     * and loops.
     * @type {ChoiceContext}
     */
    choiceContext: ChoiceContext;
    /**
     * Context for `switch` statements.
     * @type {SwitchContext}
     */
    switchContext: SwitchContext;
    /**
     * Context for `try` statements.
     * @type {TryContext}
     */
    tryContext: TryContext;
    /**
     * Context for loop statements.
     * @type {LoopContext}
     */
    loopContext: LoopContext;
    /**
     * Context for `break` statements.
     * @type {BreakContext}
     */
    breakContext: BreakContext;
    /**
     * Context for `ChainExpression` nodes.
     * @type {ChainContext}
     */
    chainContext: ChainContext;
    /**
     * An array that tracks the current segments in the state. The array
     * starts empty and segments are added with each `onCodePathSegmentStart`
     * event and removed with each `onCodePathSegmentEnd` event. Effectively,
     * this is tracking the code path segment traversal as the state is
     * modified.
     * @type {Array<CodePathSegment>}
     */
    currentSegments: Array<CodePathSegment>;
    /**
     * Tracks the starting segment for this path. This value never changes.
     * @type {CodePathSegment}
     */
    initialSegment: CodePathSegment;
    /**
     * The final segments of the code path which are either `return` or `throw`.
     * This is a union of the segments in `returnedForkContext` and `thrownForkContext`.
     * @type {Array<CodePathSegment>}
     */
    finalSegments: Array<CodePathSegment>;
    /**
     * The final segments of the code path which are `return`. These
     * segments are also contained in `finalSegments`.
     * @type {Array<CodePathSegment>}
     */
    returnedForkContext: Array<CodePathSegment>;
    /**
     * The final segments of the code path which are `throw`. These
     * segments are also contained in `finalSegments`.
     * @type {Array<CodePathSegment>}
     */
    thrownForkContext: Array<CodePathSegment>;
    /**
     * A passthrough property exposing the current pointer as part of the API.
     * @type {CodePathSegment[]}
     */
    get headSegments(): CodePathSegment[];
    /**
     * The parent forking context.
     * This is used for the root of new forks.
     * @type {ForkContext}
     */
    get parentForkContext(): ForkContext;
    /**
     * Creates and stacks new forking context.
     * @param {boolean} forkLeavingPath A flag which shows being in a
     *   "finally" block.
     * @returns {ForkContext} The created context.
     */
    pushForkContext(forkLeavingPath: boolean): ForkContext;
    /**
     * Pops and merges the last forking context.
     * @returns {ForkContext} The last context.
     */
    popForkContext(): ForkContext;
    /**
     * Creates a new path.
     * @returns {void}
     */
    forkPath(): void;
    /**
     * Creates a bypass path.
     * This is used for such as IfStatement which does not have "else" chunk.
     * @returns {void}
     */
    forkBypassPath(): void;
    /**
     * Creates a context for ConditionalExpression, LogicalExpression, AssignmentExpression (logical assignments only),
     * IfStatement, WhileStatement, DoWhileStatement, or ForStatement.
     *
     * LogicalExpressions have cases that it goes different paths between the
     * `true` case and the `false` case.
     *
     * For Example:
     *
     *     if (a || b) {
     *         foo();
     *     } else {
     *         bar();
     *     }
     *
     * In this case, `b` is evaluated always in the code path of the `else`
     * block, but it's not so in the code path of the `if` block.
     * So there are 3 paths.
     *
     *     a -> foo();
     *     a -> b -> foo();
     *     a -> b -> bar();
     * @param {string} kind A kind string.
     *   If the new context is LogicalExpression's or AssignmentExpression's, this is `"&&"` or `"||"` or `"??"`.
     *   If it's IfStatement's or ConditionalExpression's, this is `"test"`.
     *   Otherwise, this is `"loop"`.
     * @param {boolean} isForkingAsResult Indicates if the result of the choice
     *      creates a fork.
     * @returns {void}
     */
    pushChoiceContext(kind: string, isForkingAsResult: boolean): void;
    /**
     * Pops the last choice context and finalizes it.
     * This is called upon leaving a node that represents a choice.
     * @throws {Error} (Unreachable.)
     * @returns {ChoiceContext} The popped context.
     */
    popChoiceContext(): ChoiceContext;
    /**
     * Creates a code path segment to represent right-hand operand of a logical
     * expression.
     * This is called in the preprocessing phase when entering a node.
     * @throws {Error} (Unreachable.)
     * @returns {void}
     */
    makeLogicalRight(): void;
    /**
     * Makes a code path segment of the `if` block.
     * @returns {void}
     */
    makeIfConsequent(): void;
    /**
     * Makes a code path segment of the `else` block.
     * @returns {void}
     */
    makeIfAlternate(): void;
    /**
     * Pushes a new `ChainExpression` context to the stack. This method is
     * called when entering a `ChainExpression` node. A chain context is used to
     * count forking in the optional chain then merge them on the exiting from the
     * `ChainExpression` node.
     * @returns {void}
     */
    pushChainContext(): void;
    /**
     * Pop a `ChainExpression` context from the stack. This method is called on
     * exiting from each `ChainExpression` node. This merges all forks of the
     * last optional chaining.
     * @returns {void}
     */
    popChainContext(): void;
    /**
     * Create a choice context for optional access.
     * This method is called on entering to each `(Call|Member)Expression[optional=true]` node.
     * This creates a choice context as similar to `LogicalExpression[operator="??"]` node.
     * @returns {void}
     */
    makeOptionalNode(): void;
    /**
     * Create a fork.
     * This method is called on entering to the `arguments|property` property of each `(Call|Member)Expression` node.
     * @returns {void}
     */
    makeOptionalRight(): void;
    /**
     * Creates a context object of SwitchStatement and stacks it.
     * @param {boolean} hasCase `true` if the switch statement has one or more
     *   case parts.
     * @param {string|null} label The label text.
     * @returns {void}
     */
    pushSwitchContext(hasCase: boolean, label: string | null): void;
    /**
     * Pops the last context of SwitchStatement and finalizes it.
     *
     * - Disposes all forking stack for `case` and `default`.
     * - Creates the next code path segment from `context.brokenForkContext`.
     * - If the last `SwitchCase` node is not a `default` part, creates a path
     *   to the `default` body.
     * @returns {void}
     */
    popSwitchContext(): void;
    /**
     * Makes a code path segment for a `SwitchCase` node.
     * @param {boolean} isCaseBodyEmpty `true` if the body is empty.
     * @param {boolean} isDefaultCase `true` if the body is the default case.
     * @returns {void}
     */
    makeSwitchCaseBody(isCaseBodyEmpty: boolean, isDefaultCase: boolean): void;
    /**
     * Creates a context object of TryStatement and stacks it.
     * @param {boolean} hasFinalizer `true` if the try statement has a
     *   `finally` block.
     * @returns {void}
     */
    pushTryContext(hasFinalizer: boolean): void;
    /**
     * Pops the last context of TryStatement and finalizes it.
     * @returns {void}
     */
    popTryContext(): void;
    /**
     * Makes a code path segment for a `catch` block.
     * @returns {void}
     */
    makeCatchBlock(): void;
    /**
     * Makes a code path segment for a `finally` block.
     *
     * In the `finally` block, parallel paths are created. The parallel paths
     * are used as leaving-paths. The leaving-paths are paths from `return`
     * statements and `throw` statements in a `try` block or a `catch` block.
     * @returns {void}
     */
    makeFinallyBlock(): void;
    /**
     * Makes a code path segment from the first throwable node to the `catch`
     * block or the `finally` block.
     * @returns {void}
     */
    makeFirstThrowablePathInTryBlock(): void;
    /**
     * Creates a context object of a loop statement and stacks it.
     * @param {string} type The type of the node which was triggered. One of
     *   `WhileStatement`, `DoWhileStatement`, `ForStatement`, `ForInStatement`,
     *   and `ForStatement`.
     * @param {string|null} label A label of the node which was triggered.
     * @throws {Error} (Unreachable - unknown type.)
     * @returns {void}
     */
    pushLoopContext(type: string, label: string | null): void;
    /**
     * Pops the last context of a loop statement and finalizes it.
     * @throws {Error} (Unreachable - unknown type.)
     * @returns {void}
     */
    popLoopContext(): void;
    /**
     * Makes a code path segment for the test part of a WhileStatement.
     * @param {boolean|undefined} test The test value (only when constant).
     * @returns {void}
     */
    makeWhileTest(test: boolean | undefined): void;
    /**
     * Makes a code path segment for the body part of a WhileStatement.
     * @returns {void}
     */
    makeWhileBody(): void;
    /**
     * Makes a code path segment for the body part of a DoWhileStatement.
     * @returns {void}
     */
    makeDoWhileBody(): void;
    /**
     * Makes a code path segment for the test part of a DoWhileStatement.
     * @param {boolean|undefined} test The test value (only when constant).
     * @returns {void}
     */
    makeDoWhileTest(test: boolean | undefined): void;
    /**
     * Makes a code path segment for the test part of a ForStatement.
     * @param {boolean|undefined} test The test value (only when constant).
     * @returns {void}
     */
    makeForTest(test: boolean | undefined): void;
    /**
     * Makes a code path segment for the update part of a ForStatement.
     * @returns {void}
     */
    makeForUpdate(): void;
    /**
     * Makes a code path segment for the body part of a ForStatement.
     * @returns {void}
     */
    makeForBody(): void;
    /**
     * Makes a code path segment for the left part of a ForInStatement and a
     * ForOfStatement.
     * @returns {void}
     */
    makeForInOfLeft(): void;
    /**
     * Makes a code path segment for the right part of a ForInStatement and a
     * ForOfStatement.
     * @returns {void}
     */
    makeForInOfRight(): void;
    /**
     * Makes a code path segment for the body part of a ForInStatement and a
     * ForOfStatement.
     * @returns {void}
     */
    makeForInOfBody(): void;
    /**
     * Creates new context in which a `break` statement can be used. This occurs inside of a loop,
     * labeled statement, or switch statement.
     * @param {boolean} breakable Indicates if we are inside a statement where
     *      `break` without a label will exit the statement.
     * @param {string|null} label The label associated with the statement.
     * @returns {BreakContext} The new context.
     */
    pushBreakContext(breakable: boolean, label: string | null): BreakContext;
    /**
     * Removes the top item of the break context stack.
     * @returns {Object} The removed context.
     */
    popBreakContext(): any;
    /**
     * Makes a path for a `break` statement.
     *
     * It registers the head segment to a context of `break`.
     * It makes new unreachable segment, then it set the head with the segment.
     * @param {string|null} label A label of the break statement.
     * @returns {void}
     */
    makeBreak(label: string | null): void;
    /**
     * Makes a path for a `continue` statement.
     *
     * It makes a looping path.
     * It makes new unreachable segment, then it set the head with the segment.
     * @param {string|null} label A label of the continue statement.
     * @returns {void}
     */
    makeContinue(label: string | null): void;
    /**
     * Makes a path for a `return` statement.
     *
     * It registers the head segment to a context of `return`.
     * It makes new unreachable segment, then it set the head with the segment.
     * @returns {void}
     */
    makeReturn(): void;
    /**
     * Makes a path for a `throw` statement.
     *
     * It registers the head segment to a context of `throw`.
     * It makes new unreachable segment, then it set the head with the segment.
     * @returns {void}
     */
    makeThrow(): void;
    /**
     * Makes the final path.
     * @returns {void}
     */
    makeFinal(): void;
}
declare namespace CodePathState {
    export { LoopContext };
}
import ForkContext = require("./fork-context");
/**
 * Represents a choice in the code path.
 *
 * Choices are created by logical operators such as `&&`, loops, conditionals,
 * and `if` statements. This is the point at which the code path has a choice of
 * which direction to go.
 *
 * The result of a choice might be in the left (test) expression of another choice,
 * and in that case, may create a new fork. For example, `a || b` is a choice
 * but does not create a new fork because the result of the expression is
 * not used as the test expression in another expression. In this case,
 * `isForkingAsResult` is false. In the expression `a || b || c`, the `a || b`
 * expression appears as the test expression for `|| c`, so the
 * result of `a || b` creates a fork because execution may or may not
 * continue to `|| c`. `isForkingAsResult` for `a || b` in this case is true
 * while `isForkingAsResult` for `|| c` is false. (`isForkingAsResult` is always
 * false for `if` statements, conditional expressions, and loops.)
 *
 * All of the choices except one (`??`) operate on a true/false fork, meaning if
 * true go one way and if false go the other (tracked by `trueForkContext` and
 * `falseForkContext`). The `??` operator doesn't operate on true/false because
 * the left expression is evaluated to be nullish or not, so only if nullish do
 * we fork to the right expression (tracked by `nullishForkContext`).
 */
declare class ChoiceContext {
    /**
     * Creates a new instance.
     * @param {ChoiceContext} upperContext The previous `ChoiceContext`.
     * @param {string} kind The kind of choice. If it's a logical or assignment expression, this
     *      is `"&&"` or `"||"` or `"??"`; if it's an `if` statement or
     *      conditional expression, this is `"test"`; otherwise, this is `"loop"`.
     * @param {boolean} isForkingAsResult Indicates if the result of the choice
     *      creates a fork.
     * @param {ForkContext} forkContext The containing `ForkContext`.
     */
    constructor(upperContext: ChoiceContext, kind: string, isForkingAsResult: boolean, forkContext: ForkContext);
    /**
     * The previous `ChoiceContext`
     * @type {ChoiceContext}
     */
    upper: ChoiceContext;
    /**
     * The kind of choice. If it's a logical or assignment expression, this
     * is `"&&"` or `"||"` or `"??"`; if it's an `if` statement or
     * conditional expression, this is `"test"`; otherwise, this is `"loop"`.
     * @type {string}
     */
    kind: string;
    /**
     * Indicates if the result of the choice forks the code path.
     * @type {boolean}
     */
    isForkingAsResult: boolean;
    /**
     * The fork context for the `true` path of the choice.
     * @type {ForkContext}
     */
    trueForkContext: ForkContext;
    /**
     * The fork context for the `false` path of the choice.
     * @type {ForkContext}
     */
    falseForkContext: ForkContext;
    /**
     * The fork context for when the choice result is `null` or `undefined`.
     * @type {ForkContext}
     */
    nullishForkContext: ForkContext;
    /**
     * Indicates if any of `trueForkContext`, `falseForkContext`, or
     * `nullishForkContext` have been updated with segments from a child context.
     * @type {boolean}
     */
    processed: boolean;
}
/**
 * Represents the context for any loop.
 * @typedef {WhileLoopContext|DoWhileLoopContext|ForLoopContext|ForInLoopContext|ForOfLoopContext} LoopContext
 */
/**
 * Represents the context for a `switch` statement.
 */
declare class SwitchContext {
    /**
     * Creates a new instance.
     * @param {SwitchContext} upperContext The previous context.
     * @param {boolean} hasCase Indicates if there is at least one `case` statement.
     *      `default` doesn't count.
     */
    constructor(upperContext: SwitchContext, hasCase: boolean);
    /**
     * The previous context.
     * @type {SwitchContext}
     */
    upper: SwitchContext;
    /**
     * Indicates if there is at least one `case` statement. `default` doesn't count.
     * @type {boolean}
     */
    hasCase: boolean;
    /**
     * The `default` keyword.
     * @type {Array<CodePathSegment>|null}
     */
    defaultSegments: Array<CodePathSegment> | null;
    /**
     * The default case body starting segments.
     * @type {Array<CodePathSegment>|null}
     */
    defaultBodySegments: Array<CodePathSegment> | null;
    /**
     * Indicates if a `default` case and is empty exists.
     * @type {boolean}
     */
    foundEmptyDefault: boolean;
    /**
     * Indicates that a `default` exists and is the last case.
     * @type {boolean}
     */
    lastIsDefault: boolean;
    /**
     * The number of fork contexts created. This is equivalent to the
     * number of `case` statements plus a `default` statement (if present).
     * @type {number}
     */
    forkCount: number;
}
/**
 * Represents the context for a `try` statement.
 */
declare class TryContext {
    /**
     * Creates a new instance.
     * @param {TryContext} upperContext The previous context.
     * @param {boolean} hasFinalizer Indicates if the `try` statement has a
     *      `finally` block.
     * @param {ForkContext} forkContext The enclosing fork context.
     */
    constructor(upperContext: TryContext, hasFinalizer: boolean, forkContext: ForkContext);
    /**
     * The previous context.
     * @type {TryContext}
     */
    upper: TryContext;
    /**
     * Indicates if the `try` statement has a `finally` block.
     * @type {boolean}
     */
    hasFinalizer: boolean;
    /**
     * Tracks the traversal position inside of the `try` statement. This is
     * used to help determine the context necessary to create paths because
     * a `try` statement may or may not have `catch` or `finally` blocks,
     * and code paths behave differently in those blocks.
     * @type {"try"|"catch"|"finally"}
     */
    position: "try" | "catch" | "finally";
    /**
     * If the `try` statement has a `finally` block, this affects how a
     * `return` statement behaves in the `try` block. Without `finally`,
     * `return` behaves as usual and doesn't require a fork; with `finally`,
     * `return` forks into the `finally` block, so we need a fork context
     * to track it.
     * @type {ForkContext|null}
     */
    returnedForkContext: ForkContext | null;
    /**
     * When a `throw` occurs inside of a `try` block, the code path forks
     * into the `catch` or `finally` blocks, and this fork context tracks
     * that path.
     * @type {ForkContext}
     */
    thrownForkContext: ForkContext;
    /**
     * Indicates if the last segment in the `try` block is reachable.
     * @type {boolean}
     */
    lastOfTryIsReachable: boolean;
    /**
     * Indicates if the last segment in the `catch` block is reachable.
     * @type {boolean}
     */
    lastOfCatchIsReachable: boolean;
}
/**
 * Represents the context for any loop.
 */
type LoopContext = WhileLoopContext | DoWhileLoopContext | ForLoopContext | ForInLoopContext | ForOfLoopContext;
/**
 * Represents the context in which a `break` statement can be used.
 *
 * A `break` statement without a label is only valid in a few places in
 * JavaScript: any type of loop or a `switch` statement. Otherwise, `break`
 * without a label causes a syntax error. For these contexts, `breakable` is
 * set to `true` to indicate that a `break` without a label is valid.
 *
 * However, a `break` statement with a label is also valid inside of a labeled
 * statement. For example, this is valid:
 *
 *     a : {
 *         break a;
 *     }
 *
 * The `breakable` property is set false for labeled statements to indicate
 * that `break` without a label is invalid.
 */
declare class BreakContext {
    /**
     * Creates a new instance.
     * @param {BreakContext} upperContext The previous `BreakContext`.
     * @param {boolean} breakable Indicates if we are inside a statement where
     *      `break` without a label will exit the statement.
     * @param {string|null} label The label for the statement.
     * @param {ForkContext} forkContext The current fork context.
     */
    constructor(upperContext: BreakContext, breakable: boolean, label: string | null, forkContext: ForkContext);
    /**
     * The previous `BreakContext`
     * @type {BreakContext}
     */
    upper: BreakContext;
    /**
     * Indicates if we are inside a statement where `break` without a label
     * will exit the statement.
     * @type {boolean}
     */
    breakable: boolean;
    /**
     * The label associated with the statement.
     * @type {string|null}
     */
    label: string | null;
    /**
     * The fork context for the `break`.
     * @type {ForkContext}
     */
    brokenForkContext: ForkContext;
}
/**
 * Represents the context for `ChainExpression` nodes.
 */
declare class ChainContext {
    /**
     * Creates a new instance.
     * @param {ChainContext} upperContext The previous `ChainContext`.
     */
    constructor(upperContext: ChainContext);
    /**
     * The previous `ChainContext`
     * @type {ChainContext}
     */
    upper: ChainContext;
    /**
     * The number of choice contexts inside of the `ChainContext`.
     * @type {number}
     */
    choiceContextCount: number;
}
import CodePathSegment = require("./code-path-segment");
/**
 * Represents the context for a `while` loop.
 */
declare class WhileLoopContext extends LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     */
    constructor(upperContext: LoopContext | null, label: string | null, breakContext: BreakContext);
    /**
     * The segments representing the test condition where `continue` will
     * jump to. The test condition will typically have just one segment but
     * it's possible for there to be more than one.
     * @type {Array<CodePathSegment>|null}
     */
    continueDestSegments: Array<CodePathSegment> | null;
}
/**
 * Represents the context for a `do-while` loop.
 */
declare class DoWhileLoopContext extends LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     * @param {ForkContext} forkContext The enclosing fork context.
     */
    constructor(upperContext: LoopContext | null, label: string | null, breakContext: BreakContext, forkContext: ForkContext);
    /**
     * The segments at the start of the loop body. This is the only loop
     * where the test comes at the end, so the first iteration always
     * happens and we need a reference to the first statements.
     * @type {Array<CodePathSegment>|null}
     */
    entrySegments: Array<CodePathSegment> | null;
    /**
     * The fork context to follow when a `continue` is found.
     * @type {ForkContext}
     */
    continueForkContext: ForkContext;
}
/**
 * Represents the context for a `for` loop.
 */
declare class ForLoopContext extends LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     */
    constructor(upperContext: LoopContext | null, label: string | null, breakContext: BreakContext);
    /**
     * The end of the init expression. This may change during the lifetime
     * of the instance as we traverse the loop because some loops don't have
     * an init expression.
     * @type {Array<CodePathSegment>|null}
     */
    endOfInitSegments: Array<CodePathSegment> | null;
    /**
     * The start of the test expression. This may change during the lifetime
     * of the instance as we traverse the loop because some loops don't have
     * a test expression.
     * @type {Array<CodePathSegment>|null}
     */
    testSegments: Array<CodePathSegment> | null;
    /**
     * The end of the test expression. This may change during the lifetime
     * of the instance as we traverse the loop because some loops don't have
     * a test expression.
     * @type {Array<CodePathSegment>|null}
     */
    endOfTestSegments: Array<CodePathSegment> | null;
    /**
     * The start of the update expression. This may change during the lifetime
     * of the instance as we traverse the loop because some loops don't have
     * an update expression.
     * @type {Array<CodePathSegment>|null}
     */
    updateSegments: Array<CodePathSegment> | null;
    /**
     * The end of the update expresion. This may change during the lifetime
     * of the instance as we traverse the loop because some loops don't have
     * an update expression.
     * @type {Array<CodePathSegment>|null}
     */
    endOfUpdateSegments: Array<CodePathSegment> | null;
    /**
     * The segments representing the test condition where `continue` will
     * jump to. The test condition will typically have just one segment but
     * it's possible for there to be more than one. This may change during the
     * lifetime of the instance as we traverse the loop because some loops
     * don't have an update expression. When there is an update expression, this
     * will end up pointing to that expression; otherwise it will end up pointing
     * to the test expression.
     * @type {Array<CodePathSegment>|null}
     */
    continueDestSegments: Array<CodePathSegment> | null;
}
/**
 * Represents the context for a `for-in` loop.
 *
 * Terminology:
 * - "left" means the part of the loop to the left of the `in` keyword. For
 *   example, in `for (var x in y)`, the left is `var x`.
 * - "right" means the part of the loop to the right of the `in` keyword. For
 *   example, in `for (var x in y)`, the right is `y`.
 */
declare class ForInLoopContext extends LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     */
    constructor(upperContext: LoopContext | null, label: string | null, breakContext: BreakContext);
    /**
     * The segments that came immediately before the start of the loop.
     * This allows you to traverse backwards out of the loop into the
     * surrounding code. This is necessary to evaluate the right expression
     * correctly, as it must be evaluated in the same way as the left
     * expression, but the pointer to these segments would otherwise be
     * lost if not stored on the instance. Once the right expression has
     * been evaluated, this property is no longer used.
     * @type {Array<CodePathSegment>|null}
     */
    prevSegments: Array<CodePathSegment> | null;
    /**
     * Segments representing the start of everything to the left of the
     * `in` keyword. This can be used to move forward towards
     * `endOfLeftSegments`. `leftSegments` and `endOfLeftSegments` are
     * effectively the head and tail of a doubly-linked list.
     * @type {Array<CodePathSegment>|null}
     */
    leftSegments: Array<CodePathSegment> | null;
    /**
     * Segments representing the end of everything to the left of the
     * `in` keyword. This can be used to move backward towards `leftSegments`.
     * `leftSegments` and `endOfLeftSegments` are effectively the head
     * and tail of a doubly-linked list.
     * @type {Array<CodePathSegment>|null}
     */
    endOfLeftSegments: Array<CodePathSegment> | null;
    /**
     * The segments representing the left expression where `continue` will
     * jump to. In `for-in` loops, `continue` must always re-execute the
     * left expression each time through the loop. This contains the same
     * segments as `leftSegments`, but is duplicated here so each loop
     * context has the same property pointing to where `continue` should
     * end up.
     * @type {Array<CodePathSegment>|null}
     */
    continueDestSegments: Array<CodePathSegment> | null;
}
/**
 * Represents the context for a `for-of` loop.
 */
declare class ForOfLoopContext extends LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     */
    constructor(upperContext: LoopContext | null, label: string | null, breakContext: BreakContext);
    /**
     * The segments that came immediately before the start of the loop.
     * This allows you to traverse backwards out of the loop into the
     * surrounding code. This is necessary to evaluate the right expression
     * correctly, as it must be evaluated in the same way as the left
     * expression, but the pointer to these segments would otherwise be
     * lost if not stored on the instance. Once the right expression has
     * been evaluated, this property is no longer used.
     * @type {Array<CodePathSegment>|null}
     */
    prevSegments: Array<CodePathSegment> | null;
    /**
     * Segments representing the start of everything to the left of the
     * `of` keyword. This can be used to move forward towards
     * `endOfLeftSegments`. `leftSegments` and `endOfLeftSegments` are
     * effectively the head and tail of a doubly-linked list.
     * @type {Array<CodePathSegment>|null}
     */
    leftSegments: Array<CodePathSegment> | null;
    /**
     * Segments representing the end of everything to the left of the
     * `of` keyword. This can be used to move backward towards `leftSegments`.
     * `leftSegments` and `endOfLeftSegments` are effectively the head
     * and tail of a doubly-linked list.
     * @type {Array<CodePathSegment>|null}
     */
    endOfLeftSegments: Array<CodePathSegment> | null;
    /**
     * The segments representing the left expression where `continue` will
     * jump to. In `for-in` loops, `continue` must always re-execute the
     * left expression each time through the loop. This contains the same
     * segments as `leftSegments`, but is duplicated here so each loop
     * context has the same property pointing to where `continue` should
     * end up.
     * @type {Array<CodePathSegment>|null}
     */
    continueDestSegments: Array<CodePathSegment> | null;
}
/**
 * Base class for all loop contexts.
 */
declare class LoopContextBase {
    /**
     * Creates a new instance.
     * @param {LoopContext|null} upperContext The previous `LoopContext`.
     * @param {string} type The AST node's `type` for the loop.
     * @param {string|null} label The label for the loop from an enclosing `LabeledStatement`.
     * @param {BreakContext} breakContext The context for breaking the loop.
     */
    constructor(upperContext: LoopContext | null, type: string, label: string | null, breakContext: BreakContext);
    /**
     * The previous `LoopContext`.
     * @type {LoopContext}
     */
    upper: LoopContext;
    /**
     * The AST node's `type` for the loop.
     * @type {string}
     */
    type: string;
    /**
     * The label for the loop from an enclosing `LabeledStatement`.
     * @type {string|null}
     */
    label: string | null;
    /**
     * The fork context for when `break` is encountered.
     * @type {ForkContext}
     */
    brokenForkContext: ForkContext;
}
