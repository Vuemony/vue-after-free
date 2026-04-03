export function filter<T extends unknown[] | (readonly unknown[])>(input: T): Exclude<T[number], undefined>[];
export function groupBy<T, K extends string | number | symbol>(iterable: Iterable<T>, callback: (arg0: T, arg1: number) => K): Partial<Record<K, T[]>>;
//# sourceMappingURL=utils.d.ts.map