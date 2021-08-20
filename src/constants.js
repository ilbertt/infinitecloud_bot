const { Markup } = require('telegraf');

const dashboardUrl = 'https://infinitecloud-website-api.web.app/';

/* ACTIONS */
const thisDirAction = '.';
const parentDirAction = '..';
const mkdirAction = 'mkdir';
const cancelAction = 'cancel';
const backAction = 'back';
const deleteAction = 'delete';
const SAVE_FILE_ACTION = 'save-file-action';
const MKDIR_ACTION = 'mkdir-action';
const WAIT_DIRECTORY_NAME = 'wait-directory-name';
const WAIT_FILE_NAME = 'wait-file-name';
const EXPLORER_ACTION = 'explorer-action';
const DELETE_DIR_ACTION = 'delete-dir-action';
const DELETE_FILE_ACTION = 'delete-file-action';
const RENAME_FILE_ACTION = 'rename-file-action';
const SELECT_MOVE_FILE_ACTION = 'select-move-file-action';
const MOVE_FILE_ACTION = 'move-file-action';
const fileActionPrefix = '/';

/* SYSTEM MESSAGES */
const currentPathMessage = 'CURRENT PATH:\n';
const saveFileMessage = 'SAVE FILE:\n';
const createDirMessage = 'CREATE DIRECTORY:\n';
const askDirectoryNameMessage = 'Input DIRECTORY name:\n';
const askFileNameMessage = 'Input FILE name:\n';
const deleteDirMessage = 'DELETE DIRECTORY:\n';
const deleteFileMessage = 'DELETE FILE:\n';
const moveFileMessage = 'MOVE FILE:\n';

const fileSystemNotFound = 'Filesystem not found';
const genericError = 'Error!\nUse one of the available commands instead:';

/* INLINE BUTTONS */
const mkdirInlineButton = Markup.button.callback(
    '+ New Directory',
    mkdirAction
);
const parentDirInlineButton = Markup.button.callback('..', parentDirAction);
const thisDirInlineButton = Markup.button.callback('.', thisDirAction);
const cancelOperationInlineButton = Markup.button.callback(
    'Cancel',
    cancelAction
);
const backInlineButton = Markup.button.callback('<< Back', backAction);
const deleteInlineButton = Markup.button.callback(
    '🗑️ DELETE THIS DIR',
    deleteAction
);

module.exports = {
    dashboardUrl,

    thisDirAction,
    parentDirAction,
    mkdirAction,
    cancelAction,
    backAction,
    deleteAction,
    SAVE_FILE_ACTION,
    MKDIR_ACTION,
    WAIT_DIRECTORY_NAME,
    WAIT_FILE_NAME,
    EXPLORER_ACTION,
    DELETE_DIR_ACTION,
    DELETE_FILE_ACTION,
    RENAME_FILE_ACTION,
    SELECT_MOVE_FILE_ACTION,
    MOVE_FILE_ACTION,
    fileActionPrefix,

    currentPathMessage,
    saveFileMessage,
    createDirMessage,
    askDirectoryNameMessage,
    askFileNameMessage,
    deleteDirMessage,
    deleteFileMessage,
    moveFileMessage,

    fileSystemNotFound,
    genericError,

    mkdirInlineButton,
    parentDirInlineButton,
    thisDirInlineButton,
    cancelOperationInlineButton,
    backInlineButton,
    deleteInlineButton,
};
