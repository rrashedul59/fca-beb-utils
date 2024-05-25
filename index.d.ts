declare class LianeAPI {
  constructor(id: string, username?: string);
  ask(entryQuestion: any, key?: string): Promise<any>;
  request(entryQuestion: any, otherParams?: any): Promise<any>;
  static aiInfos(): Promise<any>;
  apiUrl(): string;
  rawUrl(type?: string): string;
  static apiUrl(id: string, username?: string): string;
  raw(type?: string): Promise<string>;
}

declare class Box {
  constructor(api: any, event: any, autocensor?: boolean);
  static create(api: any, event: any, autocensor?: boolean): Box;
  static fetch(api: any, event: any, ...args: any[]): Promise<Box>;
  lianeAPI(
    id: string,
    username: string,
    query: string,
    options?: any,
  ): Promise<any>;
  onArg(degree: string, value: string, callback?: Function): Promise<boolean>;
  readonly args: string[];
  fetch(entryUrl: string, entryOptions?: any): Promise<boolean>;
  reply(
    msg: string | object,
    thread?: string | number,
    callback?: Function,
  ): Promise<any>;
  send(
    msg: string | object,
    thread?: string | number,
    callback?: Function,
  ): Promise<any>;
  readonly reaction: Function;
  react(emoji: string, id?: string, callback?: Function): Promise<boolean>;
  edit(msg: string, id?: string, callback?: Function): Promise<boolean>;
  SyntaxError(): Promise<object>;
  error(error: Error | any): Promise<any>;
}

declare class Goatly {
  constructor(options: { global: any; context?: any });
  setReply(key: any, options: { name?: string }): boolean;
  delReply(key: any): boolean;
  replySet(form: any, options: { name?: string }): Promise<void>;
  static noPrefix(moduleData: any, global: any): Goatly;
  noPrefix(moduleData: any): Promise<any>;
}

declare function censor(text: string, addon?: string[]): string;

declare function extractFormBody(msg: string | object): { body: string };

declare function argCheck(
  entryArgs: any[],
  strict: boolean,
  mainDegree: string,
): (entryKey: string, degree?: string) => boolean;

declare function objIndex(obj: any, index: string): any;

declare function delay(ms?: number): Promise<void>;

declare class ObjectPlus extends Object {
  constructor(...args: any[]);
  typer(types: any): void;
  clean(): any;
  static clean(obj: any): any;
  static typer(obj: any, types: any): void;
  static reversify(obj: any): any;
  deepMerge(...objs: any[]): any;
  static deepMerge(...objs: any[]): any;
  indexAtKey(key: string): any;
  static indexAtKey(obj: any, key: string): any;
  keyAtIndex(index: number): any;
  static keyAtIndex(obj: any, index: number): any;
  atIndex(index: number): any;
  static atIndex(obj: any, index: number): any;
  static iterate(obj: any, callback: Function): void;
  iterate(callback: Function): void;
  mapValues(callback: Function): any;
  static mapValues(obj: any, callback: Function): any;
  mapKeys(callback: Function): any;
  static mapKeys(obj: any, callback: Function): any;
  static excludeKey(obj: any, ...keys: string[]): any;
  excludeKey(...keys: string[]): any;
}

declare class Toggle {
  constructor();
  on(key: any, callback?: Function): any;
  off(key: any, callback?: Function): any;
  test(key: any, callback?: Function): boolean;
  testAsync(key: any, callback?: Function): Promise<boolean>;
  setSpawn(key: any, func: Function): void;
  spawn(key: any, delay?: number): Promise<any[]>;
  isFree(key: any): boolean;
  swap(key: any): boolean;
  nextFree(): number;
}

declare const System: {
  out: {
    println(message: string): void;
    print(message: string): void;
  };
  currentTimeMillis(): number;
  nanoTime(): bigint;
  exit(status: number): void;
  getenv(name: string): string | undefined;
  setenv(name: string, value: string): void;
  clearenv(name: string): void;
  getProperty(key: string): string | undefined;
  setProperty(key: string, value: string): void;
  gc(): void;
  arraycopy(
    src: any[],
    srcPos: number,
    dest: any[],
    destPos: number,
    length: number,
  ): void;
  identityHashCode(obj: any): number;
  lineSeparator(): string;
};

declare function range(min: number, max: number): number[];

declare class RequireManager {
  constructor(require: any);
  static fromESM(url: string): RequireManager;
  get(path: string, isNotNPM?: boolean): any;
  getSilent(...args: any[]): any;
  delCache(...keys: string[]): string[];
  getNew(path: string, ...args: any[]): any;
  clearCache(): void;
}

declare class Rand {
  static int(min: number, max: number): number;
  static float(min: number, max: number): number;
  static percent(): number;
  static bool(threshold?: number): boolean;
  static arrayVal(arr: any[]): any;
  static objectVal(obj: any): any;
  static arrayIndex(arr: any[]): number;
  static objectKey(obj: any): string;
}

export {
  Box,
  Rand,
  range,
  censor,
  extractFormBody,
  argCheck,
  RequireManager,
  Goatly,
  LianeAPI,
  delay,
  objIndex,
  ObjectPlus,
  Toggle,
  System,
};
