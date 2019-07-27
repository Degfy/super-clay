const Plugin = require('./lib/plugin.js');
const PluginMidWare = require('./lib/plugin_middle_ware');
const Koa = require('koa');
let loaded = false;

class App extends Koa {
    constructor() {
        super();
    }

    async loadPlugins() {
        const middleWare = await PluginMidWare(this);
        this.use(middleWare);
    }

    callback() {
        const handle = super.callback();
        return async (req, res) => {
            if (!loaded) {
                loaded = true;
                await this.loadPlugins();
            }
            return await handle(req, res);
        }
    }
}

App.Plugin = Plugin;
App.PluginMidWare = PluginMidWare;
module.exports = App;
