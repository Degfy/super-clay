const assert = require('assert');
const PluginMiddleWare = require('../../lib/plugin_middle_ware');
const rubbi = require('rubbi');
const path = require('path');


describe('plugin_middle_ware.js', () => {
    it('single plugin', async () => {

        const pluginConfigPath = 'plugin.test.conf';
        const ctx = {};
        const mountName = 'testPlugin';

        let initExecutedTimes = 0;
        let ctxMountExecutedTimes = 0;
        let appMountExecutedTimes = 0;
        let beforeExecutedTimes = 0;
        let afterExecutedTimes = 0;

        function appMountFn() {}

        function ctxMountFn() {}

        const app = {
            config: {
                plugins: [{
                    name: path.resolve(__dirname, '../helpers/test_plugin.js'),
                    config: pluginConfigPath,
                    mount: mountName,
                }],
                get(path) {
                    assert.equal(path, pluginConfigPath);
                    return rubbi.pathProperty(app.config, path);
                },

                plugin: {
                    test: {
                        conf: {
                            init(param1) {
                                assert.equal(param1, app);
                                initExecutedTimes++;
                            },


                            ctxMount(param1, param2, param3) {
                                // console.log(param1, param2, param3);

                                assert.equal(param1, ctx);
                                assert.equal(param2, mountName);
                                assert(param3, app);
                                ctxMountExecutedTimes++;
                                return ctxMountFn;
                            },

                            appMount(param1, param2, param3) {
                                assert.equal(param1, app);
                                assert.equal(param2, mountName);
                                assert(param3, app);
                                appMountExecutedTimes++;
                                return appMountFn;
                            },

                            before(param1, param2) {
                                assert.equal(param1, ctx);
                                assert.equal(param2, app);
                                beforeExecutedTimes++;
                            },
                            after(param1, param2) {
                                assert.equal(param1, ctx);
                                assert.equal(param2, app);
                                afterExecutedTimes++;
                            },
                        },
                    },
                },

            },
        };

        const TestPlugin = require('../helpers/test_plugin');
        TestPlugin._constructor = function (opts) {
            assert.equal(opts, app.config.get(pluginConfigPath));
        }
        const middleWare = await PluginMiddleWare(app);

        assert.equal(initExecutedTimes, 1);
        assert.equal(appMountExecutedTimes, 1);

        try {
            const middleWare2 = await PluginMiddleWare(app);
        } catch (e) {
            assert.equal(e.message, 'Plugin middle ware could not be called twice')
        }

        assert.equal(app[mountName], appMountFn);


        await middleWare(ctx, async () => {
            assert.equal(ctxMountExecutedTimes, 1);
            assert.equal(beforeExecutedTimes, 1);
            assert.equal(afterExecutedTimes, 0);
            assert.equal(ctx[mountName], ctxMountFn);
        });
        assert.equal(afterExecutedTimes, 1);

        await middleWare(ctx, async () => {
            assert.equal(ctxMountExecutedTimes, 2);
            assert.equal(beforeExecutedTimes, 2);
            assert.equal(afterExecutedTimes, 1);
            assert.equal(ctx[mountName], ctxMountFn);
        });
        assert.equal(afterExecutedTimes, 2);

    });

    it('multi plugins', async () => {
        // todo
    });
});
