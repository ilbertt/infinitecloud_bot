const fs = require('fs');
const pjson = require('../package.json');

console.log('VERSION', pjson.version);

module.exports.getCurrentPath = (ctx) => {
    return ctx.session.currentPath ? ctx.session.currentPath : '/';
};

module.exports.setCurrentPath = (ctx, path) => {
    ctx.session.currentPath = path;
};

module.exports.getFileExtension = async (ctx, fileType) => {
    let fileId, fileInfo, extension;
    switch (fileType) {
        case 'photo':
            return '.jpg';
        case 'document':
            fileId = ctx.message.document.file_id;
            extension = '';
            if (ctx.message.document.file_name.includes('.')) {
                let fileNameSplit = ctx.message.document.file_name.split('.');
                extension = '.' + fileNameSplit[fileNameSplit.length - 1];
            }
            return extension;
        case 'video':
            return '.mp4';
        case 'audio':
            fileId = ctx.message.audio.file_id;
            fileInfo = await ctx.telegram.getFile(fileId);
            extension = '';
            if (fileInfo.file_path.includes('.')) {
                extension = '.'+fileInfo.file_path.split('.').pop();
            }
            return extension;
        default:
            return `.tg${fileType}`;
    }
};

module.exports.getHelpMessage = () => {
    try {
        return fs.readFileSync(
            'res/BOT_HELP.md',
            { encoding: 'utf8' }
        );
    } catch (e) {
        return 'Help in not available.';
    }
};

module.exports.getBotVersion = () => {
    return pjson.version;
};