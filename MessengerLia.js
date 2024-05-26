const loginUno = require("fca-unofficial");
let std = {};
const { Box, censor: censorer } = require("./index");

class MessengerLia {
  #loginOrig;
  #appState;
  #email;
  #password;
  constructor({
    login = loginUno,
    appState = [],
    prefix,
    accountOptions = {},
    email,
    password,
    devLog = () => {},
    logger = (...i) => console.log("[ MessengerLia ]", ...i),
    ...bag
  } = {}) {
    this.#loginOrig = login;
    this.prefix = prefix;
    this.accountOptions = accountOptions;
    this.#appState =
      typeof appState === "string" ? JSON.parse(appState) : appState;
    this.searchers = {};
    this.middlewares = [];
    this.#email = email;
    this.#password = password;
    this.bag = bag;
    this.api = null;
    this.logger = logger;
    this.orders = 0;
    logger(`Successfully initialized!`);
    this.devLog = devLog;
  }
  on(search, ...callbacks) {
    this.searchers[search] ??= [];
    this.orders++;
    this.searchers[search].push({
      callbacks,
      index: this.orders,
    });
    this.devLog(`Seacher added!`, {
      callback: callbacks.join("\n\n"),
      index: this.orders,
    });
  }
  use(...callbacks) {
    for (const callback of callbacks) {
      this.orders++;
      this.middlewares.push({
        callback,
        index: this.orders,
      });
      this.devLog(`Middleware added!`, {
        callback: String(callback),
        index: this.orders,
      });
    }
  }
  sortOrders() {
    const { searchers, middlewares } = this;
    let result = [];
    for (const search in searchers) {
      for (const { callbacks, index } of searchers[search]) {
        result[index] = {
          type: "search",
          callbacks,
          search,
        };
      }
    }
    for (const { index, callback } of middlewares) {
      result[index] = {
        type: "ware",
        callback,
        search: null,
      };
    }
    return { wares: result.filter(Boolean) };
  }
  async run(err, { ...context }) {
    context.tester = tester;
    function tester(search) {
      if (search === null) {
        return true;
      }
      const { event } = context;
      if (typeof event.body !== "string") return false;
      if (
        typeof search === "string" &&
        event.body.toLowerCase().trim() === search.toLowerCase().trim()
      ) {
        return true;
      }
      if (search instanceof RegExp && search.test(event.body)) {
        return true;
      }
      return false;
    }
    try {
      if (err) {
        this.logger(err);
      }
      const { wares } = this.sortOrders();
      for (const ware of wares) {
        const { search } = ware || {};
        if (!tester(search)) continue;
        function job(callback) {
          return new Promise(async (resolve) => {
            try {
              await callback(context, {
                next: resolve,
                search,
                self: this,
              });
            } catch (error) {
              this.logger(error);
              resolve();
            }
          });
        }
        if (ware.type === "search") {
          async function x() {
            for (const callback of ware.callbacks) {
              if (typeof callback !== "function") continue;
              await job(callback);
            }
          }
          // this is intended to avoid blocking the next middleware or searcher.
          x().catch(this.logger);
        } else {
          const { callback } = ware;
          if (typeof callback !== "function") continue;
          // this blocks the next middleware or searcher
          await job(callback);
        }
      }
    } catch (error) {
      this.logger(error);
    }
  }
  #getAPI(val) {
    // for synchronous syntax
    return new Promise((res, rej) => {
      try {
        this.#loginOrig({ ...val }, (err, api) => {
          if (err) return rej(err);
          res(api);
        });
      } catch (err) {
        rej(err);
      }
    });
  }
  async login() {
    const val = this.#appState
      ? {
          appState: this.#appState,
        }
      : {
          email: this.#email,
          password: this.#password,
        };
    this.api = await this.#getAPI(val);
    //await this.#listen(api);
  }
  async listen() {
    try {
      await this.login();
      await this.#listen(this.api);
    } catch (error) {
      this.logger(error);
    }
  }
  async #listen(api) {
    api.listenMqtt(async (err, event) => {
      try {
        await this.run(err, {
          api,
          event,
        });
      } catch (error) {
        this.logger(error);
      }
    });
  }
  static get std() {
    return std;
  }
}

std = {
  failSafe() {
    return function (context, { next, self }) {
      context.event ??= {};
      context.event.body ??= "";
      context.event.isGroup ??= false;
      context.api = new Proxy(context.api, {
        get(api, prop) {
          if (prop in api) {
            return api[prop];
          } else {
            return function () {
              self.logger(`api.${prop}(...) has no effect.`);
              return null;
            };
          }
        },
        set(api, prop, value) {
          api[prop] = value;
          return true;
        },
      });
      next();
    };
  },
  autoCensor(...keys) {
    return function (context, { next }) {
      if (!keys.includes("body")) {
        keys.push("body");
      }
      for (const key of keys) {
        if (!typeof context.event[key] !== "string") {
          continue;
        }
        context.event[key] = censorer(context.event[key]);
      }
      next();
    };
  },
  boxHelper({ censor } = {}) {
    return function (context, { next }) {
      context.box = new Box(context.api, context.event, !!censor);
      context.Box = Box;
      next();
    };
  },
  chatArgs() {
    return function (context, { next }) {
      const { event } = context;
      const args = event.body.split(" ").filter(Boolean).map(String);
      context.args = args;
      next();
    };
  },
};

module.exports = MessengerLia;
