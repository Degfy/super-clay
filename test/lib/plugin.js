const assert = require('assert');
const Plugin = require('../../lib/plugin.js');

describe('plugin.js', () => {
    it('getMountProperty', () => {
        class TestPlugin extends Plugin {}

        const plugin = new TestPlugin();
        const mountProperties = plugin.getMountProperty();

        assert.equal(mountProperties.appMount, undefined);
        assert.equal(mountProperties.ctxMount, undefined);

        // 1.
        class TestPlugin1 extends Plugin {
            ctxMount(mountObj, mountName, app) {
                app.test(this);
            }
        }
        const plugin1 = new TestPlugin1();
        const mountProperties1 = plugin1.getMountProperty();
        const ctxMount1 = mountProperties1.ctxMount;
        ctxMount1(undefined, undefined, {
            test(instance) {
                assert.equal(instance, plugin1);
            },
        });

        // 2.         
        class TestPlugin2 extends Plugin {
            ctxMount(mountObj, mountName, app) {
                app.test(this);
            }
        }

        TestPlugin2.prototype.appMount = 'wrong type';

        try {
            const plugin2 = new TestPlugin2();
            const mountProperties2 = plugin2.getMountProperty();
        } catch (err) {
            assert.equal(err instanceof TypeError, true);
        }

        // 3.         
        class TestPlugin3 extends Plugin {
            appMount(mountObj, mountName, app) {
                app.test(this);
            }
        }
        const plugin3 = new TestPlugin3();
        const mountProperties3 = plugin3.getMountProperty();

        const appMount3 = mountProperties3.appMount;
        appMount3(undefined, undefined, {
            test(instance) {
                assert.equal(instance, plugin3);
            },
        });
    });

});
