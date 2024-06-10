const { Box } = require("../index");
const { createGoatRateLimit } = require("./rateLimit");

global.ShopSystem = {
  priceList: {
    /*[key]: {
      name: string,
      price: number,
      trial: number
    } */
  },
};
global.LockSystem = {
  keyData: new Map(),
  commandData: new Map(),
  userData: new Map(),
};

class LockSystem {
  static lockCommand(commandName, key) {
    const commands = global.LockSystem.commandData.get(key) || [];
    commands.push(commandName);
    global.LockSystem.commandData.set(key, commands);
  }
  static isLockedCommand(commandName, key) {
    const commands = global.LockSystem.commandData.get(key) || [];
    return commands.includes(commandName);
  }
  static isLockedUser(userID, key) {
    const users = global.LockSystem.userData.get(key) || [];
    return users.includes(userID);
  }
  static isLocked(key) {
    return global.LockSystem.keyData.has(key);
  }
  static unlockCommand(commandName, key) {
    let commands = global.LockSystem.commandData.get(key) || [];
    commands = commands.filter((command) => command !== commandName);
    global.LockSystem.commandData.set(key, commands);
  }
  static lockUser(userID, key) {
    const users = global.LockSystem.userData.get(key) || [];
    users.push(userID);
    global.LockSystem.userData.set(key, users);
  }
  static unlockUser(userID, key) {
    let users = global.LockSystem.userData.get(key) || [];
    users = users.filter((user) => user !== userID);
    global.LockSystem.userData.set(key, users);
  }
  static registerKey(
    key,
    {
      message = `🔒 | This command is locked for no provided reason.`,
      reaction = "",
    },
  ) {
    global.LockSystem.keyData.set(key, {
      message,
      reaction,
    });
  }
  static unregisterKey(key) {
    global.LockSystem.keyData.delete(key);
  }
  static getKeyData(key) {
    const options = global.LockSystem.keyData.get(key);
    if (!options) {
      return null;
    }
    const users = global.LockSystem.userData.get(key) || [];
    const commands = global.LockSystem.commandData.get(key) || [];
    return {
      options,
      users,
      commands,
    };
  }
}
global.LockSystem.class = LockSystem;

class GoatWrapper {
  constructor(moduleExports) {
    this.command = moduleExports;
    this.origMain = this.command.onStart;
    if (!GoatWrapper.isValid(this.command)) {
      throw new Error("GoatWrapper will not work with non-goatbot modules.");
    }
  }

  static isValid(data) {
    const validKeys = ["config", "onStart"];
    const invalidKeys = [
      "meta",
      "run",
      "onRun",
      "handleEvent",
      "handleReaction",
      "metadata",
    ];
    return Object.keys(data).every(
      (key) => validKeys.includes(key) && !invalidKeys.includes(key),
    );
  }

  applyLock(type, key) {
    if (type === "shop") {
      const price = Number(key);
      if (isNaN(price)) {
        throw new TypeError(
          "The first argument must be a number or a string that can be converted to a number.",
        );
      }

      global.ShopSystem.priceList[this.command.config.name] = {
        name: this.command.config.name,
        price,
        trial: 0,
      };
      this.command.onStart = (i) => shopGoatMain(this.origMain, i);
    } else if (type === "rateLimit") {
      const { maxRequests, interval } = key || {};
      const og = this.command.onStart;
      this.command.onStart = createGoatRateLimit(og, {
        maxRequests,
        interval,
      });
    } else {
      throw new Error(`Cannot apply a lock to an invalid type: ${type}`);
    }
  }

  applyBox() {
    const og = this.command.onStart;
    this.command.onStart = (i) => {
      i.box = new Box(i.api, i.event);
      return og(i);
    };
  }
  applyNoPrefix(options) {
    options ??= {
      allowPrefix: false,
      disableOnChat: false,
    };
    options.allowPrefix ??= false;
    options.disableOnChat ??= false;
    const moduleData = this.command;
    const { prefix } = global.GoatBot.config;
    const onStartBackup = moduleData.onStart.bind(moduleData);
    const onChatBackup = moduleData.onChat
      ? moduleData.onChat.bind(moduleData)
      : () => {};
    moduleData.config.author = `${moduleData.config.author} || Liane (noPrefix)`;
    moduleData.onStart = async function () {};
    const { name } = moduleData.config;
    moduleData.onChat = async function ({ ...context }) {
      const { event } = context;
      event.body = event.body || "";
      if (!options.disableOnChat) {
        try {
          await onChatBackup({ ...context });
        } catch (error) {
          console.log(error);
        }
      }
      let willApply = false;
      let [commandName, ...args] = event.body.split(" ").filter(Boolean);
      if (!commandName) {
        return;
      }
      const hasPrefix = commandName.startsWith(prefix);
      if (hasPrefix) {
        commandName = commandName.replace(prefix, "");
      }
      if (
        options.allowPrefix === false &&
        commandName.toLowerCase() === name.toLowerCase() &&
        hasPrefix
      ) {
        return context.message.reply(
          `❌ | The command "${commandName}" cannot be used with the prefix "${prefix}"`,
        );
      }
      commandName = commandName.trim();

      if (commandName.toLowerCase().trim() === name.toLowerCase().trim()) {
        willApply = true;
      }
      if (Array.isArray(moduleData.config.aliases)) {
        const { aliases } = moduleData.config;
        const condition = aliases.some((alias) => {
          return (
            commandName.toLowerCase().trim() ===
            String(alias).toLowerCase().trim()
          );
        });
        if (condition) {
          willApply = true;
        }
      }
      if (!willApply) {
        return;
      }
      await onStartBackup({ ...context, args, commandName });
    };
    return moduleData;
  }
}

class BotpackWrapper {
  constructor(moduleExports) {
    this.command = moduleExports;
    this.origMain = this.command.run;
    if (!BotpackWrapper.isValid(this.command)) {
      throw new Error("BotpackWrapper will not work with non-botpack modules.");
    }
  }

  static isValid(data) {
    const validKeys = ["config", "run"];
    const invalidKeys = [
      "meta",
      "onStart",
      "onRun",
      "onEvent",
      "onReaction",
      "metadata",
      "onReply",
    ];
    return Object.keys(data).every(
      (key) => validKeys.includes(key) && !invalidKeys.includes(key),
    );
  }

  // Coming soon.
}

async function shopGoatMain(funcMain, context) {
  const { api, event, usersData, commandName, args } = context;
  const box = new Box(api, event);
  try {
    const { money = 0, shopItems = {} } = await usersData.get(event.senderID);
    const { price = null } = global.ShopSystem.priceList[commandName] ?? {};
    if (price !== null && !(commandName in shopItems)) {
      if (args[0] && args[0].toLowerCase() === "purchase") {
        box.listen();
        if (money < price) {
          return box.reply(
            `❌ | The command "${commandName}" requires ${price}$ but you only have ${money}$!`,
          );
        }
        await box.waitForReaction(
          `⚠️ | Do you want to purchase the command "${commandName}" for ${price}$?\nReact 👍 to this message to confirm`,
          ({ event: reactionEvent, resolve }) => {
            if (reactionEvent.userID !== event.senderID) {
              return;
            }
            if (reactionEvent.reaction !== "👍") {
              return;
            }
            resolve();
          },
        );
        await usersData.set(event.senderID, {
          money: money - price,
          shopItems: {
            ...shopItems,
            [commandName]: true,
          },
        });
        box.reply(
          `✅ | You have purchased the command "${commandName}"! You may now use it.`,
        );
        return box.close();
      }
      let text = `🛒 | The command "${commandName}" is available in the shop for the price of ${price}$, type "${event.body.split(" ")[0]} purchase" to unlock this command.`;
      return box.reply(text);
    }
    await funcMain(context);
  } catch (error) {
    console.error(error);
    return box.error(error);
  }
}

class ShopSystem {
  static get Goat() {
    return class {
      constructor(data, price) {
        const wrapper = new GoatWrapper(data);
        wrapper.applyLock("shop", price);
      }
    };
  }
  static get Botpack() {
    return class {
      constructor() {
        throw new Error("In development!");
      }
    };
  }
}
global.ShopSystem.class = ShopSystem;

module.exports = {
  ShopSystem,
  GoatWrapper,
  BotpackWrapper,
  LockSystem,
};
