const { Markup } = require('telegraf');

const dashboardUrl = 'https://infinitecloud-website-api.web.app/';
const githubUrl = 'https://github.com/Luca8991/infinitecloud_bot';
const botInfo = `*Infinite Cloud Bot* - infinite free cloud storage on Telegram\n\nUsage instructions: /help\nDashboard: ${dashboardUrl}\n\nMore info and source code: [${githubUrl}](${githubUrl})`;

/* ACTIONS */
const thisDirAction = '.';
const parentDirAction = '..';
const mkdirAction = 'mkdir';
const cancelAction = 'cancel';
const backAction = 'back';
const deleteDirAction = 'delete-dir';
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
const RESTORE_FILESYSTEM_ACTION = 'restore-filesystem-action';
const fileActionPrefix = '/';

/* INLINE BUTTONS */
const thisDirButtonText = 'HERE';
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
    deleteDirAction
);

/* SYSTEM MESSAGES */
const currentPathMessage = 'CURRENT PATH:\n';

const saveFileMessage = `\nNavigate to the directory in which you want to SAVE the file and click _${thisDirButtonText}_`;
const deleteFileMessage = '\nSelect the file you want to DELETE';
const selectMoveFileMessage = '\nSelect the file you want to MOVE';
const moveFileMessage = (fileName) => `File to MOVE:\n*${fileName}*\nSelect the directory in which you want to move the file and click _${thisDirButtonText}_`;
const renameFileMessage = '\nSelect the file you want to RENAME';
const deletedFileFromTrash = `Here's the file, in case you want to *DELETE IT FOREVER* from this chat or *RESTORE* it by sending it again to this chat.`;

const askFileNameMessage = '\nSend me the new FILE name';
const askRenameFileName = (fileName, currentPath) => `RENAME *${fileName}* at \`${currentPath}\`\n\nSend me the new name:`;
const askDirectoryNameMessage = '\nSend me the new DIRECTORY name';

const createDirMessage = `\nNavigate to the directory in which you want to CREATE the new directory and click _${thisDirButtonText}_`;
const deleteDirMessage = '\nSelect the directory you want to DELETE';

const explorerFileMessage = (fileName, currentPath) => `File: *${fileName}*\nPath: \`${currentPath}\``;
const savedFileSuccess = (fileName, currentPath) => `File *${fileName}* SAVED at \`${currentPath}\``;
const deletedFileSuccess = (fileName, currentPath) => `File *${fileName}* at \`${currentPath}\` DELETED`;
const renamedFileSuccess = (oldFileName, newFilename, currentPath) => `File *${oldFileName}* RENAMED.\nNew name: *${newFilename}*\nPath: \`${currentPath}\``;
const movedFileSuccess = (fileName, previousPath, currentPath) => `MOVED *${fileName}*\nFrom: \`${previousPath}\`\nTo: \`${currentPath}\``;

const createdDirectorySuccess = (dirName, currentPath) => `Directory *${dirName}* CREATED at \`${currentPath}\``;
const deletedDirectorySuccess = (dirName, currentPath) => `Directory *${dirName}* at \`${currentPath}\` DELETED`;


const restoreFilesystemMessage = 'Now send me the filesystem JSON file';
const fileSystemNotFound = 'Filesystem not found';
const fileSystemRestoredSuccess = 'Filesystem restored from this file.';
const fileSystemRestoredError = 'Cannot restore filesystem.';
const filesystemInfoMessage = (chatId, filesystemMessageId) => `Chat id: \`${chatId}\`\nFilesystem id: \`${filesystemMessageId}\``;

const explorerFileError = 'File message not found';
const genericError = 'Error!\nUse one of the available commands instead:';

const forbiddenCharacterAlert = `Names cannot include *${fileActionPrefix}* character.\nRetry`;
const pinnedMessageAlert = (chatId) =>
    `Please, make sure that the *last* pinned message is always the \`filesystem${chatId}.json\` file, otherwise _the bot won't work_!`;

module.exports = {
    dashboardUrl,
    githubUrl,
    botInfo,

    thisDirAction,
    parentDirAction,
    mkdirAction,
    cancelAction,
    backAction,
    deleteDirAction,
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
    RESTORE_FILESYSTEM_ACTION,
    fileActionPrefix,

    thisDirButtonText,
    mkdirInlineButton,
    parentDirInlineButton,
    thisDirInlineButton,
    cancelOperationInlineButton,
    backInlineButton,
    deleteInlineButton,

    currentPathMessage,

    saveFileMessage,
    deleteFileMessage,
    selectMoveFileMessage,
    moveFileMessage,
    renameFileMessage,
    deletedFileFromTrash,
    
    askFileNameMessage,
    askRenameFileName,
    askDirectoryNameMessage,
    
    createDirMessage,
    deleteDirMessage,
    
    explorerFileMessage,
    savedFileSuccess,
    deletedFileSuccess,
    renamedFileSuccess,
    movedFileSuccess,
    
    createdDirectorySuccess,
    deletedDirectorySuccess,
    
    
    restoreFilesystemMessage,
    fileSystemNotFound,
    fileSystemRestoredSuccess,
    fileSystemRestoredError,
    filesystemInfoMessage,
    
    explorerFileError,
    genericError,

    forbiddenCharacterAlert,
    pinnedMessageAlert,
};
