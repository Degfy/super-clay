const is = require('is-type-of');
const Plugin = require('./plugin.js');
const rubbi = require('rubbi');
let isCalled = false;

module.exports = async app => {
    if (isCalled) {
        throw Error('Plugin middle ware could not be called twice');
    }
    isCalled = true;
    const config = app.config || {};
    if (!is.array(config.plugins)) {
        config.plugins = [];
    }
    const plugins = config.plugins;
    const pluginsCtxMountArray = [];
    const pluginsBeforeHooks = [];
    const pluginsAfterHooks = [];

    await rubbi.asyncEach(plugins, async pluginConf => {
        const {
            name: pluginName,
            config: configPath,
            mount: mountPath,
        } = pluginConf;

        const CurPlugin = require(pluginName);
        const pluginOpts = config.get(configPath);
        const plugin = new CurPlugin(pluginOpts);

        if (!(plugin instanceof Plugin)) {
            throw Error(`${pluginName} is not available Sprubbi Plugin.`);
        }

        // init
        if (plugin.init) {
            await plugin.init(app);
        }

        const {
            appMount,
            ctxMount,
        } = instance.getMountProperty();

        if (appMount) {
            await doMount(app, mountPath, app);
        }
        if (ctxMount) {
            pluginsCtxMountArray.push({
                mountFn: ctxMount,
                mountPath,
            });
        }

        if (is.function(plugin.before)) {
            pluginsBeforeHooks.push(plugin.before);
        }
        if (is.function(plugin.after)) {
            pluginsAfterHooks.push(plugin.after);
        }
    });

    return async function (ctx, next) {
        await rubbi.asyncEach(pluginsCtxMountArray, async mountParams => {
            await doMount(ctx, mountParams.mountPath, mountParams.mountFn);
        });
        await rubbi.asyncEach(pluginsBeforeHooks, async fn => {
            await fn(ctx, app);
        });
        await next;
        await rubbi.asyncEach(pluginsAfterHooks, async fn => {
            await fn(ctx, app);
        });
    }

    async function doMount(obj, mountPath, mountFn) {
        if (!is.function(mountFn)) {
            throw Error(`mountFn is not function`);
        }
        if (obj.mountPath) {
            let logger = app.logger || console;
            logger.warn('obj ${mountPath} property will be covered');
        }
        let rst = mountFn(obj, mountPath, app);
        if (is.promise(rst)) {
            rst = await rst;
        }
        obj[mountPath] = rst;
    }
}
