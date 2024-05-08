const Filter = require("bad-words");
const filter = new Filter();
const axios = require("axios");

function censor(text, addon = []) {
  const customFilter = new Filter({ list: addon.concat(filter.list) });

  const words = text.split(/\s+/);
  const censoredText = words.map((word) => {
    if (customFilter.isProfane(word)) {
      const firstLetter = word.charAt(0);
      const censoredWord = firstLetter + "_".repeat(word.length - 1);
      return censoredWord;
    } else {
      return word;
    }
  });
  return censoredText.join(" ");
}

class Box {
  /**
   * Creates an instance of MessengerAPI.
   * @constructor
   * @param {object} api - The Facebook Messenger API instance.
   * @param {object} event - The event object containing message details.
   */
  constructor(api, event, autocensor = true) {
    this.api = api;
    this.event = event;
    this.lastID = null;
    this.autocensor = !!autocensor;
  }
  static create(...args) {
    return new Box(...args);
  }
  static fetch(api, event, ...args) {
    return new Box(api, event).fetch(...args);
  }
  async fetch(entryUrl, entryOptions = {}) {
    const defaultOptions = {
      ignoreError: true,
      key: null,
      wait: "⏳",
      done: "✅",
      asking: `⏳ | Please wait for my response...`,
      callback() {},
      errorText(err) {
        return `❌ ${err.message}\nThis could mean that a server is not available or unable to respond with your api request, please wait until the issue resolves automatically.`;
      },
      process(text) {
        return text;
      },
      axios: {
        params: {},
      },
      query: {},
      noEdit: false,
    };
    const options = { ...defaultOptions, ...entryOptions };
    let url = String(entryUrl).replace(/ /g, "");
    Object.assign(options.axios.params, options.query);
    let info = null;
    if (this.api.editMessage && !noEdit) {
      info = await this.reply(`${options.asking}`);
    }
    try {
      this.react(options.wait);
      const response = await axios.get(url, options.axios);
      let answer = "";
      if (options.key) {
        answer = String(response.data[options.key]);
      } else {
        answer = String(response.data);
      }
      answer = options.process(answer);
      if (!answer) {
        throw new Error("The server didn't answered your request.");
      }
      this.react(options.done);
      if (!info) {
        await this.reply(answer);
        return true;
      }
      return this.edit(answer, info.messageID);
    } catch (err) {
      if (options.ignoreError) {
        return this.reply(options.errorText(err));
      }
      throw err;
    }
  }
  /**
   * Sends a reply message to the specified thread.
   * @param {string | object} msg - The message content.
   * @param {string | number} [thread] - The thread ID to send the message to. Defaults to the current thread.
   * @param {function} [callback] - Optional callback function to execute after sending the message.
   * @returns {Promise<object>} - A promise resolving to the message info.
   */
  #censor(form) {
    const msg = extractFormBody(form);
    if (!this.autocensor) {
      return msg;
    }
    msg.body = censor(msg.body);
    return msg;
  }
  reply(msg, thread, callback) {
    return new Promise((r) => {
      this.api.sendMessage(
        this.#censor(msg),
        thread || this.event.threadID,
        async (err, info) => {
          if (typeof callback === "function") {
            await callback(err, info);
          }
          this.lastID = info?.messageID;
          r(info);
        },
      );
    }, this.event.messageID);
  }
  /**
   * Sends a message to the specified thread.
   * @param {string | object} msg - The message content.
   * @param {string | number} [thread] - The thread ID to send the message to. Defaults to the current thread.
   * @param {function} [callback] - Optional callback function to execute after sending the message.
   * @returns {Promise<object>} - A promise resolving to the message info.
   */
  send(msg, thread, callback) {
    return new Promise((r) => {
      this.api.sendMessage(
        this.#censor(msg),
        thread || this.event.threadID,
        async (err, info) => {
          if (typeof callback === "function") {
            await callback(err, info);
          }
          this.lastID = info?.messageID;
          r(info);
        },
      );
    });
  }

  /**
   * Reacts to a message with the specified emoji.
   * @param {string} emoji - The emoji to react with.
   * @param {string} [id] - The message ID to react to. Defaults to the current message ID.
   * @param {function} [callback] - Optional callback function to execute after reacting.
   * @returns {Promise<boolean>} - A promise resolving to true if the reaction is successful.
   */
  react(emoji, id, callback) {
    return new Promise((r) => {
      this.api.setMessageReaction(
        emoji,
        id || this.event.messageID,
        async (err, ...args) => {
          if (typeof callback === "function") {
            await callback(err, ...args);
          }
          r(true);
        },
        true,
      );
    });
  }
  /**
   * Edits a message with the specified content.
   * @param {string} msg - The new message content.
   * @param {string} [id] - The message ID to edit. Defaults to the last sent message ID.
   * @param {function} [callback] - Optional callback function to execute after editing.
   * @returns {Promise<boolean>} - A promise resolving to true if the edit is successful.
   */
  edit(msg, id, callback) {
    return new Promise((r) => {
      this.api.editMessage(
        this.#censor(msg).body,
        id || this.lastID,
        async (err, ...args) => {
          if (typeof callback === "function") {
            await callback(err, ...args);
          }
          r(true);
        },
      );
    });
  }
}

function extractFormBody(msg) {
  if (typeof msg === "string") {
    return { body: msg };
  } else if (typeof msg === "object") {
    return { ...msg };
  } else {
    return { body: String(msg) };
  }
}

function argCheck(entryArgs, strict, mainDegree) {
  const args = [...entryArgs];
  return function check(entryKey, degree = mainDegree) {
    const key = String(entryKey);
    if (strict && args[degree] !== key) {
      return false;
    }
    if (args[degree]?.toLowerCase === key.toLowerCase) {
      return true;
    }
  };
}

class LianeAPI {
  constructor(id, username = "unregistered") {
    this.id = id;
    this.username = username;
    this.url = `https://lianeapi.onrender.com/api`;
  }
  async ask(entryQuestion, key = "message") {
    const question = String(entryQuestion);
    const response = await axios.get(
      `${this.url}/@${this.username}/api/${this.id}`,
      {
        params: {
          query: question,
        },
      },
    );
    return response.data[key];
  }
  static async aiInfos() {
    const response = await axios.get(`${this.url}/api/myai?type=all&c=only`);
    return response.data;
  }
}

class Goatly {
  constructor({ global: myGlobal, context = {} }) {
    this.global = myGlobal;
    this.context = context;
    this.box = null;
    if (context.api && context.event) {
      this.box = new Box(context.api, context.event, true);
    }
  }
  setReply(key, { name = context.commandName, ...options }) {
    this.global.GoatBot.onReply.set(key, { commandName: name, ...options });
    return true;
  }
  delReply(key) {
    this.global.GoatBot.onReply.delete(key);
    return true;
  }
  async replySet(form, { name = context.commandName, ...options }) {
    if (!this.box) {
      throw new Error("No box");
    }
    const info = await box.reply(form);
    this.global.GoatBot.onReply.set(info.messageID, {
      commandName: name,
      ...options,
    });
  }
  static noPrefix(moduleData, global) {
    return new Goatly({ global }).noPrefix(moduleData);
  }
  async noPrefix(moduleData) {
    const { global } = this;
    const { prefix } = global.GoatBot.config;
    const onStartBackup = moduleData.onStart.bind(moduleData);
    moduleData.config.author = `${moduleData.config.author} || Liane (noPrefix)`;
    moduleData.onStart = async function () {};
    const { name } = moduleData.config;
    moduleData.onChat = async function ({ ...context }) {
      const { event } = context;
      event.body = event.body || "";
      let willApply = false;
      let [commandName, ...args] = event.body.split(" ").filter(Boolean);
      if (!commandName) {
        return;
      }
      if (commandName.startsWith(prefix)) {
        commandName = commandName.replace(prefix, "");
      }

      if (commandName.toLowerCase() === name.toLowerCase()) {
        willApply = true;
      }
      context.args = args;
      if (!willApply) {
        return;
      }
      await onStartBackup(context);
    };
    return moduleData;
  }
}

module.exports = { Box, censor, extractFormBody, argCheck, Goatly, LianeAPI };
