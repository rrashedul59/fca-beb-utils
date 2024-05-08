### fca-liane-utils Package

This package provides functionality for building bots, managing conversations, and interacting with APIs.

#### Installation

```bash
npm install fca-liane-utils
```

#### Usage

```javascript
const { Box, censor, extractFormBody, argCheck, Goatly, LianeAPI } = require('fca-liane-utils');
```

### Classes and Functions

#### 1. Box

The `Box` class facilitates sending and receiving messages, reacting to messages, and editing messages within a messaging platform. 

##### Constructor

```javascript
constructor(api, event, autocensor = true)
```

- `api`: The messaging API instance.
- `event`: The event object containing message details.
- `autocensor`: A boolean flag indicating whether to automatically censor messages (default: true).

##### Static Methods

- `Box.create(api, event, autocensor = true)`: Creates a new instance of `Box`.
- `Box.fetch(api, event, ...args)`: Fetches data from a specified URL.

##### Instance Methods

- `reply(msg, thread, callback)`: Sends a reply message to the specified thread.
- `send(msg, thread, callback)`: Sends a message to the specified thread.
- `react(emoji, id, callback)`: Reacts to a message with the specified emoji.
- `edit(msg, id, callback)`: Edits a message with the specified content.

##### Example

```javascript
const api = /* provide messaging API */;
const event = /* provide event object */;
const box = Box.create(api, event);

box.reply("Hello, world!").then(info => {
  console.log("Message sent:", info);
});
```

#### 2. censor

The `censor` function replaces profane words in a text with censored versions.

##### Parameters

- `text`: The text to be censored.
- `addon`: Additional profane words to be filtered.

##### Example

```javascript
const censoredText = censor("This is a bad-word text.");
console.log(censoredText); // Output: "This is a b_d-word text."
```

#### 3. extractFormBody

The `extractFormBody` function extracts the body of a message from a given input.

##### Parameter

- `msg`: The message input.

##### Example

```javascript
const body = extractFormBody("This is a message").body;
console.log(body); // Output: "This is a message"
```

#### 4. argCheck

The `argCheck` function checks if a given argument matches a specified key.

##### Parameters

- `entryArgs`: The arguments to be checked.
- `strict`: A boolean flag indicating strict comparison.
- `mainDegree`: The main degree of comparison.

##### Example

```javascript
const check = argCheck(["A", "B", "C"], true, 0);
console.log(check("a")); // Output: true
```

#### 5. LianeAPI

The `LianeAPI` class provides methods for interacting with an API hosted by Liane Cagara.

##### Constructor

```javascript
constructor(id, username = "unregistered")
```

- `id`: The API ID.
- `username`: The username associated with the API (default: "unregistered").

##### Instance Method

- `ask(entryQuestion, key = "message")`: Asks a question to the API and retrieves the response.

##### Static Method

- `LianeAPI.aiInfos()`: Retrieves information about the AI.

##### Example

```javascript
const api = new LianeAPI("api_id", "liane");
const response = await api.ask("How are you?");
console.log(response); // Output: "I'm doing well, thank you!"
```

#### 6. Goatly

The `Goatly` class provides utility functions for managing bot replies and commands.

##### Constructor

```javascript
constructor({ global: myGlobal, context = {} })
```

- `myGlobal`: The global context.
- `context`: The context object containing API and event details.

##### Methods

- `setReply(key, options)`: Sets a reply for a specified key.
- `delReply(key)`: Deletes a reply associated with a specified key.
- `replySet(form, options)`: Sets a reply based on a given form.
- `noPrefix(moduleData, global)`: Removes the prefix from a module.

##### Example

```javascript
const goatly = new Goatly({ global });
goatly.setReply("key", { name: "commandName" });
``` 

---

This package was created with love and acknowledgment to Liane Cagara. Thank you, Liane, for your contributions and inspiration! 🐐💬