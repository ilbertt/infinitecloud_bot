import { Markup } from 'telegraf';

/* ACTIONS */
export const thisDirAction = '.';
export const parentDirAction = '..';
export const mkdirAction = 'mkdir';
export const cancelAction = 'cancel';
export const backAction = 'back';
export const SAVE_FILE_ACTION = 'save-file-action';
export const MKDIR_ACTION = 'mkdir-action';
export const WAIT_DIRECTORY_NAME = 'wait-directory-name';
export const WAIT_FILE_NAME = 'wait-file-name';
export const EXPLORER_ACTION = 'explorer-action';
export const fileActionPrefix = '/';

/* SYSTEM MESSAGES */
export const currentPathMessage = 'CURRENT PATH:\n';
export const saveFileMessage = 'SAVE FILE:\n';
export const createDirMessage = 'CREATE DIRECTORY:\n';
export const askDirectoryNameMessage = 'Input DIRECTORY name:\n';
export const askFileNameMessage = 'Input FILE name:\n';

/* INLINE BUTTONS */
export const mkdirInlineButton = Markup.button.callback(
    '+ New Directory',
    mkdirAction
);
export const parentDirInlineButton = Markup.button.callback('..', parentDirAction);
export const thisDirInlineButton = Markup.button.callback('.', thisDirAction);
export const cancelOperationInlineButton = Markup.button.callback(
    'Cancel',
    cancelAction
);
export const backInlineButton = Markup.button.callback('<< Back', backAction);