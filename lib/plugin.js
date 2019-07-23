class Plugin {
    constructor(opts) {
        this._config = opts;
    }

    getMountProperty() {
        return {
            ctxMount: this.ctxMount && this.ctxMount.bind(this),
            appMount: this.ctxMount && this.ctxMount.bind(this),
        };
    }

    /**
     * ctx mount function，this function need implement by children class
     * @param {Object|Array} mountObj 要挂载的对象
     * @param {String} mountName 挂载的名称
     * @param {Object} app 应用对象
     */
    // async ctxMount(mountObj, mountName, app) {}

    /**
     * app mount function，this function need implement by children class
     * @param {Object|Array} mountObj 要挂载的对象
     * @param {String} mountName 挂载的名称
     * @param {Object} app 应用对象
     */
    // async appMount(mountObj, mountName, app) {}

    /**
     * plugin init function, do initialize； need implement by children class
     * @param {Object} app App
     */
    // async init(app) {}

    /**
     * 将在koa其他中间之前执行
     * @param {Object} ctx KoaContext
     */
    // async before(ctx) {}

    /**
     * 将在koa其他中间之后执行
     * @param {Object} ctx KoaContext
     */
    // async after(ctx) {}
}
module.exports = Plugin;
