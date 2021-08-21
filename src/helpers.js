const fs = require('fs');

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
            fileInfo = await ctx.telegram.getFile(fileId);
            extension = '';
            if (fileInfo.file_path.includes('.')) {
                extension = '.'+fileInfo.file_path.split('.').pop();
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