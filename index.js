import { Telegraf, Markup } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import * as dotenv from 'dotenv';

import * as filesystem from './src/filesystem.js';
import * as constants from './src/constants.js';
import * as helpers from './src/helpers.js';
dotenv.config();

const fileHandler = async (ctx, fileType) => {
    console.log('handling file of type:', fileType);
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.SAVE_FILE_ACTION;
    ctx.session.saveFileData = {
        messageId: ctx.message.message_id,
        extension: await helpers.getFileExtension(ctx, fileType),
    };
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath
    );
    ctx.replyWithMarkdown(
        `${constants.saveFileMessage}${constants.currentPathMessage}\`/\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
    return;
};

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
    return await fileHandler(ctx, 'photo');
});
bot.on('document', async (ctx) => {
    return await fileHandler(ctx, 'document');
});
bot.on('video', async (ctx) => {
    return await fileHandler(ctx, 'video');
});
bot.command('mkdir', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.MKDIR_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath
    );
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
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath,
        true,
        true
    );
    // inlineKeyboardButtons.push(mkdirInlineButton);
    ctx.replyWithMarkdown(`${constants.currentPathMessage}\`/\``, {
        parse_mode: 'Markdown',
        reply_markup: {
            ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
        },
    });
    return;
});

bot.command('rename_file', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.RENAME_FILE_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath,
        true,
        true
    );
    // inlineKeyboardButtons.push(mkdirInlineButton);
    ctx.replyWithMarkdown(`${constants.currentPathMessage}\`/\``, {
        parse_mode: 'Markdown',
        reply_markup: {
            ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
        },
    });
    return;
});

bot.command('delete_dir', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.DELETE_DIR_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath,
        true,
        true,
        true
    );
    ctx.replyWithMarkdown(
        `${constants.deleteDirMessage}${constants.currentPathMessage}\`/\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
    return;
});
bot.command('delete_file', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.DELETE_FILE_ACTION;
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath,
        true,
        true
    );
    ctx.replyWithMarkdown(
        `${constants.deleteFileMessage}${constants.currentPathMessage}\`/\``,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
            },
        }
    );
    return;
});
bot.command('filesystem', async (ctx) => {
    const chat = await ctx.getChat();
    const fileSystemMessage = chat.pinned_message;
    if (fileSystemMessage) {
        return ctx.replyWithMarkdown(`Chat id: \`${chat.id}\`\nFilesystem id: \`${fileSystemMessage.message_id}\``, {
            reply_to_message_id: fileSystemMessage.message_id,
        });
    }
    return ctx.reply(constants.fileSystemNotFound);
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
                ...Markup.inlineKeyboard([constants.backInlineButton])
                    .reply_markup,
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
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        newCurrentPath,
        action === constants.EXPLORER_ACTION,
        action === constants.EXPLORER_ACTION
    );

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
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        currentPath
    );

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
bot.action(constants.deleteAction, async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx); // format /parentDir/.../childDir/currentDir/
    const directoryName = currentPath.split('/').slice(0, -1).pop();
    const targetPath = currentPath.split(directoryName + '/')[0];

    console.log(targetPath, directoryName);
    await filesystem.deleteDirectory(ctx, targetPath, directoryName);
    ctx.session.action = null;
    ctx.session.currentPath = null;
    return ctx.replyWithMarkdown(
        `Directory *${directoryName}* at \`${targetPath}\` DELETED`
    );
});
bot.action(/^(.?$|[^\/].+)/, async (ctx) => {
    const action = ctx.session.action;
    const currentPath = helpers.getCurrentPath(ctx);
    const directory = ctx.callbackQuery.data;
    const newCurrentPath = currentPath + directory + '/';
    helpers.setCurrentPath(ctx, newCurrentPath);
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        newCurrentPath,
        action === constants.EXPLORER_ACTION ||
        action === constants.DELETE_DIR_ACTION ||
        action === constants.RENAME_FILE_ACTION,
        action === constants.EXPLORER_ACTION || 
        action === constants.DELETE_FILE_ACTION  || 
        action === constants.RENAME_FILE_ACTION,
        action === constants.DELETE_DIR_ACTION
    );

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
    const fileName = ctx.callbackQuery.data.split('/')[2];
    const action = ctx.session.action;
    const currentPath = helpers.getCurrentPath(ctx);
    console.log(action)
    if (action === constants.DELETE_FILE_ACTION) {
        await filesystem.deleteFile(ctx, currentPath, fileName);
        ctx.session.action = null;
        ctx.session.currentPath = null;
        return ctx.replyWithMarkdown(
            `File *${fileName}* at \`${currentPath}\` DELETED`
        )
    
    } else if (action === constants.RENAME_FILE_ACTION) {
        ctx.session.waitReply = constants.WAIT_FILE_NAME;
        ctx.session.file_to_rename=fileName;
        return ctx.replyWithMarkdown(
            `Rename *${fileName}* at \`${currentPath}\` \nInsert new name:`
        )
    }
    const fileMessageId = ctx.callbackQuery.data.split('/')[1];
    return await ctx.telegram.sendMessage(ctx.chat.id, 'requested file', {
        reply_to_message_id: fileMessageId,
    });
});
bot.on('text', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const waitReply = ctx.session.waitReply;
    const reply = ctx.message.text;
    const action = ctx.session.action;

    let message = 'Error';
    if (waitReply === constants.WAIT_FILE_NAME) {
            if (action=== constants.SAVE_FILE_ACTION) {
            const saveFileData = ctx.session.saveFileData;
            const messageId = saveFileData.messageId;
            const fileExtension = saveFileData.extension;
            const fileName = reply + fileExtension;
            await filesystem.saveFile(ctx, currentPath, fileName, messageId);
            ctx.session.saveFileData = null;
            message = `File *${fileName}* saved at \`${currentPath}\``;
        } else if (action === constants.RENAME_FILE_ACTION) {
            const oldFileName=ctx.session.file_to_rename;
            filesystem.renameFile(ctx, currentPath, oldFileName, reply)
            ctx.session.file_to_rename=null;
            message = `File *${oldFileName}* renamed at \`${currentPath}\``
        }
    } else if (waitReply === constants.WAIT_DIRECTORY_NAME) {
        await filesystem.mkdir(ctx, currentPath, reply);
        message = `Directory *${reply}* created at \`${currentPath}\``;
    }
    ctx.replyWithMarkdown(message);
    helpers.setCurrentPath(ctx, '/');
    ctx.session.waitReply = null;
    ctx.session.action = null;
    ctx.session.currentPath = null;
    return;
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
