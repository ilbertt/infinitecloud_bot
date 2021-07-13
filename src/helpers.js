export const getCurrentPath = (ctx) => {
    return ctx.session.currentPath ? ctx.session.currentPath : '/';
};

export const setCurrentPath = (ctx, path) => {
    ctx.session.currentPath = path;
};
