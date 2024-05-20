# Box Class Documentation

The `Box` class, created by Liane, is designed to interact with Facebook Messenger API events, allowing for automated message handling, response generation, and interaction with external APIs like `LianeAPI`. Below is a detailed description of the methods available in the `Box` class.

For interacting with the Facebook Messenger API, you will use the `fca-unofficial` package from npm. Here’s an example of setting up the API using `fca-unofficial` before using the `Box` class:

```javascript
const login = require('fca-unofficial');
const cookie = require('./cookie'); // cookie.json file as example

login({ appState: cookie }, (err, api) => {
  if (err) return console.error(err);
  api.listenMqtt(async (err, event) => {
    if (err) return console.error(err);
    const box = new Box(api, event);
    await box.reply('Hello current user!');
    // More functionality can be added here
  });
});
```

## Constructor

### `constructor(api, event, autocensor = true)`

**Description:** Initializes a new instance of the `Box` class.

**Parameters:**
- `api` (object): The Facebook Messenger API instance.
- `event` (object): The event object containing message details.
- `autocensor` (boolean, optional): Whether to automatically censor messages. Defaults to `true`.

**Usage:**
```javascript
const box = new Box(api, event);
console.log(box.api); // Facebook Messenger API instance
console.log(box.event); // Event object containing message details
```

## Methods

### `static create(...args)`

**Description:** Creates a new instance of the `Box` class.

**Parameters:**
- `...args` (any): The arguments to pass to the constructor.

**Returns:** 
- A new `Box` instance.

**Usage:**
```javascript
const box = Box.create(api, event);
console.log(box instanceof Box); // true
```

### `static fetch(api, event, ...args)`

**Description:** Creates a new `Box` instance and fetches data.

**Parameters:**
- `api` (object): The Facebook Messenger API instance.
- `event` (object): The event object containing message details.
- `...args` (any): Additional arguments for the `fetch` method.

**Returns:** 
- The result of the `fetch` method.

**Usage:**
```javascript
Box.fetch(api, event, 'https://example.com/data').then(result => {
  console.log(result); // Fetched data
});
```

### `async lianeAPI(id, username, options = {})`

**Description:** Interacts with the LianeAPI.

**Parameters:**
- `id` (string): The unique identifier for the API.
- `username` (string): The username associated with the API.
- `options` (object, optional): Additional options for the fetch method.

**Returns:** 
- The result of the `fetch` method with the LianeAPI URL.

**Usage:**
```javascript
const result = await box.lianeAPI('claire', 'LianeAPI_Reworks');
console.log(result); // Response from LianeAPI
```

### `async fetch(entryUrl, entryOptions = {})`

**Description:** Fetches data from a specified URL.

**Parameters:**
- `entryUrl` (string): The URL to fetch data from.
- `entryOptions` (object, optional): Additional options for the fetch method.

**Returns:** 
- The fetched data.

**Usage:**
```javascript
box.fetch('https://example.com/data').then(result => {
  console.log(result); // Fetched data
});
```

### `reply(msg, thread, callback)`

**Description:** Sends a reply message to the specified thread.

**Parameters:**
- `msg` (string | object): The message content.
- `thread` (string | number, optional): The thread ID to send the message to. Defaults to the current thread.
- `callback` (function, optional): Optional callback function to execute after sending the message.

**Returns:** 
- A promise resolving to the message info.

**Usage:**
```javascript
box.reply('Hello!').then(info => {
  console.log(info); // Message info
});
```

### `send(msg, thread, callback)`

**Description:** Sends a message to the specified thread.

**Parameters:**
- `msg` (string | object): The message content.
- `thread` (string | number, optional): The thread ID to send the message to. Defaults to the current thread.
- `callback` (function, optional): Optional callback function to execute after sending the message.

**Returns:** 
- A promise resolving to the message info.

**Usage:**
```

```javascript
box.send('Hello everyone!', '1234567890').then(info => {
  console.log(info); // Message info
});
```

### `react(emoji, id, callback)`

**Description:** Reacts to a message with the specified emoji.

**Parameters:**
- `emoji` (string): The emoji to react with.
- `id` (string, optional): The message ID to react to. Defaults to the current message ID.
- `callback` (function, optional): Optional callback function to execute after reacting.

**Returns:** 
- A promise resolving to `true` if the reaction is successful.

**Usage:**
```javascript
box.react('👍').then(success => {
  console.log(success); // true
});
```

### `edit(msg, id, callback)`

**Description:** Edits a message with the specified content.

**Parameters:**
- `msg` (string): The new message content.
- `id` (string, optional): The message ID to edit. Defaults to the last sent message ID.
- `callback` (function, optional): Optional callback function to execute after editing.

**Returns:** 
- A promise resolving to `true` if the edit is successful.

**Usage:**
```javascript
box.edit('Updated message content').then(success => {
  console.log(success); // true
});
```

## Private Methods

### `#censor(form)`

**Description:** Censors the message content if `autocensor` is enabled.

**Parameters:**
- `form` (object): The message form object.

**Returns:** 
- The censored message content.

**Usage:** 
This method is used internally within the class and is not intended for direct usage.

## Summary

The `Box` class provides a structured way to interact with Facebook Messenger events and automate responses. The class includes methods for sending messages, reacting to messages, editing messages, and interacting with external APIs like `LianeAPI`. The following methods have been detailed:

1. `constructor(api, event, autocensor = true)`
2. `static create(...args)`
3. `static fetch(api, event, ...args)`
4. `async lianeAPI(id, username, options = {})`
5. `async fetch(entryUrl, entryOptions = {})`
6. `reply(msg, thread, callback)`
7. `send(msg, thread, callback)`
8. `react(emoji, id, callback)`
9. `edit(msg, id, callback)`

These methods enable developers to easily integrate with Facebook Messenger events and build sophisticated chatbot interactions using the `Box` class.
```