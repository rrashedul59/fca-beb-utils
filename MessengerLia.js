const loginUno = require("fca-unofficial");

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
    logger = (...i) => console.log(...i),
    ...bag
  }) {
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
  }
  on(search, ...callbacks) {
    this.searchers[search] ??= [];
    for (const callback of callbacks) {
      this.orders++;
      this.searchers[search].push({
        callback,
        index: this.orders,
      });
    }
  }
  use(...callbacks) {
    for (const callback of callbacks) {
      this.orders++;
      this.middlewares.push({
        callback,
        index: this.orders,
      });
    }
  }
  sortOrders() {
    const { searchers, middlewares } = this;
    let result = [];
    for (const search in searchers) {
      for (const { callback, index } of searchers[search]) {
        result[index] = {
          callback,
          search,
        };
      }
    }
    for (const { index, callback } of middlewares) {
      result[index] = {
        callback,
        search: null,
      };
    }
    return result;
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
      const wares = this.sortOrders();
      for (const ware of wares) {
        const { callback, search } = ware || {};
        if (typeof callback !== "function") continue;
        if (!tester(search)) continue;
        await new Promise(async (resolve) => {
          context.next = resolve;
          context.search = search;
          context.self = this;
          try {
            await callback(context, resolve);
          } catch (error) {
            this.logger(error);
            resolve();
          }
        });
      }
    } catch (error) {
      this.logger(error);
    }
  }
  #getAPI(val) {
    return new Promise((res, rej) => {
      this.#loginOrig({ ...val }, (err, api) => {
        if (err) return rej(err);
        res(api);
      });
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
    await this.#listen(api);
  }
  async #listen(api) {
    api.listen(async (err, event) => {
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
}

module.exports = MessengerLia;
