# Infinite Cloud Bot
As Telegram offers unlimited cloud storage, it lacks of the main characteristics of the cloud services: folders structure, file names, etc.
Here comes the [Infinite Cloud Bot](https://t.me/infinitecloud_bot)! This bot simply keeps track of your files using a `json` file as the "filesystem", _without saving anything outside of the chat_ and so preserving your privacy.

## Usage
### Use the bot
Just start a chat with [@infinitecloud_bot](https://t.me/infinitecloud_bot) on Telegram! You'll find more usage instructions at [BOT_HELP.md](res/BOT_HELP.md) or at [/help]() command in the bot chat.

### Run the bot on your server
#### Prerequisites
Make sure you have `Node.js (14.x)` and `npm` installed, you have created a Telegram Bot ([instructions](https://core.telegram.org/bots#3-how-do-i-create-a-bot)) and obtained a Telegram Bot API token.
#### Install & Run
1. `git clone https://github.com/Luca8991/infinitecloud_bot.git`
2. `cd infinitecloud_bot`
3. create a file named `.env` and add this line inside:
```
BOT_TOKEN=<your-telegram-bot-api-token>
```
4. `npm install` (to install all dependencies)
5. run with: `node index.js`

### Use as javascript package
1. `npm install https://github.com/Luca8991/infinitecloud_bot` or clone this repo and install locally (`npm install /path/to/cloned/repo`)
2. import it:
```javascript
// other require statements
const {infiniteCloudBot, setBotToken} = require("infinitecloud_bot");
// your code
```
3. create a Telegram Bot and get your API token ([instructions](https://core.telegram.org/bots#3-how-do-i-create-a-bot)) and set it **before calling any other bot's method**:
```javascript
setBotToken('<your-api-bot-token>');
```
4. use `infiniteCloudBot` class, which is simply a wrapper around [telegraf's bot class](https://telegraf.js.org/classes/telegraf.html).

## How it works
As mentioned above, the bot keeps track of your files using a "filesystem", which is a `json` file. To preserve your privacy, the filesystem file is stored **ONLY** in the chat.
As soon as you start the chat, the bot sends you [this](res/initialFilesystem.json) file, which contains a predefined filesystem that you can change on your needs using the bot commands ([/mkdir](), [/rename_file](), [/move_file](), etc.).
Whenever you make a change to the files, the bot fetches the filesystem from the chat, updates it and sends it again to the chat.
### Filesystem structure
The filesystem has 2 main elements:
- **Directory**, an object with this structure:

| Property | Description | Required |
|--|--|--|
| . | _array of Files_ | yes |
| "nested-directory-name" | _Directory_ | no |
| "another-nested-directory-name" | _Directory_ | no |
...

- **File**, an object with this properties:

| Property | Description | Required |
|--|--|--|
| name | _string_: name of the file, including its extension | yes |
| messageId | _number_: id of the chat message that contains this file | yes |
| createdAt | _number_: timestamp of when the file was added to the filesystem | yes |

The entire filesystem is contained inside the **Root** (`"/"`) directory, whose name isn't editable.

---
So, an example of a filesystem (as found in [initialFilesystem.json](res/initialFilesystem.json) file) is:
```javascript
{
    "/": {
        ".": [
            {
                "name": "thisisafile.txt",
                "messageId": 0,
                "createdAt": 1555555555
            },
            // other files
        ],
        "directory1": {
            ".": [
                // some files
            ],
            "nested_directory1": {
                ".": [
                    {
                        "name": "thisisanotherfile.txt",
                        "messageId": 1,
                        "createdAt": 1555555554
                    },
                    // other files
                ],
                // other nested directories
            },
            "nested_directory2": {
                ".": [
                    // some files
                ],
                // other nested directories
            },
        },
        "directorty2": {
            ".": [],
            // other nested directories
        },
        // other directories
    }
}
```

## Dashboard
There's also a web app available at [https://infinitecloud-website-api.web.app/](https://infinitecloud-website-api.web.app/) and hosted on [Firebase](https://firebase.google.com/), where you can view your files (you _can't_ upload or download them from there). Source code available at [Luca8991/infinite-cloud-website](https://github.com/Luca8991/infinite-cloud-website).

## Contribute
If you want to improve this bot, feel free to open issues and/or pull requests.

_Let's make this bot better, so that anyone can have free INFINITE cloud storage!_