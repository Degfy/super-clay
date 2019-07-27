const Plugin = require('./lib/plugin.js');
const PluginMidWare = require('./lib/plugin_middle_ware');
const Koa = require('koa');
const rubbi = require('rubbi');
const LOADED = Symbol('LOADED');
const CONF = Symbol('CONF');
const is = require('is-type-of');
const _config = {
    plugins: [],
    get() {},
};
/**
 * how to use app:
 * ```js
 * const App = require('sprubbi');
 * const app = App({ config:{
 *      plugins:[...] //插件配置项
 *  }});
 * // 或者可以单独配置
 * //app.config = ... 
 * app.listen(...); //开启端口监听
 * ```
 * 
 */
class App extends Koa {
    constructor(...arg) {
        super(...arg);
        this.config = arg[0] && arg[0].config;
    }

    set config(value) {
        const conf = this[CONF] = value;
        if (conf && !is.function(conf.get)) {
            conf.get = function (mPath) {
                return rubbi.pathProperty(conf, mPath);
            };
        }
    }

    get config() {
        return this[CONF] || _config;
    }

    async loadPlugins() {
        const middleWare = await PluginMidWare(this);
        this.use(middleWare);
    }

    callback() {
        const handle = super.callback();
        return async (req, res) => {
            if (!this[LOADED]) {
                this[LOADED] = true;
                await this.loadPlugins();
            }
            return await handle(req, res);
        }
    }
}

App.Plugin = Plugin;
App.PluginMidWare = PluginMidWare;
module.exports = App;
