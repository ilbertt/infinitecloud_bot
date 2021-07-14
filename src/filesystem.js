import { constants } from 'buffer';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { Markup } from 'telegraf';
import { fileActionPrefix, parentDirInlineButton, thisDirAction } from './constants.js';

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
    },
};

export class FileSystem{
    #fileSystem;
    #path;
    constructor(){
        this.#fileSystem=FILESYSTEM_INIT;
        this.#path='/';
    }

    getFileSystem(){
        return this.#fileSystem;
    }
    
    setFileSystem(fileSys){
        this.#fileSystem=fileSys;
    }

    getDirectory(){
        const currentPathPieces = this.#path.split('/')
        currentPathPieces.shift();   // remove first element because it's always: ''
        let currentDirectory = this.#fileSystem['/'];
        if(this.#path==='/')
            return currentDirectory;
        for (const piece of currentPathPieces) {
            currentDirectory = currentDirectory[piece];
        }
        return currentDirectory;
    }

    getDirectories() {
        const currentDirectory = this.getDirectory();
        const directories = [];
        for (const dir in currentDirectory) {
            directories.push(dir);
        }
        return directories;
    }

    async mkdir(ctx, directoryName) {
        const targetDirectory = this.getDirectory();
        targetDirectory[directoryName] = {'.': []};
        await this.storeFileSystem(ctx);
    }

    navigate(dir) {
        if (dir == '..'){
            const Path=this.#path.split('/');
            if (Path.length<3){
                this.#path="/"
            } else {
            Path.pop()
            this.#path=Path.join("/");
            }
        } else {
            if(this.#path!=='/')
                this.#path+="/";

            this.#path+=dir;
        }
    }

    setPath(Path){
        this.#path= Path ? Path : '/';;
    }

    getPath(){
        return this.#path;
    }

    resetPath() {
        this.#path="/";
    }

    async storeFileSystem(ctx) {
        ctx.session.filesystem = this;
        const id= await ctx.chat.id;
        fs.writeFileSync('filesystem'+id+'.json', JSON.stringify(this.#fileSystem));
        const rootMessage = await ctx.replyWithDocument({
            source: './filesystem'+id+'.json',
        });
        fs.unlinkSync('filesystem'+id+'.json');
        await unpinOldFilesystem(ctx);
        await ctx.pinChatMessage(rootMessage.message_id, {
            disable_notification: true,
        });
    };

    async initializeFileSystem (ctx){
        this.#fileSystem=FILESYSTEM_INIT;
        await this.storeFileSystem(ctx);
    };

    async saveFile(ctx, fileName, messageId){
        const targetDirectory = this.getDirectory();
        targetDirectory[fileName] = messageId;
        await this.storeFileSystem(ctx);
    };

    getParentDirectoryPath(){
        const pieces = this.#path.split('/').filter((piece) => piece !== '');
        pieces.pop();
        if (pieces.length === 0) {
            // we reached the root directory
            return '/';
        }
        return '/' + pieces.join('/') + '/';
    };

    getElementsInPath ( hideCurrentDirectory, showFiles){
        const currentDirectory = this.getDirectory();
        const directories = [];
        if (!hideCurrentDirectory) {
            directories.push({
                name: 'HERE',
                action: thisDirAction,
            });
        }
        const elements = Object.keys(currentDirectory);
        for (const element of elements) {
            if (element !== '.') {
                const isDirectory = !!currentDirectory[element]['.'];
                directories.push({
                    name: isDirectory ? '📁'+element : element,
                    action: isDirectory ? element : fileActionPrefix+currentDirectory[element],
                });
            }
        }
        return directories;
    };
    
    getKeyboardDirectories(hideCurrentDirectory = false, showFiles = false){
        const inlineKeyboardButtons = [];
        if (this.#path !== '/') {
            inlineKeyboardButtons.push([parentDirInlineButton]);
        }
        for (const element of this.getElementsInPath(hideCurrentDirectory, showFiles)) {
            inlineKeyboardButtons.push([Markup.button.callback(element.name, element.action)])
        }
        return inlineKeyboardButtons;
    };

}

const fileUrl = (filePath) =>
    `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

const unpinOldFilesystem = async (ctx) => {
    const chat = await ctx.getChat();
    const rootMessage = chat.pinned_message;
    console.log(rootMessage);
    if (rootMessage) {
        try {
            await ctx.unpinChatMessage(rootMessage.message_id);
        } catch (err) {}
    }
};

export const storeFileSystem = async (ctx, fileSystem) => {
    ctx.session.filesystem = fileSystem;
    const id=ctx.chat.id;
    fs.writeFileSync('filesystem'+id+'.json', JSON.stringify(fileSystem));
    const rootMessage = await ctx.replyWithDocument({
        source: './filesystem'+id+'.json',
    });
    fs.unlinkSync('filesystem'+id+'.json');
    await unpinOldFilesystem(ctx);
    await ctx.pinChatMessage(rootMessage.message_id, {
        disable_notification: true,
    });
};

export const initializeFileSystem = async (ctx) => {
    await storeFileSystem(ctx, FILESYSTEM_INIT);
};

const fetchFileSystemObj = async (ctx, rootMessage) => {
    const fileID = rootMessage.document.file_id;
    const file = await ctx.telegram.getFile(fileID);
    const fileURL = fileUrl(file.file_path);
    const fileData = await fetch(fileURL);
    const filesystem = await fileData.json();
    const fileSys= new FileSystem()
    fileSys.setFileSystem(filesystem);
    ctx.session.fileSystem = fileSys;
    return fileSys;
};

export const getFileSystem = async (ctx) => {
    const sessionFilesystem = ctx.session.fileSystem;
    if (!sessionFilesystem) {
        const chat = await ctx.getChat();
        const rootMessage = chat.pinned_message;
        console.log(rootMessage);
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

export const getElementsInPath = (fileSystem, path, hideCurrentDirectory, showFiles) => {
    path = path ? path : '/';
    const currentDirectory = getDirectory(fileSystem, path);
    const directories = [];
    if (!hideCurrentDirectory) {
        directories.push({
            name: 'HERE',
            action: thisDirAction,
        });
    }
    const elements = Object.keys(currentDirectory);
    for (const element of elements) {
        if (element !== '.') {
            const isDirectory = !!currentDirectory[element]['.'];
            directories.push({
                name: isDirectory ? '📁'+element : element,
                action: isDirectory ? element : fileActionPrefix+currentDirectory[element],
            });
        }
    }
    return directories;
};

export const getKeyboardDirectories = async (
    ctx,
    currentPath,
    hideCurrentDirectory = false,
    showFiles = false
) => {
    const fileSystem = await getFileSystem(ctx);
    const inlineKeyboardButtons = [];
    if (currentPath !== '/') {
        inlineKeyboardButtons.push([parentDirInlineButton]);
    }
    for (const element of getElementsInPath(fileSystem, currentPath, hideCurrentDirectory, showFiles)) {
        inlineKeyboardButtons.push([Markup.button.callback(element.name, element.action)])
    }
    return inlineKeyboardButtons;
};

export const getParentDirectoryPath = (path) => {
    const pieces = path.split('/').filter((piece) => piece !== '');
    pieces.pop();
    if (pieces.length === 0) {
        // we reached the root directory
        return '/';
    }
    return '/' + pieces.join('/') + '/';
};

export const mkdir = async (ctx, targetPath, directoryName) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, targetPath);
    targetDirectory[directoryName] = { '.': [] };
    await storeFileSystem(ctx, fileSystem);
};

export const saveFile = async (ctx, path, fileName, messageId) => {
    const fileSystem = await getFileSystem(ctx);
    const targetDirectory = getDirectory(fileSystem, path);
    targetDirectory[fileName] = messageId;
    await storeFileSystem(ctx, fileSystem);
};
