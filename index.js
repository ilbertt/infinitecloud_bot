import { Telegraf, Markup } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import * as dotenv from 'dotenv';

import * as filesystem from './src/filesystem.js';
import * as constants from './src/constants.js';
import * as helpers from './src/helpers.js';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(Telegraf.log());
bot.use(new LocalSession({ storage: LocalSession.storageMemory }).middleware());

bot.start(async (ctx) => {
    let msg = 'Hello!\nWelcome on *Infinite Cloud*';
    const userFirstName = ctx.from.first_name;
    if (userFirstName) {
        msg = `Hello ${userFirstName}!\nWelcome on *Infinite Cloud*`;
    }
    ctx.replyWithMarkdown(msg);
    return await filesystem.initializeFileSystem(ctx);
});
bot.help((ctx) => ctx.reply('Help message'));
bot.on('photo', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.SAVE_FILE_ACTION;
    ctx.session.saveFileData = {
        messageId: ctx.message.message_id,
        extension: '.jpg',
    };
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, currentPath);
    // inlineKeyboardButtons.push(mkdirInlineButton);
    ctx.replyWithMarkdown(`${constants.saveFileMessage}${constants.currentPathMessage}\`/\``, {
        parse_mode: 'Markdown',
        reply_markup: {
            ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
        },
    });
    return;
});
bot.command('mkdir', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.MKDIR_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, currentPath);
    return ctx.reply(
        `${constants.createDirMessage}${constants.currentPathMessage}\`${currentPath}\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
});
bot.command('explorer', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.EXPLORER_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, currentPath, true, true);
    // inlineKeyboardButtons.push(mkdirInlineButton);
    ctx.replyWithMarkdown(`${constants.currentPathMessage}\`/\``, {
        parse_mode: 'Markdown',
        reply_markup: {
            ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
        },
    });
    return;
});
bot.action(constants.thisDirAction, async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const action = ctx.session.action;
    let message;
    if (action === constants.MKDIR_ACTION) {
        message = constants.askDirectoryNameMessage;
        ctx.session.waitReply = constants.WAIT_DIRECTORY_NAME;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.askFileNameMessage;
        ctx.session.waitReply = constants.WAIT_FILE_NAME;
    }
    return ctx.editMessageText(
        `${message}${constants.currentPathMessage}\`${currentPath}\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard([constants.backInlineButton]).reply_markup,
                force_reply: true,
            },
        }
    );
});
bot.action(constants.parentDirAction, async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const action = ctx.session.action;
    const newCurrentPath = filesystem.getParentDirectoryPath(currentPath);
    helpers.setCurrentPath(ctx, newCurrentPath);
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, newCurrentPath, action === constants.EXPLORER_ACTION);

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    }

    return ctx.editMessageText(
        `${message}${constants.currentPathMessage}\`${newCurrentPath}\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
});
bot.action(constants.backAction, async (ctx) => {
    const action = ctx.session.action;
    const currentPath = helpers.getCurrentPath(ctx);
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, currentPath);

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    }

    ctx.session.waitReply = null;

    return ctx.editMessageText(
        `${message}${constants.currentPathMessage}\`${currentPath}\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
});
bot.action(/^(.?$|[^\/].+)/, async (ctx) => {
    const action = ctx.session.action;
    const currentPath = helpers.getCurrentPath(ctx);
    const directory = ctx.callbackQuery.data;
    const newCurrentPath = currentPath + directory + '/';
    helpers.setCurrentPath(ctx, newCurrentPath);
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(ctx, newCurrentPath, action === constants.EXPLORER_ACTION);

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    }

    return ctx.editMessageText(
        `${message}${constants.currentPathMessage}\`${newCurrentPath}\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
});
bot.action(/^\//, async (ctx) => {
    const fileMessageId = ctx.callbackQuery.data.substring(1);
    return await ctx.telegram.sendMessage(ctx.chat.id, 'requested file', {
        reply_to_message_id: fileMessageId,
    });
});
bot.on('text', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const waitReply = ctx.session.waitReply;
    const reply = ctx.message.text;

    let message = 'Error';
    if (waitReply === constants.WAIT_FILE_NAME) {
        const saveFileData = ctx.session.saveFileData;
        const messageId = saveFileData.messageId;
        const fileExtension = saveFileData.extension;
        await filesystem.saveFile(ctx, currentPath, reply+fileExtension, messageId);
        ctx.session.saveFileData = null;
        message = `File *${reply}* saved at \`${currentPath}\``;
    } else if (waitReply === constants.WAIT_DIRECTORY_NAME) {
        await filesystem.mkdir(ctx, currentPath, reply);
        message = `Directory *${reply}* created at \`${currentPath}\``;
    }
    ctx.replyWithMarkdown(message);
    helpers.setCurrentPath(ctx, '/');
    ctx.session.waitReply = null;
    ctx.session.action = null;
    ctx.unpinChatMessage()
    return;
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
