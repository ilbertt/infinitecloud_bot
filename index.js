const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');

const filesystem = require('./src/filesystem.js');
const constants = require('./src/constants.js');
const helpers = require('./src/helpers.js');

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
    await ctx.replyWithMarkdown(
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

const getGenericErrorWithCommands = async (ctx) => {
    const commands = await ctx.getMyCommands();
    const availableCommands = commands.map(cmd => `/${cmd.command} - ${cmd.description}`).join('\n');
    return `${constants.genericError}\n${availableCommands}`;
};

const bot = new Telegraf('');
// bot.use(Telegraf.log());
bot.use(new LocalSession({ storage: LocalSession.storageMemory }).middleware());

bot.start(async (ctx) => {
    let msg = 'Hello!\nWelcome on *Infinite Cloud*';
    const userFirstName = ctx.from.first_name;
    if (userFirstName) {
        msg = `Hello ${userFirstName}!\nWelcome on *Infinite Cloud*`;
    }
    const botHelp = helpers.getHelpMessage();
    msg = msg + `\n-----\nHere's some help to start:\n${botHelp}`;
    ctx.replyWithMarkdown(msg);
    return await filesystem.initializeFileSystem(ctx);
});
bot.help((ctx) => {
    return ctx.replyWithMarkdown(helpers.getHelpMessage());;
});
bot.command('info', (ctx) => {
    return ctx.replyWithMarkdown(constants.botInfo);
});

/* FILE HANDLERS */
bot.on('animation', async (ctx) => {
    return await fileHandler(ctx, 'animation');
});
bot.on('audio', async (ctx) => {
    return await fileHandler(ctx, 'audio');
});
bot.on('contact', async (ctx) => {
    return await fileHandler(ctx, 'contact');
});
bot.on('document', async (ctx) => {
    if (ctx.session.action === constants.RESTORE_FILESYSTEM_ACTION) {
        try {
            await filesystem.restoreFilesystem(ctx);
            return ctx.reply(constants.fileSystemRestoredSuccess, {
                reply_to_message_id: ctx.message.message_id,
            });
        } catch (e) {
            console.log(e);
            return ctx.reply(constants.fileSystemRestoredError);
        }
    }
    return await fileHandler(ctx, 'document');
});
bot.on('location', async (ctx) => {
    return await fileHandler(ctx, 'location');
});
bot.on('photo', async (ctx) => {
    return await fileHandler(ctx, 'photo');
});
bot.on('poll', async (ctx) => {
    return await fileHandler(ctx, 'poll');
});
bot.on('sticker', async (ctx) => {
    return await fileHandler(ctx, 'sticker');
});
bot.on('video', async (ctx) => {
    return await fileHandler(ctx, 'video');
});
bot.on('video_note', async (ctx) => {
    return await fileHandler(ctx, 'video_note');
});
bot.on('voice', async (ctx) => {
    return await fileHandler(ctx, 'voice');
});
/* --- */

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

bot.command('move_file', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    ctx.session.action = constants.SELECT_MOVE_FILE_ACTION;
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
        return ctx.replyWithMarkdown(
            `Chat id: \`${chat.id}\`\nFilesystem id: \`${fileSystemMessage.message_id}\``,
            {
                reply_to_message_id: fileSystemMessage.message_id,
            }
        );
    }
    return ctx.reply(constants.fileSystemNotFound);
});
bot.command('restore_filesystem', async (ctx) => {
    ctx.session.action = constants.RESTORE_FILESYSTEM_ACTION;
    return ctx.reply(constants.restoreFilesystemMessage);
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
    } else if (action === constants.MOVE_FILE_ACTION) {
        const sourcePath = ctx.session.oldPath;
        const fileName = ctx.session.fileToHandle;
        filesystem.moveFile(ctx, sourcePath, currentPath, fileName);
        ctx.session.action = null;
        ctx.session.fileToHandle = null;
        ctx.session.oldPath = null;
        ctx.session.currentPath = null;
        return ctx.replyWithMarkdown(
            `Moved *${fileName}*\nfrom \`${sourcePath}\`\nto \`${currentPath}\``
        );
    }
    if (message) {
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
    } else {
        return ctx.reply(await getGenericErrorWithCommands(ctx));
    }
});
bot.action(constants.parentDirAction, async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const action = ctx.session.action;
    const newCurrentPath = filesystem.getParentDirectoryPath(currentPath);
    helpers.setCurrentPath(ctx, newCurrentPath);
    const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
        ctx,
        newCurrentPath,
        action !== constants.SAVE_FILE_ACTION && action !== constants.MKDIR_ACTION && action !== constants.MOVE_FILE_ACTION,
        action !== constants.SAVE_FILE_ACTION && action !== constants.MKDIR_ACTION && action !== constants.MOVE_FILE_ACTION
    );

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    } else if (action === constants.DELETE_FILE_ACTION) {
        message = constants.deleteFileMessage;
    } else if (action === constants.DELETE_DIR_ACTION) {
        message = constants.deleteDirMessage;
    }

    if (message || action === constants.EXPLORER_ACTION) {
        return ctx.editMessageText(
            `${message}${constants.currentPathMessage}\`${newCurrentPath}\``,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
                },
            }
        );
    } else {
        return ctx.reply(await getGenericErrorWithCommands(ctx));
    }
});
bot.action(constants.backAction, async (ctx) => {
    const action = ctx.session.action;

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    }

    ctx.session.waitReply = null;

    if (message) {
        const currentPath = helpers.getCurrentPath(ctx);
        const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
            ctx,
            currentPath
        );
        return ctx.editMessageText(
            `${message}${constants.currentPathMessage}\`${currentPath}\``,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    ...Markup.inlineKeyboard(inlineKeyboardButtons).reply_markup,
                },
            }
        );
    } else {
        return ctx.reply(await getGenericErrorWithCommands(ctx));
    }
});
bot.action(constants.deleteAction, async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx); // format /parentDir/.../childDir/currentDir/
    const directoryName = currentPath.split('/').slice(0, -1).pop();
    const targetPath = currentPath.split(directoryName + '/')[0];

    // console.log(targetPath, directoryName);
    await filesystem.deleteDirectory(ctx, targetPath, directoryName);
    ctx.session.action = null;
    ctx.session.currentPath = null;
    return ctx.replyWithMarkdown(
        `Directory *${directoryName}* at \`${targetPath}\` DELETED`
    );
});
bot.action(/^(.?$|[^\/].+)/, async (ctx) => {
    // DIRECTORY action
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
            action === constants.RENAME_FILE_ACTION ||
            action === constants.SELECT_MOVE_FILE_ACTION,
        action === constants.EXPLORER_ACTION ||
            action === constants.DELETE_FILE_ACTION ||
            action === constants.RENAME_FILE_ACTION ||
            action === constants.SELECT_MOVE_FILE_ACTION,
        action === constants.DELETE_DIR_ACTION
    );

    let message = '';
    if (action === constants.MKDIR_ACTION) {
        message = constants.createDirMessage;
    } else if (action === constants.SAVE_FILE_ACTION) {
        message = constants.saveFileMessage;
    } else if (action === constants.MOVE_FILE_ACTION) {
        message = `${constants.moveFileMessage}*${ctx.session.fileToHandle}*\n`;
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
    // FILE action
    const action = ctx.session.action;
    const currentPath = helpers.getCurrentPath(ctx);
    const fileMessageId = ctx.callbackQuery.data.split('/')[1];
    const fileName = (await filesystem.getFile(ctx, currentPath, fileMessageId)).name;
    console.log('File action:', action);
    if (action === constants.DELETE_FILE_ACTION) {
        const deletedFile = await filesystem.deleteFile(ctx, currentPath, fileMessageId);
        ctx.session.action = null;
        ctx.session.currentPath = null;
        const message = `File *${fileName}* at \`${currentPath}\` DELETED`;
        if (currentPath.startsWith('/Trash')) {
            return ctx.replyWithMarkdown(
                `${message}\n\nHere's the file, in case you want to *DELETE IT FOREVER* from this chat or *RESTORE* it by forwarding it again to this chat.`,
                {
                    reply_to_message_id: deletedFile.messageId,
                }
            );
        }
        return ctx.replyWithMarkdown(message);
    } else if (action === constants.RENAME_FILE_ACTION) {
        ctx.session.waitReply = constants.WAIT_FILE_NAME;
        ctx.session.fileToHandle = fileName;
        return ctx.replyWithMarkdown(
            `Rename *${fileName}* at \`${currentPath}\` \nInsert new name:`
        );
    } else if (action === constants.SELECT_MOVE_FILE_ACTION) {
        ctx.session.fileToHandle = fileName;
        ctx.session.oldPath = currentPath;
        ctx.session.action = constants.MOVE_FILE_ACTION;
        const message = constants.moveFileMessage + fileName + '\n';
        const inlineKeyboardButtons = await filesystem.getKeyboardDirectories(
            ctx,
            currentPath
        );
        return ctx.editMessageText(
            `${message}${constants.currentPathMessage}\`${currentPath}\``,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    ...Markup.inlineKeyboard(inlineKeyboardButtons)
                        .reply_markup,
                },
            }
        );
    } else if (action === constants.EXPLORER_ACTION) {
        try {
            if (fileMessageId) {
                return await ctx.telegram.sendMessage(ctx.chat.id, `File: *${fileName}*\nPath: \`${currentPath}\``, {
                    parse_mode: 'Markdown',
                    reply_to_message_id: fileMessageId,
                });
            } else {
                throw new Error('File message not found');
            }
        } catch (err) {
            return await ctx.reply('Error: ' + err.message);
        }
    }
});
bot.on('text', async (ctx) => {
    const currentPath = helpers.getCurrentPath(ctx);
    const waitReply = ctx.session.waitReply;
    const reply = ctx.message.text;
    const action = ctx.session.action;

    if(waitReply) {
        let message = 'Error';
        if (reply.includes(constants.fileActionPrefix)) {
            message = `Names cannot include *${constants.fileActionPrefix}* character.\nRetry`;
        } else {
            if (waitReply === constants.WAIT_FILE_NAME) {
                if (action === constants.SAVE_FILE_ACTION) {
                    const saveFileData = ctx.session.saveFileData;
                    const messageId = saveFileData.messageId;
                    const fileExtension = saveFileData.extension;
                    const fileName = reply + fileExtension;
                    await filesystem.saveFile(ctx, currentPath, fileName, messageId);
                    ctx.session.saveFileData = null;
                    message = `File *${fileName}* saved at \`${currentPath}\``;
                } else if (action === constants.RENAME_FILE_ACTION) {
                    const oldFileName = ctx.session.fileToHandle;
                    filesystem.renameFile(ctx, currentPath, oldFileName, reply);
                    ctx.session.fileToHandle = null;
                    const fileExtension = oldFileName.split('.').pop();
                    message = `File *${oldFileName}* renamed.\nNew name: *${reply}.${fileExtension}*\nPath: \`${currentPath}\``;
                }
            } else if (waitReply === constants.WAIT_DIRECTORY_NAME) {
                await filesystem.mkdir(ctx, currentPath, reply);
                message = `Directory *${reply}* created at \`${currentPath}\``;
            }
            helpers.setCurrentPath(ctx, '/');
            ctx.session.waitReply = null;
            ctx.session.action = null;
        }
        return await ctx.replyWithMarkdown(message);
    } else {
        return await fileHandler(ctx, 'text');
    }
});

bot.on('pinned_message', async (ctx) => {
    if (ctx.message.from.id !== ctx.botInfo.id) {
        return ctx.replyWithMarkdown(constants.pinnedMessageAlert(ctx.chat.id));
    }
});

bot.catch((err, ctx) => {
	return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const setBotToken = (token) => {
    bot.telegram.token = token;
};

if (require.main === module) {
    const dotenv = require('dotenv');
    dotenv.config();

    setBotToken(process.env.BOT_TOKEN);
    bot.launch();
}

module.exports.setBotToken = setBotToken;
module.exports.infiniteCloudBot = bot;