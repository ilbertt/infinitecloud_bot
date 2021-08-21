const fs = require('fs');
const request = require('request');
const { Markup } = require('telegraf');
const {
    deleteInlineButton,
    fileActionPrefix,
    parentDirInlineButton,
    thisDirAction,
} = require('./constants.js');

//const fileSystemMessage = 'FILESYSTEM - DO NOT DELETE, EDIT OR UNPIN THIS MESSAGE\n';
const FILESYSTEM_INIT = {
    '/': {
        '.': [],
        Documents: {
            '.': [],
        },
        Pictures: {
            '.': [],
        },
        Videos: {
            '.': [],
        },
        Music: {
            '.': [],
        },
        Trash: {
            '.': [],
        },
    },
};

const unpinOldFilesystem = async (ctx) => {
    const chat = await ctx.getChat();
    const rootMessage = chat.pinned_message;
    // console.log(rootMessage);
    if (rootMessage) {
        try {
            await ctx.unpinChatMessage(rootMessage.message_id);
        } catch (err) {}
    }
};

const storeFileSystem = async (ctx, fileSystem) => {
    const chatId = ctx.chat.id;
    ctx.session.filesystem = fileSystem;
    fs.writeFileSync(`filesystem${chatId}.json`, JSON.stringify(fileSystem));
    const rootMessage = await ctx.replyWithDocument({
        source: `./filesystem${chatId}.json`,
    });
    fs.unlinkSync(`filesystem${chatId}.json`);
    try {
        await unpinOldFilesystem(ctx);
    } catch (err) {
        console.log(err);
    }
    await ctx.pinChatMessage(rootMessage.message_id, {
        disable_notification: true,
    });
};

const initializeFileSystem = async (ctx) => {
    await storeFileSystem(ctx, FILESYSTEM_INIT);
};

const fetchFileSystemObj = async (ctx, rootMessage) => {
    const fileID = rootMessage.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileID);
    return new Promise((resolve, reject) => {
        request.get(fileLink.href, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
            }
            const fileSystem = JSON.parse(body);
            ctx.session.filesystem = fileSystem;
            resolve(fileSystem);
        });
    });
};

const restoreFilesystem = async (ctx) => {
    await unpinOldFilesystem(ctx);
    await ctx.pinChatMessage(ctx.message.message_id, {
        disable_notification: true,
    });
    await fetchFileSystemObj(ctx, ctx.message);
};

const getFileSystem = async (ctx) => {
    const sessionFilesystem = ctx.session.filesystem;
    if (!sessionFilesystem) {
        const chat = await ctx.getChat();
        const rootMessage = chat.pinned_message;
        if (rootMessage) {
            return await fetchFileSystemObj(ctx, rootMessage);
        }
        return await ctx.reply('Cannot find root message');
    }
    return sessionFilesystem;
};

const getDirectory = (fileSystem, path) => {
    const currentPathPieces = path.split('/').filter((piece) => piece !== ''); // remove '' elements
    let currentDirectory = fileSystem['/'];
    for (const piece of currentPathPieces) {
        currentDirectory = currentDirectory[piece];
    }
    return currentDirectory;
};

const getElementsInPath = (
    fileSystem,
    path,
    hideCurrentDirectory,
    showFiles
) => {
    path = path ? path : '/';
    const currentDirectory = getDirectory(fileSystem, path);
    const elements = [];
    if (!hideCurrentDirectory) {
        elements.push({
            name: 'HERE',
            action: thisDirAction,
        });
    }
    const directories = Object.keys(currentDirectory);
    for (const dir of directories) {
        if (dir !== '.') {
            elements.push({
                name: '📁' + dir,
                // action format:
                // DIRECTORY: directory name
                action: dir,
            });
        }
    }
    if (showFiles) {
        const files = currentDirectory['.'];
        for (const f of files) {
            elements.push({
                name: f.name,
                // action format:
                // FILE: '/'+messageId+'/'+filename
                action:
                    fileActionPrefix + f.messageId + fileActionPrefix + f.name,
            });
        }
    }
    return elements;
};

const getKeyboardDirectories = async (
    ctx,
    currentPath,
    hideCurrentDirectory = false,
    showFiles = false,
    showDeleteDirButton = false
) => {
    const fileSystem = await getFileSystem(ctx);
    const inlineKeyboardButtons = [];
    if (currentPath !== '/') {
        inlineKeyboardButtons.push([parentDirInlineButton]);
        if (showDeleteDirButton) {
            inlineKeyboardButtons.push([deleteInlineButton]);
        }
    }
    for (const element of getElementsInPath(
        fileSystem,
        currentPath,
        hideCurrentDirectory,
        showFiles
    )) {
        inlineKeyboardButtons.push([
            Markup.button.callback(element.name, element.action),
        ]);
    }
    return inlineKeyboardButtons;
};

const getParentDirectoryPath = (path) => {
    const pieces = path.split('/').filter((piece) => piece !== '');
    pieces.pop();
    if (pieces.length === 0) {
        // we reached the root directory
        return '/';
    }
    return '/' + pieces.join('/') + '/';
};

const mkdir = async (ctx, targetPath, directoryName) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, targetPath);
    targetDirectory[directoryName] = { '.': [] };
    await storeFileSystem(ctx, fileSystem);
};

const saveFile = async (ctx, path, fileName, messageId) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, path);
    for (const file in targetDirectory['.']) {
        if (targetDirectory['.'][file]['name'] === fileName) {
            targetDirectory['.'][file]['messageId'] = messageId;
            targetDirectory['.'][file]['createdAt'] = new Date().getTime();
            await storeFileSystem(ctx, fileSystem);
            return;
        }
    }
    targetDirectory['.'].push({
        name: fileName,
        messageId,
        createdAt: new Date().getTime(),
    });
    await storeFileSystem(ctx, fileSystem);
};

const deleteDirectory = async (ctx, path, directoryName) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, path);
    const directoryContent = targetDirectory[directoryName];
    fileSystem['/']['Trash'][directoryName] = directoryContent;
    delete targetDirectory[directoryName];
    // console.log(fileSystem, fileSystem['/']['Trash']);
    await storeFileSystem(ctx, fileSystem);
};

const deleteFile = async (ctx, path, fileName) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, path);
    const fileContent = {...targetDirectory['.'].find((f) => f.name === fileName)};
    if (fileContent) {
        fileSystem['/']['Trash']['.'].push(fileContent);
    }
    targetDirectory['.'] = targetDirectory['.'].filter(
        (f) => f.name !== fileName
    );
    await storeFileSystem(ctx, fileSystem);
    return fileContent;
};

const renameFile = async (ctx, path, oldFileName, newFilename) => {
    const fileExtension = oldFileName.split('.').pop();
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, path);
    const fileContent = targetDirectory['.'].find(
        (f) => f.name === oldFileName
    );
    // console.log(fileContent, oldFileName, path);
    fileContent['name'] = newFilename + '.' + fileExtension;
    await storeFileSystem(ctx, fileSystem);
};

const moveFile = async (ctx, oldPath, newPath, fileName) => {
    const fileSystem = await getFileSystem(ctx);
    const sourceDirectory = getDirectory(fileSystem, oldPath);
    const targetDirectory = getDirectory(fileSystem, newPath);
    const fileContent = sourceDirectory['.'].find((f) => f.name === fileName);
    targetDirectory['.'].push(fileContent);
    sourceDirectory['.'] = sourceDirectory['.'].filter(
        (f) => f.name !== fileName
    );
    await storeFileSystem(ctx, fileSystem);
};

module.exports = {
    storeFileSystem,
    initializeFileSystem,
    getFileSystem,
    restoreFilesystem,
    getElementsInPath,
    getKeyboardDirectories,
    getParentDirectoryPath,
    mkdir,
    saveFile,
    deleteDirectory,
    deleteFile,
    renameFile,
    moveFile,
};
