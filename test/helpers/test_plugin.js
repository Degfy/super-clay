const Plugin = require('../../lib/plugin');
const is = require('is-type-of');

module.exports = class TestPlugin extends Plugin {
    constructor(...args) {
        super(...args);

        if (is.function(TestPlugin._constructor)) {
            TestPlugin._constructor(...args);
        }
        this.functions.forEach(fnName => {
            const that = this;
            this[fnName] = function (...args) {
                if (that._opts && is.function(that._opts[fnName])) {
                    // console.log(fnName);
                    return that._opts[fnName](...args);
                }
            }
        });
    }
}
