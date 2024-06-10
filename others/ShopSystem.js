const { Box } = require("../index");
global.ShopSystem = {
  priceList: {
    /*[key]: {
      name: string,
      price: number,
      trial: number
    } */
  },
};

class GoatShop {
  constructor(moduleExports) {
    this.command = moduleExports;
    this.origMain = this.command.onStart;
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
  applyLock(price) {
    price = Number(price);
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
  }
}

class BotpackShop {
  constructor(moduleExports) {
    this.command = moduleExports;
    this.origMain = this.command.run;
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
  /*applyLock(price) {
    price = Number(price);
    if (isNaN(price)) {
      throw new TypeError(
        "The first argument must be a number or a string that can be converted to a number.",
      );
    }
    this.command.run = (i) => shopBPMain(this.command.run, i);
  }*/
}

async function shopGoatMain(funcMain, context) {
  const { api, event, usersData, commandName, args } = context;
  const box = new Box(api, event);
  try {
    const { money = 0, shopItems = {} } = await usersData.get(event.senderID);
    const { price = null } = global.ShopSystem.priceList[commandName] ?? {};
    if (price === null && !(commandName in shopItems)) {
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
    return GoatShop;
  }
  static get Botpack() {
    return BotpackShop;
  }
}

module.exports = {
  ShopSystem,
};
