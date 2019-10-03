
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = key && { [key]: value };
            const child_ctx = assign(assign({}, info.ctx), info.resolved);
            const block = type && (info.current = type)(child_ctx);
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                flush();
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = { [info.value]: promise };
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* The hierarchical display model.  The model contains widget instance configurations */
    const model = createModel();

    /* Map of widget name to widget default / class configuration - a 'palette' of widgets to choose - configuration consists of constructors, data providers, and default properties */
    const widgets = {};

    /* Map of widget id to widget instance configuration - for quick lookup instead of slowly traversing hierarchical model */
    const instances = {};

    /* Reactive store of widget instance configuration.  This is needed because changes made to the widget instance properties in the model otherwise don't generate update events */
    const instanceStores = {};

    /* Unique ID counter for widget instances - if we add a new widget we generate a unique ID for it */
    let nextId = 0;
    function getUniqueId() {
        return 'puddy-' + nextId++;
    }
    /* Given a widget instance configuration default values are set if missing and extraneous properties not recognized are removed.
    *  Also, the widget instance configuration has a unique ID property assigned and a parent widget reference added.
    *  Finally, the widget instance is added to the instances map for quick lookup and an instanceStore entry is created
    *  for handling event changes to instance properties */
    function prepareInstance(par, obj) {
        /* Display root widget is excluded from widgets map, so we handle special */
        if(obj.name === 'Display') {
            let defaultConfig = {title: '', style: '', theme: '', items: []};

            Object.keys(defaultConfig).forEach(key => {
                if(!(key in obj)) {
                    /*console.log('adding key', key);*/
                    obj[key] = defaultConfig[key];
                }
            });

            Object.keys(obj).forEach(key => {
                if (key !== 'name' && !(key in defaultConfig)) {
                    delete obj[key];
                }
            });
        } else if (widgets[obj.name]) {
            let defaultConfig = widgets[obj.name].defaults;

            Object.keys(defaultConfig).forEach(key => {
                if(!(key in obj)) {
                    obj[key] = defaultConfig[key];
                }
            });

            Object.keys(obj).forEach(key => {
                if (key !== 'name' && !(key in defaultConfig)) {
                    delete obj[key];
                }
            });
        }

        if(obj.dataprovider) {
            let dataproviderDefaults = widgets[obj.name].dataproviders[obj.dataprovider.name].defaults;

            Object.keys(dataproviderDefaults).forEach(key => {
                if(!(key in obj.dataprovider)) {
                    obj.dataprovider[key] = dataproviderDefaults[key];
                }
            });

            Object.keys(obj.dataprovider).forEach(key => {
                if (key !== 'name' && !(key in dataproviderDefaults)) {
                    delete obj.dataprovider[key];
                }
            });
        }

        obj.id = getUniqueId();
        obj.par = par;

        instances[obj.id] = obj;
        instanceStores[obj.id] = writable(obj);
    }

    /* Store of widget instance hierarchy - reactive */
    function createModel() {
        const { subscribe, set, update } = writable({});

        const addChild = (parent, child) => {
            prepareInstance(parent, child);

            parent.items = parent.items || [];
            parent.items.push(child);

            update(_model => {
                return _model;
            });
        };

        const remove = (node) => {
            if(node.par) {
                let index = node.par.items.findIndex(function (element) {
                    return element.id == node.id;
                });

                delete instances[node.id];
                delete instanceStores[node.id];

                node.par.items.splice(index, 1);
                update(_model => {
                    return _model;
                });
            }
        };

        const up = (node) => {
            if(node.par) {
                let index = node.par.items.findIndex(function (element) {
                    return element.id == node.id;
                });

                if(index > 0) {
                    node.par.items[index] = node.par.items[index - 1];
                    node.par.items[index - 1]  = node;
                }
                update(_model => {
                    return _model;
                });
            }
        };

        const down = (node) => {
            if(node.par) {
                let index = node.par.items.findIndex(function (element) {
                    return element.id == node.id;
                });

                let maxIndex = node.par.items.length - 1;

                if(index < maxIndex) {
                    node.par.items[index] = node.par.items[index + 1];
                    node.par.items[index + 1]  = node;
                }
                update(_model => {
                    return _model;
                });
            }
        };

        return {
            subscribe,
            set,
            update,
            addChild,
            remove,
            up,
            down
        };
    }

    /* src\manager\util\Instance.svelte generated by Svelte v3.9.1 */

    // (13:8) {:else}
    function create_else_block(ctx) {
    	var updating_config, switch_instance_anchor, current;

    	function switch_instance_config_binding_1(value) {
    		ctx.switch_instance_config_binding_1.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	var switch_value = widgets[ctx.$properties.name].constructor;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		if (ctx.$properties !== void 0) {
    			switch_instance_props.config = ctx.$properties;
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));

    		binding_callbacks.push(() => bind(switch_instance, 'config', switch_instance_config_binding_1));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (!updating_config && changed.$properties) {
    				switch_instance_changes.config = ctx.$properties;
    			}

    			if (switch_value !== (switch_value = widgets[ctx.$properties.name].constructor)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					binding_callbacks.push(() => bind(switch_instance, 'config', switch_instance_config_binding_1));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (11:8) {#if $properties.dataprovider}
    function create_if_block(ctx) {
    	var updating_config, switch_instance_anchor, current;

    	function switch_instance_config_binding(value) {
    		ctx.switch_instance_config_binding.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	var switch_value = widgets[ctx.$properties.name].dataproviders[ctx.$properties.dataprovider.name].constructor;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		if (ctx.$properties !== void 0) {
    			switch_instance_props.config = ctx.$properties;
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));

    		binding_callbacks.push(() => bind(switch_instance, 'config', switch_instance_config_binding));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (!updating_config && changed.$properties) {
    				switch_instance_changes.config = ctx.$properties;
    			}

    			if (switch_value !== (switch_value = widgets[ctx.$properties.name].dataproviders[ctx.$properties.dataprovider.name].constructor)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					binding_callbacks.push(() => bind(switch_instance, 'config', switch_instance_config_binding));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.$properties.dataprovider) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $properties, $$unsubscribe_properties = noop, $$subscribe_properties = () => { $$unsubscribe_properties(); $$unsubscribe_properties = subscribe(properties, $$value => { $properties = $$value; $$invalidate('$properties', $properties); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_properties());

    	let { item } = $$props;

        /*$: console.log($properties);*/

    	const writable_props = ['item'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Instance> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_config_binding(value) {
    		$properties = value;
    		properties.set($properties);
    	}

    	function switch_instance_config_binding_1(value) {
    		$properties = value;
    		properties.set($properties);
    	}

    	$$self.$set = $$props => {
    		if ('item' in $$props) $$invalidate('item', item = $$props.item);
    	};

    	let properties;

    	$$self.$$.update = ($$dirty = { item: 1 }) => {
    		if ($$dirty.item) { properties = instanceStores[item.id]; $$subscribe_properties(), $$invalidate('properties', properties); }
    	};

    	return {
    		item,
    		properties,
    		$properties,
    		switch_instance_config_binding,
    		switch_instance_config_binding_1
    	};
    }

    class Instance extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["item"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.item === undefined && !('item' in props)) {
    			console.warn("<Instance> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		return this.$$.ctx.item;
    	}

    	set item(item) {
    		this.$set({ item });
    		flush();
    	}
    }

    /* src\manager\util\Container.svelte generated by Svelte v3.9.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (6:0) {#if items}
    function create_if_block$1(ctx) {
    	var each_1_anchor, current;

    	var each_value = ctx.items;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.items) {
    				each_value = ctx.items;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (7:4) {#each items as item}
    function create_each_block(ctx) {
    	var current;

    	var instance = new Instance({
    		props: { item: ctx.item },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			instance.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(instance, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var instance_changes = {};
    			if (changed.items) instance_changes.item = ctx.item;
    			instance.$set(instance_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(instance, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.items) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.items) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance_1($$self, $$props, $$invalidate) {
    	let { items } = $$props;

    	const writable_props = ['items'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    	};

    	return { items };
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance_1, create_fragment$1, safe_not_equal, ["items"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.items === undefined && !('items' in props)) {
    			console.warn("<Container> was created without expected prop 'items'");
    		}
    	}

    	get items() {
    		return this.$$.ctx.items;
    	}

    	set items(items) {
    		this.$set({ items });
    		flush();
    	}
    }

    /* src\widgets\Panel.svelte generated by Svelte v3.9.1 */

    const file = "src\\widgets\\Panel.svelte";

    function create_fragment$2(ctx) {
    	var div, div_class_value, div_style_value, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var container = new Container({
    		props: { items: ctx.config.items },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");

    			if (!default_slot) {
    				container.$$.fragment.c();
    			}

    			if (default_slot) default_slot.c();

    			attr(div, "class", div_class_value = "panel " + ctx.config.class);
    			attr(div, "style", div_style_value = ctx.config.style);
    			add_location(div, file, 6, 0, 176);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (!default_slot) {
    				mount_component(container, div, null);
    			}

    			else {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!default_slot) {
    				var container_changes = {};
    				if (changed.config) container_changes.items = ctx.config.items;
    				container.$set(container_changes);
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if ((!current || changed.config) && div_class_value !== (div_class_value = "panel " + ctx.config.class)) {
    				attr(div, "class", div_class_value);
    			}

    			if ((!current || changed.config) && div_style_value !== (div_style_value = ctx.config.style)) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);

    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (!default_slot) {
    				destroy_component(container);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	/* Note: Default values are managed externally in file.js */
        let { config } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { config, $$slots, $$scope };
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, ["config"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Panel> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\widgets\Shape.svelte generated by Svelte v3.9.1 */

    const file$1 = "src\\widgets\\Shape.svelte";

    function create_fragment$3(ctx) {
    	var div, svg, path, path_d_value, svg_viewBox_value, div_class_value, div_style_value;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", path_d_value = ctx.config.d);
    			add_location(path, file$1, 7, 8, 167);
    			attr(svg, "viewBox", svg_viewBox_value = ctx.config.viewBox);
    			add_location(svg, file$1, 6, 4, 125);
    			attr(div, "class", div_class_value = "arc " + ctx.config.class);
    			attr(div, "style", div_style_value = ctx.config.style);
    			add_location(div, file$1, 5, 0, 64);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, svg);
    			append(svg, path);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.config) && path_d_value !== (path_d_value = ctx.config.d)) {
    				attr(path, "d", path_d_value);
    			}

    			if ((changed.config) && svg_viewBox_value !== (svg_viewBox_value = ctx.config.viewBox)) {
    				attr(svg, "viewBox", svg_viewBox_value);
    			}

    			if ((changed.config) && div_class_value !== (div_class_value = "arc " + ctx.config.class)) {
    				attr(div, "class", div_class_value);
    			}

    			if ((changed.config) && div_style_value !== (div_style_value = ctx.config.style)) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { config } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Shape> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return { config };
    }

    class Shape extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["config"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Shape> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\widgets\Arc.svelte generated by Svelte v3.9.1 */

    const file$2 = "src\\widgets\\Arc.svelte";

    function create_fragment$4(ctx) {
    	var div, svg, path, path_d_value, svg_viewBox_value, div_class_value, div_style_value;

    	return {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "d", path_d_value = "M " + ctx.arc.sx + "," + ctx.arc.sy + " A " + ctx.arc.rx + "," + ctx.arc.ry + " " + ctx.arc.rot + " " + ctx.arc.fa + " " + ctx.arc.fs + " " + ctx.arc.ex + " " + ctx.arc.ey);
    			add_location(path, file$2, 50, 8, 1868);
    			attr(svg, "viewBox", svg_viewBox_value = ctx.config.viewBox);
    			add_location(svg, file$2, 49, 4, 1826);
    			attr(div, "class", div_class_value = "arc " + ctx.config.class);
    			attr(div, "style", div_style_value = ctx.config.style);
    			add_location(div, file$2, 48, 0, 1765);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, svg);
    			append(svg, path);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.arc) && path_d_value !== (path_d_value = "M " + ctx.arc.sx + "," + ctx.arc.sy + " A " + ctx.arc.rx + "," + ctx.arc.ry + " " + ctx.arc.rot + " " + ctx.arc.fa + " " + ctx.arc.fs + " " + ctx.arc.ex + " " + ctx.arc.ey)) {
    				attr(path, "d", path_d_value);
    			}

    			if ((changed.config) && svg_viewBox_value !== (svg_viewBox_value = ctx.config.viewBox)) {
    				attr(svg, "viewBox", svg_viewBox_value);
    			}

    			if ((changed.config) && div_class_value !== (div_class_value = "arc " + ctx.config.class)) {
    				attr(div, "class", div_class_value);
    			}

    			if ((changed.config) && div_style_value !== (div_style_value = ctx.config.style)) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { config } = $$props;

        const cos = Math.cos;
        const sin = Math.sin;
        const π = Math.PI;
        const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
        const f_rotate_matrix = ((x) => {
            const cosx = cos(x);
            const sinx = sin(x);
            return [[cosx, -sinx], [sinx, cosx]];
        });
        const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
        const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, Δ], φ) => {
            /* [
            returns a a array that represent a ellipse for SVG path element d attribute.
            cx,cy → center of ellipse.
            rx,ry → major minor radius.
            t1 → start angle, in radian.
            Δ → angle to sweep, in radian. positive.
            φ → rotation on the whole, in radian.
            url: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
            Version 2019-06-19
             ] */
            Δ = Δ % (2 * π);
            const rotMatrix = f_rotate_matrix(φ);
            const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
            const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]), [cx, cy]));
            const fA = ((Δ > π) ? 1 : 0);
            const fS = ((Δ > 0) ? 1 : 0);
            return {sx: sX, sy: sY, rx: rx, ry: ry, rot: φ / π * 180, fa: fA, fs: fS, ex: eX, ey: eY};
        });

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Arc> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let arc;

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { $$invalidate('arc', arc = f_svg_ellipse_arc([
                    parseFloat(config.cx),
                    parseFloat(config.cy)
                ], [
                    parseFloat(config.rx),
                    parseFloat(config.ry)
                ], [
                    parseFloat(config.sweepStart) / 180 * π,
                    parseFloat(config.sweepDelta) / 180 * π
                ], parseFloat(config.rotation) / 180 * π)); }
    	};

    	return { config, arc };
    }

    class Arc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["config"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Arc> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\widgets\Indicator.svelte generated by Svelte v3.9.1 */

    const file$3 = "src\\widgets\\Indicator.svelte";

    function create_fragment$5(ctx) {
    	var div, div_class_value, div_style_value;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", div_class_value = "indicator " + ctx.config.class + " svelte-bwjdim");
    			attr(div, "style", div_style_value = ctx.config.style);
    			toggle_class(div, "flash", ctx.flash);
    			toggle_class(div, "on", ctx.onIf ? ctx.onIf(ctx.data) : {});
    			add_location(div, file$3, 86, 0, 3127);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.config) && div_class_value !== (div_class_value = "indicator " + ctx.config.class + " svelte-bwjdim")) {
    				attr(div, "class", div_class_value);
    			}

    			if ((changed.config) && div_style_value !== (div_style_value = ctx.config.style)) {
    				attr(div, "style", div_style_value);
    			}

    			if ((changed.config || changed.flash)) {
    				toggle_class(div, "flash", ctx.flash);
    			}

    			if ((changed.config || changed.onIf || changed.data)) {
    				toggle_class(div, "on", ctx.onIf ? ctx.onIf(ctx.data) : {});
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	/* Note: Default values are managed externally in file.js */
        let { config, data = {value: 0} } = $$props;

        let flash = false;
        let onIf = function(data) {
            return false;
        };

        /*$: console.log(data.value);*/
        /*$: console.log(onIf);*/

    	const writable_props = ['config', 'data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Indicator> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    	};

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { {
                    /* If we used Svelte checkbox then conversion is automatic... */
                    $$invalidate('flash', flash = (config.flash === true || config.flash === 'true') ? true : false);
            
                    if (typeof config.onIf === 'function') {
                        $$invalidate('onIf', onIf = config.onIf);
                    } else if (typeof config.onIf === 'string') {
                        try {
                            $$invalidate('onIf', onIf = Function('"use strict";return (' + config.onIf + ')')());
                        } catch(e) {
                            /*console.log(e);*/
                        }
                    } else {
                        $$invalidate('onIf', onIf = function(data) {return false;});
                    }
                } }
    	};

    	return { config, data, flash, onIf };
    }

    class Indicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, ["config", "data"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Indicator> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get data() {
    		return this.$$.ctx.data;
    	}

    	set data(data) {
    		this.$set({ data });
    		flush();
    	}
    }

    /* src\dataproviders\StaticIndicator.svelte generated by Svelte v3.9.1 */

    function create_fragment$6(ctx) {
    	var updating_config, current;

    	function indicator_config_binding(value) {
    		ctx.indicator_config_binding.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	let indicator_props = { data: ctx.data };
    	if (ctx.config !== void 0) {
    		indicator_props.config = ctx.config;
    	}
    	var indicator = new Indicator({ props: indicator_props, $$inline: true });

    	binding_callbacks.push(() => bind(indicator, 'config', indicator_config_binding));

    	return {
    		c: function create() {
    			indicator.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(indicator, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var indicator_changes = {};
    			if (changed.data) indicator_changes.data = ctx.data;
    			if (!updating_config && changed.config) {
    				indicator_changes.config = ctx.config;
    			}
    			indicator.$set(indicator_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(indicator.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(indicator.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(indicator, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { config = {} } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StaticIndicator> was created with unknown prop '${key}'`);
    	});

    	function indicator_config_binding(value) {
    		config = value;
    		$$invalidate('config', config);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let data;

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { $$invalidate('data', data = {value: config.dataprovider.value}); }
    	};

    	return { config, data, indicator_config_binding };
    }

    class StaticIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src\datasources\RandomNumberGenerator.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1 } = globals;

    function create_fragment$7(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $tweener, $$unsubscribe_tweener = noop, $$subscribe_tweener = () => { $$unsubscribe_tweener(); $$unsubscribe_tweener = subscribe(tweener, $$value => { $tweener = $$value; $$invalidate('$tweener', $tweener); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_tweener());

    	

        let defaultConfig = {min: 0, max: 100, hz: 1, intVal: false, intMaxInc: false, tween: false};

        let { config = defaultConfig } = $$props;

        /*let min = config.min ? config.min : 0;
        let max = config.max ? config.max : 100;
        let hz = config.hz ? config.hz : 1;
        let intVal = config.intVal ? config.intVal : false;
        let intMaxInc = config.intMaxInc ? config.intMaxInc : false;
        let tween = config.tween ? config.tween : false;*/

        const dispatch = createEventDispatcher();

        let value;
        let next;

        let intMaxIncVal = config.intMaxInc ? 1 : 0;

        if(config.intVal) {
            config.min = Math.ceil(config.min); $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
            config.max = Math.floor(config.max); $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
        }

        function randomFloat() {
            return Math.random() * (config.max - config.min) + config.min;
        }

        function randomInt() {
            return Math.floor(Math.random() * (config.max - config.min + intMaxIncVal) + config.min);
        }

        onMount(() => {
            const interval = setInterval(() => {
                if(config.intVal) {
                    $$invalidate('next', next = randomInt());
                } else {
                    $$invalidate('next', next = randomFloat());
                }
            }, 1000 * config.hz);

            return () => {
                clearInterval(interval);
            };
        });

    	const writable_props = ['config'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<RandomNumberGenerator> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let tweener;

    	$$self.$$.update = ($$dirty = { defaultConfig: 1, config: 1, next: 1, tweener: 1, $tweener: 1, value: 1 }) => {
    		if ($$dirty.defaultConfig || $$dirty.config) { {
                    Object.keys(defaultConfig).forEach(key => {
                        if(!(key in config)) {
                            config[key] = defaultConfig[key]; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
                        }
                    });
            
                    /* Data Source should not remove keys used by other data sources*/
                    /*Object.keys(config).forEach(key => {
                        if (key !== 'name' && !(key in defaultConfig)) {
                            delete config[key];
                        }
                    });*/
            
                    /* Convert string to number (could use parseFloat instead) */
                    /* Note: We could actually use type="number" on inputs and Svelte will do conversion for us, but that would mean we would need to track which inputs are numbers*/
                    config.min = config.min * 1.0; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
                    config.max = config.max * 1.0; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
            
                    config.hz = config.hz * 1.0; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
            
                    /*Again, if we used Svelte checkbox then conversion is automatic... */
                    config.tween = (config.tween === true || config.tween === 'true') ? true : false; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
            
                    /*console.log(config);*/
                } }
    		if ($$dirty.config) { tweener = tweened(0, {duration: config.hz * 1000, easing: cubicOut}); $$subscribe_tweener(), $$invalidate('tweener', tweener); }
    		if ($$dirty.config || $$dirty.next || $$dirty.tweener || $$dirty.$tweener || $$dirty.value) { {
                    if(config.tween && !isNaN(next)) {
                        tweener.set(next);
                        $$invalidate('value', value = $tweener);
                    } else {
                        $$invalidate('value', value = next);
                    }
            
                    dispatch('value', {
                        value: value
                    });
                } }
    	};

    	return { config, tweener };
    }

    class RandomNumberGenerator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\RandomNumberGeneratorIndicator.svelte generated by Svelte v3.9.1 */

    function create_fragment$8(ctx) {
    	var t, updating_config, current;

    	var datasource = new RandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	function indicator_config_binding(value) {
    		ctx.indicator_config_binding.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	let indicator_props = { data: ctx.data };
    	if (ctx.config !== void 0) {
    		indicator_props.config = ctx.config;
    	}
    	var indicator = new Indicator({ props: indicator_props, $$inline: true });

    	binding_callbacks.push(() => bind(indicator, 'config', indicator_config_binding));

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			indicator.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(indicator, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var indicator_changes = {};
    			if (changed.data) indicator_changes.data = ctx.data;
    			if (!updating_config && changed.config) {
    				indicator_changes.config = ctx.config;
    			}
    			indicator.$set(indicator_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(indicator.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(indicator.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(indicator, detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

        let { config } = $$props;

        let data;

        function update(e) {
            $$invalidate('data', data = {value: e.detail.value});
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<RandomNumberGeneratorIndicator> was created with unknown prop '${key}'`);
    	});

    	function indicator_config_binding(value) {
    		config = value;
    		$$invalidate('config', config);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return {
    		config,
    		data,
    		update,
    		indicator_config_binding
    	};
    }

    class RandomNumberGeneratorIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, ["config"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<RandomNumberGeneratorIndicator> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    const configA = {hz: 1, max: 10, min: 0};
    const configB = {hz: 2, max: 100, min: 0};
    const configC = {hz: 3, max: 1000, min: 0};

    function randomFloat(config) {
        return Math.random() * (config.max - config.min) + config.min;
    }

    function createRng(config) {
        const tweener = tweened(0, {duration: 1000 * config.hz, easing: cubicOut});
        const {subscribe, set, update} = readable(null, function start(set) {

            tweener.subscribe(value => {set(value);});

            const interval = setInterval(() => {
                tweener.set(randomFloat(config));

            }, 1000 * config.hz);

            return function stop() {
                clearInterval(interval);
            }
        });

        return {subscribe};
    }

    const a = createRng(configA);
    const b = createRng(configB);
    const c = createRng(configC);

    /* src\datasources\SharedRandomNumberGenerator.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1$1 } = globals;

    function create_fragment$9(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $value, $$unsubscribe_value = noop, $$subscribe_value = () => { $$unsubscribe_value(); $$unsubscribe_value = subscribe(value, $$value => { $value = $$value; $$invalidate('$value', $value); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_value());

    	

        let defaultConfig = {channel: 'a'};

        let { config = defaultConfig } = $$props;

        const dispatch = createEventDispatcher();

        let channels = {a: a, b: b, c: c};

    	const writable_props = ['config'];
    	Object_1$1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SharedRandomNumberGenerator> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let value;

    	$$self.$$.update = ($$dirty = { defaultConfig: 1, config: 1, channels: 1, $value: 1 }) => {
    		if ($$dirty.defaultConfig || $$dirty.config) { {
                    Object.keys(defaultConfig).forEach(key => {
                        if(!(key in config)) {
                            config[key] = defaultConfig[key]; $$invalidate('config', config), $$invalidate('defaultConfig', defaultConfig);
                        }
                    });
            
                    /* Data Source should not remove keys used by other data sources*/
                    /*Object.keys(config).forEach(key => {
                        if (key !== 'name' && !(key in defaultConfig)) {
                            delete config[key];
                        }
                    });*/
                } }
    		if ($$dirty.channels || $$dirty.config) { value = channels[config.channel] || a; $$subscribe_value(), $$invalidate('value', value); }
    		if ($$dirty.$value) { {
                    dispatch('value', {
                        value: $value
                    });
                } }
    	};

    	return { config, value };
    }

    class SharedRandomNumberGenerator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\SharedRandomNumberGeneratorIndicator.svelte generated by Svelte v3.9.1 */

    function create_fragment$a(ctx) {
    	var t, updating_config, current;

    	var datasource = new SharedRandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	function indicator_config_binding(value) {
    		ctx.indicator_config_binding.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	let indicator_props = { data: ctx.data };
    	if (ctx.config !== void 0) {
    		indicator_props.config = ctx.config;
    	}
    	var indicator = new Indicator({ props: indicator_props, $$inline: true });

    	binding_callbacks.push(() => bind(indicator, 'config', indicator_config_binding));

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			indicator.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(indicator, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var indicator_changes = {};
    			if (changed.data) indicator_changes.data = ctx.data;
    			if (!updating_config && changed.config) {
    				indicator_changes.config = ctx.config;
    			}
    			indicator.$set(indicator_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(indicator.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(indicator.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(indicator, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

        let { config } = $$props;

        let data;

        function update(e) {
            $$invalidate('data', data = {value: e.detail.value});
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SharedRandomNumberGeneratorIndicator> was created with unknown prop '${key}'`);
    	});

    	function indicator_config_binding(value) {
    		config = value;
    		$$invalidate('config', config);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return {
    		config,
    		data,
    		update,
    		indicator_config_binding
    	};
    }

    class SharedRandomNumberGeneratorIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, ["config"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<SharedRandomNumberGeneratorIndicator> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\datasources\Epics2Web.svelte generated by Svelte v3.9.1 */

    let jlab = {epics2web: {}};

    /*Make it easy to prefix; otherwise can be safely ignored*/
    jlab.contextPrefix = jlab.contextPrefix || '';

    jlab.epics2web.ClientConnection = function (options) {
        var protocol = 'ws:';
        if (window.location.protocol === 'https:') {
            protocol = 'wss:';
        }

        var defaultOptions = {
            url: protocol + "//" + window.location.host + jlab.contextPrefix + "/epics2web/monitor",
            autoOpen: true, /* Will automatically connect to socket immediately instead of waiting for open function to be called */
            autoReconnect: true, /* If socket is closed, will automatically reconnect after reconnectWaitMillis */
            autoLivenessPingAndTimeout: true, /* Will ping the server every pingIntervalMillis and if no response in livenessTimeoutMillis then will close the socket as invalid */
            autoDisplayClasses: true, /* As connect state changes will hide and show elements with corresponding state classes: ws-disconnected, ws-connecting, ws-connected */
            pingIntervalMillis: 3000, /* Time to wait between pings */
            livenessTimoutMillis: 2000, /* Max time allowed for server to respond to a ping (via any message) */
            reconnectWaitMillis: 1000, /* Time to wait after socket closed before attempting reconnect */
            chunkedRequestPvsCount: 400, /* Max number of PVs to transmit in a chunked monitor or clear command; 0 to disable chunking */
            clientName: window.location.href /* Client name is a string used for informational/debugging purposes (appears in console) */
        };

        if (!options) {
            options = {};
        }

        for (var key in defaultOptions) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = defaultOptions[key];
            }
        }

        // Private variables
        var socket = null,
                eventElem = document.createElement('div'),
                lastUpdated = null,
                self = this,
                livenessTimer = null,
                reconnecting = false;

        // Private functions
        var doPingWithTimer = function () {
            /*console.log('pingWithTimer');*/
            if (socket !== null && socket.readyState === WebSocket.OPEN) {
                self.ping();

                if (livenessTimer !== null) ; else {
                    livenessTimer = setTimeout(function () {
                        /*console.log('server liveness timer triggered');*/

                        /*var elapsedMillis = Math.abs(new Date() - lastUpdated);

                         console.log('Elapsed Millis: ' + elapsedMillis);
                         console.log('Keepalive Timeout Millis: ' + self.livenessTimoutMillis);

                         if(elapsedMillis > self.livenessTimoutMillis) {
                         console.log('Ping/Pong Timeout');*/
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.close();
                        }
                        //}

                        livenessTimer = null;
                    }, self.livenessTimoutMillis);
                }
            }
        };

        // Event wiring
        eventElem.addEventListener('open', function (event) {
            self.onopen(event);
        });
        eventElem.addEventListener('close', function (event) {
            self.onclose(event);
        });
        eventElem.addEventListener('connecting', function (event) {
            self.onconnecting(event);
        });
        eventElem.addEventListener('closing', function (event) {
            self.onclosing(event);
        });
        eventElem.addEventListener('error', function (event) {
            self.onerror(event);
        });
        eventElem.addEventListener('message', function (event) {
            self.onmessage(event);
        });
        eventElem.addEventListener('info', function (event) {
            self.oninfo(event);
        });
        eventElem.addEventListener('update', function (event) {
            self.onupdate(event);
        });
        eventElem.addEventListener('pong', function (event) {
            self.onpong(event);
        });

        this.addEventListener = eventElem.addEventListener.bind(eventElem);
        this.removeEventListener = eventElem.removeEventListener.bind(eventElem);
        this.dispatchEvent = eventElem.dispatchEvent.bind(eventElem);

        // Public functions
        this.open = function () {
            if (socket === null || socket.readyState === WebSocket.CLOSED) {
                var event = new CustomEvent('connecting');
                eventElem.dispatchEvent(event);

                let u = this.url;

                if (this.clientName !== null) {
                    u = u + '?clientName=' + encodeURIComponent(this.clientName);
                }

                socket = new WebSocket(u);

                socket.onerror = function (event) {
                    console.log("server connection error");
                    console.log(event);

                    var event = new CustomEvent('error');
                    eventElem.dispatchEvent(event);
                };

                socket.onclose = function (event) {
                    console.log("server connection closed");
                    console.log(event.reason);

                    var event = new CustomEvent('close');
                    eventElem.dispatchEvent(event);

                    if (livenessTimer !== null) {
                        clearTimeout(livenessTimer);
                        livenessTimer = null;
                    }

                    var isClosed = socket === null || socket.readyState === WebSocket.CLOSED;
                    if (self.autoReconnect && !reconnecting && isClosed) {
                        /*console.log('attempting to reconnect after delay');*/
                        reconnecting = true;
                        setTimeout(function () {
                            /*console.log('reconnect timer triggered');*/
                            self.open();
                            reconnecting = false;
                        }, self.reconnectWaitMillis);
                    }
                };

                socket.onmessage = function (event) {
                    /*console.log(event.data);*/

                    if (livenessTimer !== null) {
                        clearTimeout(livenessTimer);
                        livenessTimer = null;
                    }

                    lastUpdated = new Date();
                    var json = JSON.parse(event.data);
                    json.date = lastUpdated;
                    if (json.type === 'update') {
                        var event = new CustomEvent('update', {'detail': json});
                        eventElem.dispatchEvent(event);
                    } else if (json.type === 'info') {
                        var event = new CustomEvent('info', {'detail': json});
                        eventElem.dispatchEvent(event);
                    } else if (json.type === 'pong') {
                        var event = new CustomEvent('pong');
                        eventElem.dispatchEvent(event);
                    }

                    var event = new CustomEvent('message');
                    eventElem.dispatchEvent(event, {'detail': json});
                };

                socket.onopen = function (event) {
                    lastUpdated = new Date();

                    var event = new CustomEvent('open');
                    eventElem.dispatchEvent(event);
                };
            } else {
                console.log('already connected');
                return 1;
            }
        };

        this.close = function (code, reason) {
            console.log('close');
            if (socket !== null && socket.readyState !== WebSocket.CLOSED) {
                if (typeof code === 'undefined') {
                    code = 1000;
                }

                socket.close(code, reason);
            } else {
                console.log('already closed');
            }
        };

        this.monitorPvs = function (pvs) {
            if (self.chunkedRequestPvsCount > 0) {
                var i, j, chunk;
                for (i = 0, j = pvs.length; i < j; i += self.chunkedRequestPvsCount) {
                    chunk = pvs.slice(i, i + self.chunkedRequestPvsCount);
                    this.monitorPvsChunk(chunk);
                }
            } else {
                this.monitorPvsChunk(pvs);
            }
        };

        this.monitorPvsChunk = function (pvs) {
            var msg = {type: 'monitor', pvs: pvs};
            socket.send(JSON.stringify(msg));
        };

        this.clearPvs = function (pvs) {
            if (self.chunkedRequestPvsCount > 0) {
                var i, j, chunk;
                for (i = 0, j = pvs.length; i < j; i += self.chunkedRequestPvsCount) {
                    chunk = pvs.slice(i, i + self.chunkedRequestPvsCount);
                    this.clearPvsChunk(chunk);
                }
            } else {
                this.clearPvsChunk(pvs);
            }
        };

        this.clearPvsChunk = function (pvs) {
            var msg = {type: 'clear', pvs: pvs};
            socket.send(JSON.stringify(msg));
        };

        this.ping = function () {
            var msg = {type: 'ping'};
            socket.send(JSON.stringify(msg));
        };

        if (this.autoOpen === true) {
            this.open();
        }

        if (this.autoLivenessPingAndTimeout === true) {
            window.setInterval(doPingWithTimer, this.pingIntervalMillis);
        }
    };

    jlab.epics2web.ClientConnection.prototype.onopen = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onclose = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onconnecting = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onclosing = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onmessage = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onerror = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onupdate = function () {
    };
    jlab.epics2web.ClientConnection.prototype.oninfo = function () {
    };
    jlab.epics2web.ClientConnection.prototype.onpong = function () {
    };

    jlab.epics2web.isNumericEpicsType = function (datatype) {
        var isNumeric;

        switch (datatype) {
            case 'DBR_DOUBLE':
            case 'DBR_FLOAT':
            case 'DBR_INT':
            case 'DBR_SHORT':
            case 'DBR_BYTE':
                isNumeric = true;
                break;
            default:
                isNumeric = false;
        }

        return isNumeric;
    };

    /*var jlab = jlab || {};
    jlab.epics2web = jlab.epics2web || {};*/
    jlab.epics2web.puddy = jlab.epics2web.puddy || {};


    let protocol = 'ws://';
    if (window.location.protocol === 'https:') {
        protocol = 'wss://';
    }

    let host = 'epicsweb.jlab.org';

    if(host === 'undefined') {
        host = window.location.hostname;
    }

    /*let host = 'epicswebtest.acc.jlab.org';*/

    let url =  protocol + host + '/epics2web/monitor';

    jlab.epics2web.puddy.con = null;
    jlab.epics2web.puddy.options = {url: url};
    jlab.epics2web.puddy.pvToListenerMap = {};
    jlab.epics2web.puddy.MAX_MONITORS = 100;
    jlab.epics2web.puddy.enumLabelMap = {};
    jlab.epics2web.puddy.monitoredPvs = [];
    jlab.epics2web.puddy.listenerId = 0;

    jlab.epics2web.puddy.addListener = function (pv, callback) {
        if (jlab.epics2web.puddy.con === null) {
            alert('Not connected');
            return;
        }

        let id = jlab.epics2web.puddy.listenerId++;

        jlab.epics2web.puddy.pvToListenerMap[pv] = jlab.epics2web.puddy.pvToListenerMap[pv] || [];
        jlab.epics2web.puddy.pvToListenerMap[pv].push({id: id, callback: callback});

        if (jlab.epics2web.puddy.monitoredPvs.indexOf(pv) === -1) {
            jlab.epics2web.puddy.monitoredPvs.push(pv);

            jlab.epics2web.puddy.con.monitorPvs([pv]);
        }

        return id;
    };

    jlab.epics2web.puddy.removeListener = function(pv, id) {
        let listeners = jlab.epics2web.puddy.pvToListenerMap[pv];

        if(listeners !== undefined) {

            let index = listeners.findIndex(x => x.id === id);

            if(index > -1) {
                listeners.splice(index, 1);

                if(listeners.length === 0) {
                    index = jlab.epics2web.puddy.monitoredPvs.indexOf(pv);

                    if(index > -1) {
                        jlab.epics2web.puddy.monitoredPvs.splice(index, 1);
                        jlab.epics2web.puddy.con.clearPvs([pv]);
                    }
                }
            }
        }
    };

    {
        jlab.epics2web.puddy.con = {};
    }

    jlab.epics2web.puddy.con.onopen = function (e) {
        /*This is for re-connect - on initial connect array will be empty*/
        if (jlab.epics2web.puddy.monitoredPvs.length > 0) {
            jlab.epics2web.puddy.con.monitorPvs(jlab.epics2web.puddy.monitoredPvs);
        }
    };

    jlab.epics2web.puddy.con.onclose = function(e) {

    };

    jlab.epics2web.puddy.con.onupdate = function (e) {
        /*console.log(e.detail);*/
        let listeners = jlab.epics2web.puddy.pvToListenerMap[e.detail.pv];
        if (typeof listeners !== 'undefined') {
            listeners.forEach(function(listener){
                listener.callback(e.detail);
            });
        } else {
            console.log('Server is updating me on a PV I am unaware of: ' + e.detail.pv);
        }
    };

    jlab.epics2web.puddy.con.oninfo = function (e) {
        /*console.log(e.detail);*/
        let listeners = jlab.epics2web.puddy.pvToListenerMap[e.detail.pv];
        if (typeof listeners !== 'undefined') {
            listeners.forEach(function(listener){
                listener.callback(e.detail);
            });
        } else {
            console.log('Server is providing me with metadata on a PV I am unaware of: ' + e.detail.pv);
        }
    };

    /* src\widgets\Label.svelte generated by Svelte v3.9.1 */

    const file$4 = "src\\widgets\\Label.svelte";

    function create_fragment$b(ctx) {
    	var span, t, span_class_value, span_style_value;

    	return {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.formattedValue);
    			attr(span, "class", span_class_value = "label " + ctx.config.class);
    			attr(span, "style", span_style_value = ctx.config.style);
    			add_location(span, file$4, 18, 0, 611);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.formattedValue) {
    				set_data(t, ctx.formattedValue);
    			}

    			if ((changed.config) && span_class_value !== (span_class_value = "label " + ctx.config.class)) {
    				attr(span, "class", span_class_value);
    			}

    			if ((changed.config) && span_style_value !== (span_style_value = ctx.config.style)) {
    				attr(span, "style", span_style_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	/* Note: Default values are managed externally in file.js */
        let { config, data = {value: 0} } = $$props;

        let formattedValue = '';

    	const writable_props = ['config', 'data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    	};

    	$$self.$$.update = ($$dirty = { config: 1, data: 1 }) => {
    		if ($$dirty.config || $$dirty.data) { {
                    /*Format Decimals*/
                    if(config.decimals !== '' && data.value && data.value.toFixed) {
                        $$invalidate('formattedValue', formattedValue = data.value.toFixed(config.decimals));
                    } else {
                        $$invalidate('formattedValue', formattedValue = data.value);
                    }
                } }
    	};

    	return { config, data, formattedValue };
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, ["config", "data"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Label> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get data() {
    		return this.$$.ctx.data;
    	}

    	set data(data) {
    		this.$set({ data });
    		flush();
    	}
    }

    /* src\dataproviders\StaticLabel.svelte generated by Svelte v3.9.1 */

    function create_fragment$c(ctx) {
    	var updating_config, current;

    	function label_config_binding(value) {
    		ctx.label_config_binding.call(null, value);
    		updating_config = true;
    		add_flush_callback(() => updating_config = false);
    	}

    	let label_props = { data: ctx.data };
    	if (ctx.config !== void 0) {
    		label_props.config = ctx.config;
    	}
    	var label = new Label({ props: label_props, $$inline: true });

    	binding_callbacks.push(() => bind(label, 'config', label_config_binding));

    	return {
    		c: function create() {
    			label.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var label_changes = {};
    			if (changed.data) label_changes.data = ctx.data;
    			if (!updating_config && changed.config) {
    				label_changes.config = ctx.config;
    			}
    			label.$set(label_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { config = {} } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StaticLabel> was created with unknown prop '${key}'`);
    	});

    	function label_config_binding(value) {
    		config = value;
    		$$invalidate('config', config);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let data;

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { $$invalidate('data', data = {value: config.dataprovider.value}); }
    	};

    	return { config, data, label_config_binding };
    }

    class StaticLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\RandomNumberGeneratorLabel.svelte generated by Svelte v3.9.1 */

    function create_fragment$d(ctx) {
    	var t, current;

    	var datasource = new RandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	var label = new Label({
    		props: { config: ctx.config, data: ctx.data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			label.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(label, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var label_changes = {};
    			if (changed.config) label_changes.config = ctx.config;
    			if (changed.data) label_changes.data = ctx.data;
    			label.$set(label_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(label.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(label, detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	

        let { config = {} } = $$props;

        let data = {value: 'Load'};

        function update(e) {
            if(e.detail.value !== undefined) {
                data.value = e.detail.value; $$invalidate('data', data);
            }
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<RandomNumberGeneratorLabel> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return { config, data, update };
    }

    class RandomNumberGeneratorLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$d, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\SharedRandomNumberGeneratorLabel.svelte generated by Svelte v3.9.1 */

    function create_fragment$e(ctx) {
    	var t, current;

    	var datasource = new SharedRandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	var label = new Label({
    		props: { config: ctx.config, data: ctx.data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			label.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(label, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var label_changes = {};
    			if (changed.config) label_changes.config = ctx.config;
    			if (changed.data) label_changes.data = ctx.data;
    			label.$set(label_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(label.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(label, detaching);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	

        let { config = {} } = $$props;

        let data = {value: 'Load'};

        function update(e) {
            if(e.detail.value !== undefined) {
                data.value = e.detail.value; $$invalidate('data', data);
            }
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SharedRandomNumberGeneratorLabel> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return { config, data, update };
    }

    class SharedRandomNumberGeneratorLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\widgets\Gauge.svelte generated by Svelte v3.9.1 */

    const file$5 = "src\\widgets\\Gauge.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tick = list[i];
    	return child_ctx;
    }

    // (280:12) {#each ticks as tick}
    function create_each_block$1(ctx) {
    	var line, line_x__value, line_y__value, line_x__value_1, line_y__value_1, text_1, t_value = ctx.tick.label.text + "", t, text_1_x_value, text_1_y_value;

    	return {
    		c: function create() {
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr(line, "x1", line_x__value = ctx.tick.line.x1);
    			attr(line, "y1", line_y__value = ctx.tick.line.y1);
    			attr(line, "x2", line_x__value_1 = ctx.tick.line.x2);
    			attr(line, "y2", line_y__value_1 = ctx.tick.line.y2);
    			add_location(line, file$5, 280, 16, 9185);
    			attr(text_1, "x", text_1_x_value = ctx.tick.label.x);
    			attr(text_1, "y", text_1_y_value = ctx.tick.label.y);
    			attr(text_1, "class", "svelte-1qy2i1s");
    			add_location(text_1, file$5, 281, 16, 9296);
    		},

    		m: function mount(target, anchor) {
    			insert(target, line, anchor);
    			insert(target, text_1, anchor);
    			append(text_1, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.ticks) && line_x__value !== (line_x__value = ctx.tick.line.x1)) {
    				attr(line, "x1", line_x__value);
    			}

    			if ((changed.ticks) && line_y__value !== (line_y__value = ctx.tick.line.y1)) {
    				attr(line, "y1", line_y__value);
    			}

    			if ((changed.ticks) && line_x__value_1 !== (line_x__value_1 = ctx.tick.line.x2)) {
    				attr(line, "x2", line_x__value_1);
    			}

    			if ((changed.ticks) && line_y__value_1 !== (line_y__value_1 = ctx.tick.line.y2)) {
    				attr(line, "y2", line_y__value_1);
    			}

    			if ((changed.ticks) && t_value !== (t_value = ctx.tick.label.text + "")) {
    				set_data(t, t_value);
    			}

    			if ((changed.ticks) && text_1_x_value !== (text_1_x_value = ctx.tick.label.x)) {
    				attr(text_1, "x", text_1_x_value);
    			}

    			if ((changed.ticks) && text_1_y_value !== (text_1_y_value = ctx.tick.label.y)) {
    				attr(text_1, "y", text_1_y_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(line);
    				detach(text_1);
    			}
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	var div1, svg, g, path0, path1, polygon, svg_viewBox_value, t0, div0, t1_value = Number(ctx.value).toFixed(ctx.labeldecimals) + "", t1, div1_class_value, div1_style_value;

    	var each_value = ctx.ticks;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			polygon = svg_element("polygon");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			attr(g, "class", "scale svelte-1qy2i1s");
    			add_location(g, file$5, 278, 8, 9115);
    			attr(path0, "class", "outline svelte-1qy2i1s");
    			attr(path0, "d", ctx.outline);
    			add_location(path0, file$5, 284, 8, 9409);
    			attr(path1, "class", "meter svelte-1qy2i1s");
    			attr(path1, "d", ctx.meter);
    			add_location(path1, file$5, 285, 8, 9456);
    			attr(polygon, "class", "needle svelte-1qy2i1s");
    			attr(polygon, "points", ctx.needle);
    			add_location(polygon, file$5, 286, 8, 9499);
    			attr(svg, "height", ctx.H);
    			attr(svg, "width", ctx.W);
    			attr(svg, "viewBox", svg_viewBox_value = "0 0 " + ctx.W + " " + ctx.H);
    			add_location(svg, file$5, 277, 4, 9053);
    			attr(div0, "class", "output svelte-1qy2i1s");
    			add_location(div0, file$5, 288, 4, 9560);
    			attr(div1, "class", div1_class_value = "gauge " + ctx.config.class + " svelte-1qy2i1s");
    			attr(div1, "style", div1_style_value = ctx.config.style);
    			add_location(div1, file$5, 276, 0, 8990);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, svg);
    			append(svg, g);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append(svg, path0);
    			append(svg, path1);
    			append(svg, polygon);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.ticks) {
    				each_value = ctx.ticks;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.meter) {
    				attr(path1, "d", ctx.meter);
    			}

    			if (changed.needle) {
    				attr(polygon, "points", ctx.needle);
    			}

    			if ((changed.value || changed.labeldecimals) && t1_value !== (t1_value = Number(ctx.value).toFixed(ctx.labeldecimals) + "")) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.config) && div1_class_value !== (div1_class_value = "gauge " + ctx.config.class + " svelte-1qy2i1s")) {
    				attr(div1, "class", div1_class_value);
    			}

    			if ((changed.config) && div1_style_value !== (div1_style_value = ctx.config.style)) {
    				attr(div1, "style", div1_style_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function validateValue(value, min, max) {
        let result = value;

        if(isNaN(value) || value === '') {
            result = min;
        }

        /* Convert from string to number */
        result = result * 1.0;

        if(value < min || value > max) {
            result = min;
        }

        return result;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	/*Gauge inspired by https://codepen.io/enxaneta/pen/EVYRJJ*/

        /* Note: Default values are managed externally in file.js */
        let { config, data = {value: 0} } = $$props;

        let rad = Math.PI / 180,
                W = 300, /* widget bounding box width */
                H = 165, /* widget bounding box height */
                A = 180, /* Angle of gauge*/
                offset = 40, /* space between bounding box and arc */
                cx = ~~(W / 2), /* ~~ is roughly same as Math.floor() - used to obtain int from float for example - cx is center point horizontally */
                cy = 160, /* center point vertically */
                r1 = cx - offset, /* radius */
                delta = ~~(r1 / 4),
                x1 = cx + r1, /* end of arc (outside edge) */
                y1 = cy, /* end of arc (outside edge) */
                r2 = r1 - delta, /* radius */
                x2 = offset, /* start of arc */
                y2 = cy, /* start of arc */
                x3 = x1 - delta, /* end of arc (inside edge) */
                y3 = cy, /* end of arc (inside edge) */
                outline = getOutline();

        let ticks, a, meter, needle, min, max, value;

        function getTicks(min, max) {
            let sr1 = r1 + 5,
                    sr2 = r2 - 5,
                    srT = r1 + 20,
                    ticks = [];

            let n = 0,
                    amount = (Math.abs(max - min) / 10);
            for (let sa = -A; sa <= 0; sa += 18) {
                let sx1 = cx + sr1 * Math.cos(sa * rad),
                        sy1 = cy + sr1 * Math.sin(sa * rad),
                        sx2 = cx + sr2 * Math.cos(sa * rad),
                        sy2 = cy + sr2 * Math.sin(sa * rad),
                        sxT = cx + srT * Math.cos(sa * rad),
                        syT = cy + srT * Math.sin(sa * rad),
                        line = {
                            x1: sx1,
                            y1: sy1,
                            x2: sx2,
                            y2: sy2
                        },
                        t = min + (n * amount),
                        label = {
                            x: sxT,
                            y: syT,
                            text: tickdecimals ? t.toFixed(tickdecimals) : t
                        };

                ticks.push({line: line, label: label});

                n++;
            }

            return ticks;
        }

        function getNeedle(a) {
            let nx1 = cx + 5 * Math.cos((a - 90) * rad),
                    ny1 = cy + 5 * Math.sin((a - 90) * rad),
                    nx2 = cx + (r1 + 15) * Math.cos(a * rad),
                    ny2 = cy + (r1 + 15) * Math.sin(a * rad),
                    nx3 = cx + 5 * Math.cos((a + 90) * rad),
                    ny3 = cy + 5 * Math.sin((a + 90) * rad);

            return nx1 + "," + ny1 + " " + nx2 + "," + ny2 + " " + nx3 + "," + ny3;
        }

        /* this function returns a relative angle to outline arc, which is NOT what SVG uses. */
        function getAngle(val, min, max) {
            let /*newVal = (!isNaN(val) && val >= min && val <= max) ? val : min,*/
                    scale = A / Math.abs(max - min),
                    zeroAdj = Math.abs(0 - min),
                    pa = ((val + zeroAdj) * scale) - A,
                    p = {};

            p.x = cx + r1 * Math.cos(pa * rad);
            p.y = cy + r1 * Math.sin(pa * rad);

            let x = p.x,
                    y = p.y,
                    lx = cx - x,
                    ly = cy - y;

            return Math.atan2(ly, lx) / rad - A;
        }

        function getOutline() {
            return "M " + x1 + ", " + y1 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x3 + "," + y3 + " z";
        }

        function getMeter(a) {
            a *= rad;
            let     x4 = cx + r1 * Math.cos(a),
                    y4 = cy + r1 * Math.sin(a),
                    x5 = cx + r2 * Math.cos(a),
                    y5 = cy + r2 * Math.sin(a);

            // Move to x4,y4 then create arc with radius r1 with 0 deg rotation small arc flag and anticlockwise sweep flag ending at x2, y2
            // then draw horizontal line to create bar thickness then arc again with inner radius with 0 deg rotation, small arc flag and clockwise sweep flag ending at x5,y5
            return "M " + x4 + ", " + y4 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x5 + "," + y5 + " z";
        }

    	const writable_props = ['config', 'data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Gauge> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    	};

    	let labeldecimals, tickdecimals;

    	$$self.$$.update = ($$dirty = { config: 1, min: 1, max: 1, data: 1, value: 1, a: 1 }) => {
    		if ($$dirty.config) { $$invalidate('labeldecimals', labeldecimals = config.dataprovider.labeldecimals); }
    		if ($$dirty.config) { tickdecimals = config.dataprovider.tickdecimals; }
    		if ($$dirty.config || $$dirty.min || $$dirty.max || $$dirty.data || $$dirty.value || $$dirty.a) { {
                    /*console.log('dataprovider', config.dataprovider.name);*/
            
                    $$invalidate('min', min = config.dataprovider.min);
                    $$invalidate('max', max = config.dataprovider.max);
            
                    if(isNaN(min) || min === '') {
                        $$invalidate('min', min = 0);
                    }
            
                    if(isNaN(max) || max === '') {
                        $$invalidate('max', max = 100);
                    }
            
                    /* Convert from String to number (could use parseFloat instead) */
                    $$invalidate('min', min = min * 1.0);
                    $$invalidate('max', max = max * 1.0);
            
                    if(min > max) {
                        $$invalidate('min', min = 0);
                        $$invalidate('max', max = 100);
                    }
            
                    $$invalidate('value', value = validateValue(data.value, min, max));
            
                    /*criticalMin = 50;
                    criticalMax = 75;
            
                    criticalMinAngle = getAngle(criticalMin, min, max);
                    criticalMaxAngle = getAngle(criticalMax, min, max);
            
                    console.log(criticalMinAngle);
                    console.log(criticalMaxAngle);*/
            
                    $$invalidate('ticks', ticks = getTicks(min, max));
                    $$invalidate('a', a = getAngle(value, min, max));
                    /*console.log('value', value);
                    console.log('min', min);
                    console.log('max', max);
                    console.log('a', a);*/
                    $$invalidate('meter', meter = getMeter(a));
                    $$invalidate('needle', needle = getNeedle(a));
                    //critical = getCritical(criticalMinAngle, criticalMaxAngle);
                } }
    	};

    	return {
    		config,
    		data,
    		W,
    		H,
    		outline,
    		ticks,
    		meter,
    		needle,
    		value,
    		labeldecimals
    	};
    }

    class Gauge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$f, safe_not_equal, ["config", "data"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<Gauge> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get data() {
    		return this.$$.ctx.data;
    	}

    	set data(data) {
    		this.$set({ data });
    		flush();
    	}
    }

    /* src\dataproviders\StaticGauge.svelte generated by Svelte v3.9.1 */

    function create_fragment$g(ctx) {
    	var current;

    	var gauge = new Gauge({
    		props: { config: ctx.config, data: ctx.data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			gauge.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(gauge, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var gauge_changes = {};
    			if (changed.config) gauge_changes.config = ctx.config;
    			if (changed.data) gauge_changes.data = ctx.data;
    			gauge.$set(gauge_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(gauge.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(gauge.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(gauge, detaching);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { config = {} } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<StaticGauge> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let data;

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { $$invalidate('data', data = {value: config.dataprovider.value}); }
    	};

    	return { config, data };
    }

    class StaticGauge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$g, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\RandomNumberGeneratorGauge.svelte generated by Svelte v3.9.1 */

    function create_fragment$h(ctx) {
    	var t, current;

    	var datasource = new RandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	var gauge = new Gauge({
    		props: { config: ctx.config, data: ctx.data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			gauge.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(gauge, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var gauge_changes = {};
    			if (changed.config) gauge_changes.config = ctx.config;
    			if (changed.data) gauge_changes.data = ctx.data;
    			gauge.$set(gauge_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(gauge.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(gauge.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(gauge, detaching);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	

        let { config = {} } = $$props;

        let data = {value: 0};

        function update(e) {
            if(e.detail.value !== undefined) {
                data.value = e.detail.value; $$invalidate('data', data);
            }
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<RandomNumberGeneratorGauge> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return { config, data, update };
    }

    class RandomNumberGeneratorGauge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$h, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\dataproviders\SharedRandomNumberGeneratorGauge.svelte generated by Svelte v3.9.1 */

    function create_fragment$i(ctx) {
    	var t, current;

    	var datasource = new SharedRandomNumberGenerator({
    		props: { config: ctx.config.dataprovider },
    		$$inline: true
    	});
    	datasource.$on("value", ctx.update);

    	var gauge = new Gauge({
    		props: { config: ctx.config, data: ctx.data },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			datasource.$$.fragment.c();
    			t = space();
    			gauge.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(datasource, target, anchor);
    			insert(target, t, anchor);
    			mount_component(gauge, target, anchor);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			var datasource_changes = {};
    			if (changed.config) datasource_changes.config = ctx.config.dataprovider;
    			datasource.$set(datasource_changes);

    			var gauge_changes = {};
    			if (changed.config) gauge_changes.config = ctx.config;
    			if (changed.data) gauge_changes.data = ctx.data;
    			gauge.$set(gauge_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasource.$$.fragment, local);

    			transition_in(gauge.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(datasource.$$.fragment, local);
    			transition_out(gauge.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(datasource, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(gauge, detaching);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	

        let { config = {} } = $$props;

        let data = {value: 0};

        function update(e) {
            if(e.detail.value !== undefined) {
                data.value = e.detail.value; $$invalidate('data', data);
            }
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SharedRandomNumberGeneratorGauge> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	return { config, data, update };
    }

    class SharedRandomNumberGeneratorGauge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$i, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    function initWidgets() {
        widgets['Panel'] = {constructor: Panel, defaults: {style: '', class: '', items: []}, icon: 'window-restore.svg'};
        widgets['Shape'] = {constructor: Shape, defaults: {style: 'stroke: black; fill: none; width: 400px; height: 400px;', class: '', viewBox: '0 0 400 400', d: 'M 150,150 h 100 v 100 h -100 z'}, icon: 'shapes.svg'};
        widgets['Arc'] = {constructor: Arc, defaults: {style: 'stroke: black; fill: none; width: 400px; height: 400px;', class: '', viewBox: '0 0 400 400', cx: 200, cy: 200, rx: 100, ry: 100, sweepStart: 0, sweepDelta: 180, rotation: 0}, icon: 'circle-notch.svg'};
        widgets['Label'] = {
            constructor: Label,
            dataproviders: {
                'Static': {constructor: StaticLabel, defaults: {value: 'Unlabeled'}},
                'RNG': {constructor: RandomNumberGeneratorLabel, defaults: {min: 0, max: 10, hz: 1, tween: false}},
                'Shared RNG': {constructor: SharedRandomNumberGeneratorLabel, defaults: {channel: 'a'}}
            },
            defaults: {dataprovider: {name: 'Static'}, style: '', class: '', decimals: 2},
            icon: 'sticky-note.svg'
        };
        widgets['Gauge'] = {
            constructor: Gauge,
            dataproviders: {
                'Static': {constructor: StaticGauge, defaults: {value: 0, min: 0, max: 100, labeldecimals: 2, tickdecimals: 0}},
                'RNG': {constructor: RandomNumberGeneratorGauge, defaults: {min: 0, max: 10, hz: 1, labeldecimals: 2, tickdecimals: 0, tween: true}},
                'Shared RNG': {constructor: SharedRandomNumberGeneratorGauge, defaults: {min: 0, max: 10, channel: 'a', labeldecimals: 2, tickdecimals: 0}}
            },
            defaults: {dataprovider: {name: 'Static'}, style: '', class: ''},
            icon: 'tachometer-alt.svg'
        };
        widgets['Indicator'] = {
            constructor: Indicator,
            dataproviders: {
                'Static': {constructor: StaticIndicator, defaults: {value: 0}},
                'RNG': {constructor: RandomNumberGeneratorIndicator, defaults: {min: 0, max: 1, hz: 1, tween: false}},
                'Shared RNG': {constructor: SharedRandomNumberGeneratorIndicator, defaults: {channel: 'a'}}
            },
            defaults: {dataprovider: {name: 'Static'}, style: '', class: '', onIf: function(data){return data.value > 0}, flash: true},
            icon: 'lightbulb.svg'
        };
    }

    async function openRemoteFile(url) {
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok) {
            return openFile(text);

        } else {
            throw new Error(text);
        }
    }
    function openFile(text) {
        let obj = JSON.parse(text);

        assignUniqueIdAndParentSetDefaultsThenStore(undefined, obj);

        model.set(obj);

        return obj;
    }

    function assignUniqueIdAndParentSetDefaultsThenStore(par, obj) {
        prepareInstance(par, obj);

        if(obj.items) {
            for (const item of obj.items) {
                assignUniqueIdAndParentSetDefaultsThenStore(obj, item);
            }
        }
    }

    /* src\manager\widgets\Drawer.svelte generated by Svelte v3.9.1 */

    const file$6 = "src\\manager\\widgets\\Drawer.svelte";

    const get_main_slot_changes = () => ({});
    const get_main_slot_context = () => ({});

    const get_aside_slot_changes = () => ({});
    const get_aside_slot_context = () => ({});

    function create_fragment$j(ctx) {
    	var div2, button_1, t0, div0, t1, div1, current, dispose;

    	const aside_slot_template = ctx.$$slots.aside;
    	const aside_slot = create_slot(aside_slot_template, ctx, get_aside_slot_context);

    	const main_slot_template = ctx.$$slots.main;
    	const main_slot = create_slot(main_slot_template, ctx, get_main_slot_context);

    	return {
    		c: function create() {
    			div2 = element("div");
    			button_1 = element("button");
    			t0 = space();
    			div0 = element("div");

    			if (aside_slot) aside_slot.c();
    			t1 = space();
    			div1 = element("div");

    			if (main_slot) main_slot.c();
    			attr(button_1, "class", "button extra svelte-rju5fk");
    			add_location(button_1, file$6, 54, 4, 1154);

    			attr(div0, "class", "aside svelte-rju5fk");
    			add_location(div0, file$6, 55, 4, 1239);

    			attr(div1, "class", "main svelte-rju5fk");
    			add_location(div1, file$6, 58, 4, 1332);
    			attr(div2, "class", "drawer svelte-rju5fk");
    			toggle_class(div2, "open", ctx.open);
    			add_location(div2, file$6, 53, 0, 1108);
    			dispose = listen(button_1, "click", ctx.toggle);
    		},

    		l: function claim(nodes) {
    			if (aside_slot) aside_slot.l(div0_nodes);

    			if (main_slot) main_slot.l(div1_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, button_1);
    			ctx.button_1_binding(button_1);
    			append(div2, t0);
    			append(div2, div0);

    			if (aside_slot) {
    				aside_slot.m(div0, null);
    			}

    			ctx.div0_binding(div0);
    			append(div2, t1);
    			append(div2, div1);

    			if (main_slot) {
    				main_slot.m(div1, null);
    			}

    			ctx.div1_binding(div1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (aside_slot && aside_slot.p && changed.$$scope) {
    				aside_slot.p(
    					get_slot_changes(aside_slot_template, ctx, changed, get_aside_slot_changes),
    					get_slot_context(aside_slot_template, ctx, get_aside_slot_context)
    				);
    			}

    			if (main_slot && main_slot.p && changed.$$scope) {
    				main_slot.p(
    					get_slot_changes(main_slot_template, ctx, changed, get_main_slot_changes),
    					get_slot_context(main_slot_template, ctx, get_main_slot_context)
    				);
    			}

    			if (changed.open) {
    				toggle_class(div2, "open", ctx.open);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside_slot, local);
    			transition_in(main_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(aside_slot, local);
    			transition_out(main_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			ctx.button_1_binding(null);

    			if (aside_slot) aside_slot.d(detaching);
    			ctx.div0_binding(null);

    			if (main_slot) main_slot.d(detaching);
    			ctx.div1_binding(null);
    			dispose();
    		}
    	};
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { config = {} } = $$props;

        let open = true;
        let button;
        let aside;
        let main;

        function toggle() {
            $$invalidate('open', open = !open);
        }

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Drawer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('button', button = $$value);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('aside', aside = $$value);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('main', main = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		config,
    		open,
    		button,
    		aside,
    		main,
    		toggle,
    		button_1_binding,
    		div0_binding,
    		div1_binding,
    		$$slots,
    		$$scope
    	};
    }

    class Drawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$j, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\manager\widgets\TreeNode.svelte generated by Svelte v3.9.1 */

    const file$7 = "src\\manager\\widgets\\TreeNode.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (35:0) {#if config.items != null}
    function create_if_block$2(ctx) {
    	var ul, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.config.items;

    	const get_key = ctx => ctx.item.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			ul = element("ul");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(ul, "class", "svelte-1ggu8zd");
    			add_location(ul, file$7, 35, 4, 838);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ul, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(ul, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.config.items;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ul);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    // (37:8) {#each config.items as item (item.id)}
    function create_each_block$2(key_1, ctx) {
    	var li, updating_selected, t, current;

    	function treenode_selected_binding(value) {
    		ctx.treenode_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let treenode_props = {
    		config: ctx.item,
    		iconizer: ctx.iconizer
    	};
    	if (ctx.selected !== void 0) {
    		treenode_props.selected = ctx.selected;
    	}
    	var treenode = new TreeNode({ props: treenode_props, $$inline: true });

    	binding_callbacks.push(() => bind(treenode, 'selected', treenode_selected_binding));

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			li = element("li");
    			treenode.$$.fragment.c();
    			t = space();
    			attr(li, "class", "svelte-1ggu8zd");
    			add_location(li, file$7, 37, 12, 904);
    			this.first = li;
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			mount_component(treenode, li, null);
    			append(li, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var treenode_changes = {};
    			if (changed.config) treenode_changes.config = ctx.item;
    			if (changed.iconizer) treenode_changes.iconizer = ctx.iconizer;
    			if (!updating_selected && changed.selected) {
    				treenode_changes.selected = ctx.selected;
    			}
    			treenode.$set(treenode_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(treenode.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(treenode.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			destroy_component(treenode);
    		}
    	};
    }

    function create_fragment$k(ctx) {
    	var span, t0_value = ctx.config.name + "", t0, span_id_value, t1, if_block_anchor, current, dispose;

    	var if_block = (ctx.config.items != null) && create_if_block$2(ctx);

    	return {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(span, "id", span_id_value = ctx.config.id);
    			attr(span, "style", ctx.style);
    			attr(span, "class", "svelte-1ggu8zd");
    			toggle_class(span, "selected", ctx.selected === ctx.config.id);
    			add_location(span, file$7, 33, 0, 662);
    			dispose = listen(span, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			insert(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.config) && t0_value !== (t0_value = ctx.config.name + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.config) && span_id_value !== (span_id_value = ctx.config.id)) {
    				attr(span, "id", span_id_value);
    			}

    			if (!current || changed.style) {
    				attr(span, "style", ctx.style);
    			}

    			if ((changed.selected || changed.config)) {
    				toggle_class(span, "selected", ctx.selected === ctx.config.id);
    			}

    			if (ctx.config.items != null) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    				detach(t1);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}

    			dispose();
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { config, selected, iconizer } = $$props;

        let style = '';
        let icon = iconizer ? iconizer(config) : undefined;

        if(icon) {
            $$invalidate('style', style = 'background-image: url(icons/' + icon + ');');
        }

    	const writable_props = ['config', 'selected', 'iconizer'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<TreeNode> was created with unknown prop '${key}'`);
    	});

    	function click_handler(e) {
    		const $$result = selected = config.id;
    		$$invalidate('selected', selected);
    		return $$result;
    	}

    	function treenode_selected_binding(value) {
    		selected = value;
    		$$invalidate('selected', selected);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('iconizer' in $$props) $$invalidate('iconizer', iconizer = $$props.iconizer);
    	};

    	return {
    		config,
    		selected,
    		iconizer,
    		style,
    		click_handler,
    		treenode_selected_binding
    	};
    }

    class TreeNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$k, safe_not_equal, ["config", "selected", "iconizer"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.config === undefined && !('config' in props)) {
    			console.warn("<TreeNode> was created without expected prop 'config'");
    		}
    		if (ctx.selected === undefined && !('selected' in props)) {
    			console.warn("<TreeNode> was created without expected prop 'selected'");
    		}
    		if (ctx.iconizer === undefined && !('iconizer' in props)) {
    			console.warn("<TreeNode> was created without expected prop 'iconizer'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}

    	get iconizer() {
    		return this.$$.ctx.iconizer;
    	}

    	set iconizer(iconizer) {
    		this.$set({ iconizer });
    		flush();
    	}
    }

    /* src\manager\widgets\Tree.svelte generated by Svelte v3.9.1 */

    const file$8 = "src\\manager\\widgets\\Tree.svelte";

    function create_fragment$l(ctx) {
    	var div, updating_selected, current;

    	function treenode_selected_binding(value) {
    		ctx.treenode_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let treenode_props = {
    		config: ctx.config,
    		iconizer: ctx.iconizer
    	};
    	if (ctx.selected !== void 0) {
    		treenode_props.selected = ctx.selected;
    	}
    	var treenode = new TreeNode({ props: treenode_props, $$inline: true });

    	binding_callbacks.push(() => bind(treenode, 'selected', treenode_selected_binding));

    	return {
    		c: function create() {
    			div = element("div");
    			treenode.$$.fragment.c();
    			attr(div, "class", "tree");
    			add_location(div, file$8, 6, 0, 156);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(treenode, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var treenode_changes = {};
    			if (changed.config) treenode_changes.config = ctx.config;
    			if (changed.iconizer) treenode_changes.iconizer = ctx.iconizer;
    			if (!updating_selected && changed.selected) {
    				treenode_changes.selected = ctx.selected;
    			}
    			treenode.$set(treenode_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(treenode.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(treenode.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(treenode);
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { config = {}, selected = null, iconizer } = $$props;

    	const writable_props = ['config', 'selected', 'iconizer'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Tree> was created with unknown prop '${key}'`);
    	});

    	function treenode_selected_binding(value) {
    		selected = value;
    		$$invalidate('selected', selected);
    	}

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('iconizer' in $$props) $$invalidate('iconizer', iconizer = $$props.iconizer);
    	};

    	return {
    		config,
    		selected,
    		iconizer,
    		treenode_selected_binding
    	};
    }

    class Tree extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$l, safe_not_equal, ["config", "selected", "iconizer"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.iconizer === undefined && !('iconizer' in props)) {
    			console.warn("<Tree> was created without expected prop 'iconizer'");
    		}
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}

    	get iconizer() {
    		return this.$$.ctx.iconizer;
    	}

    	set iconizer(iconizer) {
    		this.$set({ iconizer });
    		flush();
    	}
    }

    /* src\manager\aside\pane\DataProviderPropertiesPane.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1$2 } = globals;

    const file$9 = "src\\manager\\aside\\pane\\DataProviderPropertiesPane.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object_1$2.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (36:8) {#if !nonEditable.includes(key)}
    function create_if_block$3(ctx) {
    	var div0, t0_value = ctx.key + "", t0, t1, div1, input, dispose;

    	function input_input_handler() {
    		ctx.input_input_handler.call(input, ctx);
    	}

    	return {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			add_location(div0, file$9, 36, 12, 1172);
    			attr(input, "type", "text");
    			add_location(input, file$9, 37, 40, 1230);
    			attr(div1, "class", "editable-value");
    			add_location(div1, file$9, 37, 12, 1202);
    			dispose = listen(input, "input", input_input_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, t0);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, input);

    			set_input_value(input, ctx.properties[ctx.key]);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.properties) && t0_value !== (t0_value = ctx.key + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.properties || changed.Object) && (input.value !== ctx.properties[ctx.key])) set_input_value(input, ctx.properties[ctx.key]);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t1);
    				detach(div1);
    			}

    			dispose();
    		}
    	};
    }

    // (35:4) {#each Object.keys(properties).sort() as key}
    function create_each_block$3(ctx) {
    	var show_if = !ctx.nonEditable.includes(ctx.key), if_block_anchor;

    	var if_block = (show_if) && create_if_block$3(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.properties) show_if = !ctx.nonEditable.includes(ctx.key);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$m(ctx) {
    	var each_1_anchor;

    	var each_value = ctx.Object.keys(ctx.properties).sort();

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.nonEditable || changed.Object || changed.properties) {
    				each_value = ctx.Object.keys(ctx.properties).sort();

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { component, provider, properties } = $$props;

        let defaultConfig = {};

            let nonEditable = ['name', 'id', 'items', 'par'];

    	const writable_props = ['component', 'provider', 'properties'];
    	Object_1$2.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<DataProviderPropertiesPane> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler({ key }) {
    		properties[key] = this.value;
    		$$invalidate('properties', properties), $$invalidate('provider', provider), $$invalidate('component', component), $$invalidate('defaultConfig', defaultConfig);
    		$$invalidate('Object', Object);
    	}

    	$$self.$set = $$props => {
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('provider' in $$props) $$invalidate('provider', provider = $$props.provider);
    		if ('properties' in $$props) $$invalidate('properties', properties = $$props.properties);
    	};

    	$$self.$$.update = ($$dirty = { provider: 1, component: 1, defaultConfig: 1, properties: 1 }) => {
    		if ($$dirty.provider || $$dirty.component || $$dirty.defaultConfig || $$dirty.properties) { {
                    if(provider) {
                        $$invalidate('defaultConfig', defaultConfig = widgets[component].dataproviders[provider].defaults);
                        if(defaultConfig) {
            
                            Object.keys(defaultConfig).forEach(key => {
                                if(!(key in properties)) {
                                    /*console.log('adding key', key);*/
                                    properties[key] = defaultConfig[key]; $$invalidate('properties', properties), $$invalidate('provider', provider), $$invalidate('component', component), $$invalidate('defaultConfig', defaultConfig);
                                }
                            });
            
                            /*properties = {...defaultConfig, ...properties};*/
                            Object.keys(properties).forEach(key => {
                                if (key !== 'name' && !(key in defaultConfig)) {
                                    /*console.log('removing key', key);*/
                                    delete properties[key];
                                }
                            });
                        }
                    }
                } }
    	};

    	return {
    		component,
    		provider,
    		properties,
    		nonEditable,
    		Object,
    		input_input_handler
    	};
    }

    class DataProviderPropertiesPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$m, safe_not_equal, ["component", "provider", "properties"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.component === undefined && !('component' in props)) {
    			console.warn("<DataProviderPropertiesPane> was created without expected prop 'component'");
    		}
    		if (ctx.provider === undefined && !('provider' in props)) {
    			console.warn("<DataProviderPropertiesPane> was created without expected prop 'provider'");
    		}
    		if (ctx.properties === undefined && !('properties' in props)) {
    			console.warn("<DataProviderPropertiesPane> was created without expected prop 'properties'");
    		}
    	}

    	get component() {
    		return this.$$.ctx.component;
    	}

    	set component(component) {
    		this.$set({ component });
    		flush();
    	}

    	get provider() {
    		return this.$$.ctx.provider;
    	}

    	set provider(provider) {
    		this.$set({ provider });
    		flush();
    	}

    	get properties() {
    		return this.$$.ctx.properties;
    	}

    	set properties(properties) {
    		this.$set({ properties });
    		flush();
    	}
    }

    /* src\manager\aside\pane\PropertiesPane.svelte generated by Svelte v3.9.1 */

    const file$a = "src\\manager\\aside\\pane\\PropertiesPane.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.provider = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (26:45) 
    function create_if_block_1(ctx) {
    	var div0, t0_value = ctx.key + "", t0, t1, div1, input, dispose;

    	function input_input_handler() {
    		ctx.input_input_handler.call(input, ctx);
    	}

    	return {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			add_location(div0, file$a, 26, 12, 1122);
    			attr(input, "type", "text");
    			add_location(input, file$a, 27, 40, 1180);
    			attr(div1, "class", "editable-value");
    			add_location(div1, file$a, 27, 12, 1152);
    			dispose = listen(input, "input", input_input_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, t0);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, input);

    			set_input_value(input, ctx.$properties[ctx.key]);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.$properties) && t0_value !== (t0_value = ctx.key + "")) {
    				set_data(t0, t0_value);
    			}

    			if (changed.$properties && (input.value !== ctx.$properties[ctx.key])) set_input_value(input, ctx.$properties[ctx.key]);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t1);
    				detach(div1);
    			}

    			dispose();
    		}
    	};
    }

    // (16:8) {#if key === 'dataprovider'}
    function create_if_block$4(ctx) {
    	var div0, t1, div1, select, t2, updating_properties, current, dispose;

    	var each_value_1 = Object.keys(widgets[ctx.$properties.name].dataproviders);

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_change_handler() {
    		ctx.select_change_handler.call(select, ctx);
    	}

    	function dataproviderpropertieseditor_properties_binding(value) {
    		ctx.dataproviderpropertieseditor_properties_binding.call(null, value);
    		updating_properties = true;
    		add_flush_callback(() => updating_properties = false);
    	}

    	let dataproviderpropertieseditor_props = {
    		component: ctx.$properties.name,
    		provider: ctx.$properties[ctx.key].name
    	};
    	if (ctx.$properties.dataprovider !== void 0) {
    		dataproviderpropertieseditor_props.properties = ctx.$properties.dataprovider;
    	}
    	var dataproviderpropertieseditor = new DataProviderPropertiesPane({
    		props: dataproviderpropertieseditor_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(dataproviderpropertieseditor, 'properties', dataproviderpropertieseditor_properties_binding));

    	return {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "dataprovider";
    			t1 = space();
    			div1 = element("div");
    			select = element("select");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			dataproviderpropertieseditor.$$.fragment.c();
    			add_location(div0, file$a, 16, 12, 526);
    			if (ctx.$properties[ctx.key].name === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$a, 18, 20, 617);
    			attr(div1, "class", "editable-value");
    			add_location(div1, file$a, 17, 16, 567);
    			dispose = listen(select, "change", select_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, select);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.$properties[ctx.key].name);

    			insert(target, t2, anchor);
    			mount_component(dataproviderpropertieseditor, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.widgets || changed.$properties) {
    				each_value_1 = Object.keys(widgets[ctx.$properties.name].dataproviders);

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if (changed.$properties) select_option(select, ctx.$properties[ctx.key].name);

    			var dataproviderpropertieseditor_changes = {};
    			if (changed.$properties) dataproviderpropertieseditor_changes.component = ctx.$properties.name;
    			if (changed.$properties) dataproviderpropertieseditor_changes.provider = ctx.$properties[ctx.key].name;
    			if (!updating_properties && changed.$properties) {
    				dataproviderpropertieseditor_changes.properties = ctx.$properties.dataprovider;
    			}
    			dataproviderpropertieseditor.$set(dataproviderpropertieseditor_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dataproviderpropertieseditor.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dataproviderpropertieseditor.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t1);
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(dataproviderpropertieseditor, detaching);

    			dispose();
    		}
    	};
    }

    // (20:24) {#each Object.keys(widgets[$properties.name].dataproviders) as provider}
    function create_each_block_1(ctx) {
    	var option, t_value = ctx.provider + "", t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.provider;
    			option.value = option.__value;
    			add_location(option, file$a, 20, 28, 790);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$properties) && t_value !== (t_value = ctx.provider + "")) {
    				set_data(t, t_value);
    			}

    			if ((changed.$properties) && option_value_value !== (option_value_value = ctx.provider)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (15:4) {#each Object.keys($properties).sort() as key}
    function create_each_block$4(ctx) {
    	var show_if, current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$4,
    		create_if_block_1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.key === 'dataprovider') return 0;
    		if ((show_if == null) || changed.$properties) show_if = !!(!ctx.noneditable.includes(ctx.key));
    		if (show_if) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$n(ctx) {
    	var each_1_anchor, current;

    	var each_value = Object.keys(ctx.$properties).sort();

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.$properties || changed.widgets || changed.noneditable) {
    				each_value = Object.keys(ctx.$properties).sort();

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $properties, $$unsubscribe_properties = noop, $$subscribe_properties = () => { $$unsubscribe_properties(); $$unsubscribe_properties = subscribe(properties, $$value => { $properties = $$value; $$invalidate('$properties', $properties); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_properties());

    	

        let { selected } = $$props;

        const noneditable = ['name', 'id', 'items', 'par'];

    	const writable_props = ['selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PropertiesPane> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler({ key }) {
    		properties.update($$value => ($$value[key].name = select_value(this), $$value));
    		$$invalidate('widgets', widgets);
    	}

    	function dataproviderpropertieseditor_properties_binding(value) {
    		$properties.dataprovider = value;
    		properties.set($properties);
    	}

    	function input_input_handler({ key }) {
    		properties.update($$value => ($$value[key] = this.value, $$value));
    		$$invalidate('widgets', widgets);
    	}

    	$$self.$set = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	let properties;

    	$$self.$$.update = ($$dirty = { selected: 1 }) => {
    		if ($$dirty.selected) { properties = instanceStores[selected]; $$subscribe_properties(), $$invalidate('properties', properties); }
    	};

    	return {
    		selected,
    		noneditable,
    		properties,
    		$properties,
    		select_change_handler,
    		dataproviderpropertieseditor_properties_binding,
    		input_input_handler
    	};
    }

    class PropertiesPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$n, safe_not_equal, ["selected"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.selected === undefined && !('selected' in props)) {
    			console.warn("<PropertiesPane> was created without expected prop 'selected'");
    		}
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}
    }

    /* src\manager\aside\pane\ActionPane.svelte generated by Svelte v3.9.1 */

    const file$b = "src\\manager\\aside\\pane\\ActionPane.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.component = list[i];
    	return child_ctx;
    }

    // (109:12) {#each Object.keys(widgets) as component}
    function create_each_block$5(ctx) {
    	var option, t_value = ctx.component + "", t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.component;
    			option.value = option.__value;
    			add_location(option, file$b, 109, 16, 2925);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	var div2, div0, button0, i0, t0, button0_disabled_value, t1, select, t2, div1, button1, i1, t3, button1_disabled_value, t4, div5, div3, button2, i2, t5, button2_disabled_value, t6, div4, button3, i3, t7, button3_disabled_value, dispose;

    	var each_value = Object.keys(widgets);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t0 = text(" Add");
    			t1 = space();
    			select = element("select");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			button1 = element("button");
    			i1 = element("i");
    			t3 = text(" Remove");
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			button2 = element("button");
    			i2 = element("i");
    			t5 = text(" Up");
    			t6 = space();
    			div4 = element("div");
    			button3 = element("button");
    			i3 = element("i");
    			t7 = text(" Down");
    			attr(i0, "class", "button-icon add svelte-i73110");
    			add_location(i0, file$b, 106, 109, 2757);
    			button0.disabled = button0_disabled_value = ctx.$properties.name !== 'Panel' && ctx.$properties.name !== 'Display';
    			attr(button0, "class", "svelte-i73110");
    			add_location(button0, file$b, 106, 8, 2656);
    			add_location(select, file$b, 107, 8, 2811);
    			attr(div0, "class", "add-options svelte-i73110");
    			add_location(div0, file$b, 105, 4, 2621);
    			attr(i1, "class", "button-icon remove svelte-i73110");
    			add_location(i1, file$b, 114, 80, 3117);
    			button1.disabled = button1_disabled_value = ctx.$properties.name === 'Display';
    			attr(button1, "class", "svelte-i73110");
    			add_location(button1, file$b, 114, 8, 3045);
    			attr(div1, "class", "trash-pane");
    			add_location(div1, file$b, 113, 4, 3011);
    			attr(div2, "class", "edit-pane svelte-i73110");
    			add_location(div2, file$b, 104, 4, 2592);
    			attr(i2, "class", "button-icon arrow-up svelte-i73110");
    			add_location(i2, file$b, 119, 56, 3286);
    			button2.disabled = button2_disabled_value = !ctx.canMoveUp;
    			attr(button2, "class", "svelte-i73110");
    			add_location(button2, file$b, 119, 8, 3238);
    			add_location(div3, file$b, 118, 4, 3223);
    			attr(i3, "class", "button-icon arrow-down svelte-i73110");
    			add_location(i3, file$b, 122, 60, 3419);
    			button3.disabled = button3_disabled_value = !ctx.canMoveDown;
    			attr(button3, "class", "svelte-i73110");
    			add_location(button3, file$b, 122, 8, 3367);
    			add_location(div4, file$b, 121, 4, 3352);
    			attr(div5, "class", "order-pane svelte-i73110");
    			add_location(div5, file$b, 117, 0, 3193);

    			dispose = [
    				listen(button0, "click", ctx.add),
    				listen(button1, "click", ctx.remove),
    				listen(button2, "click", ctx.up),
    				listen(button3, "click", ctx.down)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, button0);
    			append(button0, i0);
    			append(button0, t0);
    			append(div0, t1);
    			append(div0, select);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			ctx.select_binding(select);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, button1);
    			append(button1, i1);
    			append(button1, t3);
    			insert(target, t4, anchor);
    			insert(target, div5, anchor);
    			append(div5, div3);
    			append(div3, button2);
    			append(button2, i2);
    			append(button2, t5);
    			append(div5, t6);
    			append(div5, div4);
    			append(div4, button3);
    			append(button3, i3);
    			append(button3, t7);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$properties) && button0_disabled_value !== (button0_disabled_value = ctx.$properties.name !== 'Panel' && ctx.$properties.name !== 'Display')) {
    				button0.disabled = button0_disabled_value;
    			}

    			if (changed.widgets) {
    				each_value = Object.keys(widgets);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.$properties) && button1_disabled_value !== (button1_disabled_value = ctx.$properties.name === 'Display')) {
    				button1.disabled = button1_disabled_value;
    			}

    			if ((changed.canMoveUp) && button2_disabled_value !== (button2_disabled_value = !ctx.canMoveUp)) {
    				button2.disabled = button2_disabled_value;
    			}

    			if ((changed.canMoveDown) && button3_disabled_value !== (button3_disabled_value = !ctx.canMoveDown)) {
    				button3.disabled = button3_disabled_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_each(each_blocks, detaching);

    			ctx.select_binding(null);

    			if (detaching) {
    				detach(t4);
    				detach(div5);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $properties, $$unsubscribe_properties = noop, $$subscribe_properties = () => { $$unsubscribe_properties(); $$unsubscribe_properties = subscribe(properties, $$value => { $properties = $$value; $$invalidate('$properties', $properties); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_properties());

    	let { selected } = $$props;

        let addComponentSelect;

        function add() {
            if ($properties) {
                //let obj = new components[addComponentSelect.value].constructor({target: document.createElement('div')}).config;

                let obj = {};

                obj.name = addComponentSelect.value;

                if (obj.name === 'Panel') {
                    obj.items = [];
                }

                model.addChild($properties, obj);
            }
        }

        function remove() {
            if ($properties) {
                let parent = $properties.par;
                let index = parent.items.findIndex(function(node){return node.id === selected});
                let selectNext = index > 0 ? parent.items[index - 1] : parent;

                let toBeDeleted = $properties;

                /* TODO: Neither of these works... need to investigate fix */
                $$invalidate('selected', selected = 'puddy-0');
                //selected = selectNext;

                model.remove(toBeDeleted);
            }
        }

        function up() {
            if($properties) {
                model.up($properties);
            }
        }

        function down() {
            if($properties) {
                model.down($properties);
            }
        }

        let canMoveUp = false;
        let canMoveDown = false;

    	const writable_props = ['selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ActionPane> was created with unknown prop '${key}'`);
    	});

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('addComponentSelect', addComponentSelect = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	let properties;

    	$$self.$$.update = ($$dirty = { selected: 1, $properties: 1 }) => {
    		if ($$dirty.selected) { properties = instanceStores[selected]; $$subscribe_properties(), $$invalidate('properties', properties); }
    		if ($$dirty.$properties) { {
                    if ($properties.par) {
                        let index = 0;
                        $properties.par.items.forEach(function (item, i) {
                            if (item.id === $properties.id) {
                                index = i;
                                return;
                            }
                        });
            
                        let maxIndex = $properties.par.items.length - 1;
            
                        $$invalidate('canMoveUp', canMoveUp = (index > 0));
                        $$invalidate('canMoveDown', canMoveDown = (index < maxIndex));
                    }
                } }
    	};

    	return {
    		selected,
    		addComponentSelect,
    		add,
    		remove,
    		up,
    		down,
    		canMoveUp,
    		canMoveDown,
    		properties,
    		$properties,
    		select_binding
    	};
    }

    class ActionPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$o, safe_not_equal, ["selected"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.selected === undefined && !('selected' in props)) {
    			console.warn("<ActionPane> was created without expected prop 'selected'");
    		}
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}
    }

    /* src\manager\aside\DisplayAside.svelte generated by Svelte v3.9.1 */
    const { Object: Object_1$3 } = globals;

    const file$c = "src\\manager\\aside\\DisplayAside.svelte";

    // (208:0) {:catch error}
    function create_catch_block(ctx) {
    	var p, t_value = ctx.error.message + "", t;

    	return {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$c, 208, 4, 5413);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.promise) && t_value !== (t_value = ctx.error.message + "")) {
    				set_data(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (172:0) {:then config}
    function create_then_block(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.config) && create_if_block$5(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.config) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (173:4) {#if config}
    function create_if_block$5(ctx) {
    	var div8, div0, button0, t1, button1, t3, div7, div2, hr0, t4, span0, t6, div1, updating_selected, t7, div4, hr1, t8, span1, t10, div3, t11, div6, hr2, t12, span2, t14, div5, current, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	function tree_selected_binding(value) {
    		ctx.tree_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let tree_props = {
    		config: ctx.$model,
    		iconizer: ctx.iconizer
    	};
    	if (ctx.selected !== void 0) {
    		tree_props.selected = ctx.selected;
    	}
    	var tree = new Tree({ props: tree_props, $$inline: true });

    	binding_callbacks.push(() => bind(tree, 'selected', tree_selected_binding));

    	var if_block0 = (ctx.selected) && create_if_block_2(ctx);

    	var if_block1 = (ctx.selected) && create_if_block_1$1(ctx);

    	return {
    		c: function create() {
    			div8 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Menu";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Save";
    			t3 = space();
    			div7 = element("div");
    			div2 = element("div");
    			hr0 = element("hr");
    			t4 = space();
    			span0 = element("span");
    			span0.textContent = "Model";
    			t6 = space();
    			div1 = element("div");
    			tree.$$.fragment.c();
    			t7 = space();
    			div4 = element("div");
    			hr1 = element("hr");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Properties";
    			t10 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t11 = space();
    			div6 = element("div");
    			hr2 = element("hr");
    			t12 = space();
    			span2 = element("span");
    			span2.textContent = "Actions";
    			t14 = space();
    			div5 = element("div");
    			if (if_block1) if_block1.c();
    			add_location(button0, file$c, 175, 16, 4135);
    			attr(button1, "class", "save-button svelte-dhtc2g");
    			add_location(button1, file$c, 176, 16, 4193);
    			attr(div0, "class", "button-bar svelte-dhtc2g");
    			add_location(div0, file$c, 174, 12, 4093);
    			add_location(hr0, file$c, 180, 20, 4384);
    			attr(span0, "class", "detail-header svelte-dhtc2g");
    			add_location(span0, file$c, 181, 20, 4411);
    			attr(div1, "class", "detail-pane tree-pane svelte-dhtc2g");
    			add_location(div1, file$c, 182, 16, 4469);
    			attr(div2, "class", "flex-cell svelte-dhtc2g");
    			add_location(div2, file$c, 179, 16, 4339);
    			add_location(hr1, file$c, 187, 20, 4687);
    			attr(span1, "class", "detail-header svelte-dhtc2g");
    			add_location(span1, file$c, 188, 20, 4714);
    			attr(div3, "class", "detail-pane properties-pane svelte-dhtc2g");
    			add_location(div3, file$c, 189, 16, 4777);
    			attr(div4, "class", "flex-cell svelte-dhtc2g");
    			add_location(div4, file$c, 186, 16, 4642);
    			add_location(hr2, file$c, 196, 20, 5059);
    			attr(span2, "class", "detail-header svelte-dhtc2g");
    			add_location(span2, file$c, 197, 20, 5086);
    			attr(div5, "class", "detail-pane action-pane svelte-dhtc2g");
    			add_location(div5, file$c, 198, 16, 5146);
    			attr(div6, "class", "flex-cell svelte-dhtc2g");
    			add_location(div6, file$c, 195, 16, 5014);
    			attr(div7, "class", "pane-grid svelte-dhtc2g");
    			add_location(div7, file$c, 178, 12, 4298);
    			attr(div8, "class", "wrapper svelte-dhtc2g");
    			add_location(div8, file$c, 173, 8, 4058);

    			dispose = [
    				listen(button0, "click", close),
    				listen(button1, "click", click_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div8, anchor);
    			append(div8, div0);
    			append(div0, button0);
    			append(div0, t1);
    			append(div0, button1);
    			append(div8, t3);
    			append(div8, div7);
    			append(div7, div2);
    			append(div2, hr0);
    			append(div2, t4);
    			append(div2, span0);
    			append(div2, t6);
    			append(div2, div1);
    			mount_component(tree, div1, null);
    			append(div7, t7);
    			append(div7, div4);
    			append(div4, hr1);
    			append(div4, t8);
    			append(div4, span1);
    			append(div4, t10);
    			append(div4, div3);
    			if (if_block0) if_block0.m(div3, null);
    			append(div7, t11);
    			append(div7, div6);
    			append(div6, hr2);
    			append(div6, t12);
    			append(div6, span2);
    			append(div6, t14);
    			append(div6, div5);
    			if (if_block1) if_block1.m(div5, null);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var tree_changes = {};
    			if (changed.$model) tree_changes.config = ctx.$model;
    			if (changed.iconizer) tree_changes.iconizer = ctx.iconizer;
    			if (!updating_selected && changed.selected) {
    				tree_changes.selected = ctx.selected;
    			}
    			tree.$set(tree_changes);

    			if (ctx.selected) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, null);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.selected) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(tree.$$.fragment, local);

    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(tree.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div8);
    			}

    			destroy_component(tree);

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};
    }

    // (191:20) {#if selected}
    function create_if_block_2(ctx) {
    	var current;

    	var propertieseditor = new PropertiesPane({
    		props: { selected: ctx.selected },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			propertieseditor.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(propertieseditor, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var propertieseditor_changes = {};
    			if (changed.selected) propertieseditor_changes.selected = ctx.selected;
    			propertieseditor.$set(propertieseditor_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(propertieseditor.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(propertieseditor.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(propertieseditor, detaching);
    		}
    	};
    }

    // (200:20) {#if selected}
    function create_if_block_1$1(ctx) {
    	var current;

    	var actionpane = new ActionPane({
    		props: { selected: ctx.selected },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			actionpane.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(actionpane, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var actionpane_changes = {};
    			if (changed.selected) actionpane_changes.selected = ctx.selected;
    			actionpane.$set(actionpane_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionpane.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(actionpane.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(actionpane, detaching);
    		}
    	};
    }

    // (170:16)       <p>...waiting</p>  {:then config}
    function create_pending_block(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			add_location(p, file$c, 170, 4, 3997);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	var await_block_anchor, promise_1, current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 'config',
    		error: 'error',
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = ctx.promise, info);

    	return {
    		c: function create() {
    			await_block_anchor = empty();

    			info.block.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, await_block_anchor, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (('promise' in changed) && promise_1 !== (promise_1 = ctx.promise) && handle_promise(promise_1, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    function sortKeys(obj, newObj) {
        let keys = Object.keys(obj);

        keys.sort();

        /* We force first key to always be name, all other keys are in alphabetical order */
        newObj.name = obj.name;

        keys.forEach(key => {
            /* Might as well remove empty properties while we're here */
            if(obj[key] !== '') {
                newObj[key] = obj[key];
            }
        });

        /* TODO: should we sort dataprovider sub-object? */

        if(obj.items) {
            newObj.items = [];
            obj.items.forEach(child => {
                let newChild = {};
                newObj.items.push(newChild);
                sortKeys(child, newChild);
            });
        }
    }

    function save(obj) {

        /*Filter out id*/
        let replacer = function (key, value) {
            if (key === 'id' || key === 'par') {
                return undefined;
            } else {
                return value;
            }
        };

        let newObj = {};

        sortKeys(obj, newObj);

        let json = JSON.stringify(newObj, replacer, 2);

        let link = document.createElement("a");

        let title = obj.title || 'display';

        link.href = "data:application/json," + encodeURIComponent(json);
        link.download = title + ".puddy";

        let body = document.getElementsByTagName('body')[0];

        body.appendChild(link);

        link.click();

        body.removeChild(link);
    }

    function close() {
        var url = [location.protocol, '//', location.host, location.pathname].join('');
        window.location.href = url;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $model;

    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => { $model = $$value; $$invalidate('$model', $model); });

    	

        let { promise } = $$props;

        /*When DOM elements mounted and data is available*/
        onMount(() => {
            promise.then(function () {
                $$invalidate('selected', selected = 'puddy-0');
            });
        });

        let selected;

        let iconizer = function(node) {
            let icon = undefined;
            let props = widgets[node.name];
            if(props) {
                icon = props.icon;
            } else if(node.name === 'Display') { /* Display widget is purposely left out of registry at this time... */
                icon = 'tv.svg';
            }
            return icon;
        };

    	const writable_props = ['promise'];
    	Object_1$3.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<DisplayAside> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ config }) {
    		return save(config);
    	}

    	function tree_selected_binding(value) {
    		selected = value;
    		$$invalidate('selected', selected);
    	}

    	$$self.$set = $$props => {
    		if ('promise' in $$props) $$invalidate('promise', promise = $$props.promise);
    	};

    	return {
    		promise,
    		selected,
    		iconizer,
    		$model,
    		click_handler,
    		tree_selected_binding
    	};
    }

    class DisplayAside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$p, safe_not_equal, ["promise"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.promise === undefined && !('promise' in props)) {
    			console.warn("<DisplayAside> was created without expected prop 'promise'");
    		}
    	}

    	get promise() {
    		return this.$$.ctx.promise;
    	}

    	set promise(promise) {
    		this.$set({ promise });
    		flush();
    	}
    }

    /* src\manager\util\Selectable.svelte generated by Svelte v3.9.1 */

    const file$d = "src\\manager\\util\\Selectable.svelte";

    function create_fragment$q(ctx) {
    	var span_1, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			span_1 = element("span");

    			if (default_slot) default_slot.c();

    			add_location(span_1, file$d, 18, 0, 502);
    			dispose = listen(span_1, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_1_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span_1, anchor);

    			if (default_slot) {
    				default_slot.m(span_1, null);
    			}

    			ctx.span_1_binding(span_1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span_1);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.span_1_binding(null);
    			dispose();
    		}
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { selected_class='selected', selected = null, filter = '*' } = $$props;

        let span;

        function refresh() {
           $$invalidate('descendents', descendents = Array.from(span.querySelectorAll(filter)));
        }

        function select(f) {
            $$invalidate('selected', selected = span.querySelector(f));
        }
    	const writable_props = ['selected_class', 'selected', 'filter'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Selectable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function span_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('span', span = $$value);
    		});
    	}

    	function click_handler(e) {
    		const $$result = selected = descendents.find(d => d === e.target);
    		$$invalidate('selected', selected);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('selected_class' in $$props) $$invalidate('selected_class', selected_class = $$props.selected_class);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('filter' in $$props) $$invalidate('filter', filter = $$props.filter);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let descendents;

    	$$self.$$.update = ($$dirty = { span: 1, filter: 1, descendents: 1, selected_class: 1, selected: 1 }) => {
    		if ($$dirty.span || $$dirty.filter) { $$invalidate('descendents', descendents = span ? Array.from(span.querySelectorAll(filter)) : []); }
    		if ($$dirty.descendents || $$dirty.selected_class || $$dirty.selected) { descendents.forEach(d => d.classList.toggle(selected_class, d === selected)); }
    	};

    	return {
    		selected_class,
    		selected,
    		filter,
    		span,
    		refresh,
    		select,
    		descendents,
    		span_1_binding,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Selectable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$q, safe_not_equal, ["selected_class", "selected", "filter", "refresh", "select"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.refresh === undefined && !('refresh' in props)) {
    			console.warn("<Selectable> was created without expected prop 'refresh'");
    		}
    		if (ctx.select === undefined && !('select' in props)) {
    			console.warn("<Selectable> was created without expected prop 'select'");
    		}
    	}

    	get selected_class() {
    		return this.$$.ctx.selected_class;
    	}

    	set selected_class(selected_class) {
    		this.$set({ selected_class });
    		flush();
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}

    	get filter() {
    		return this.$$.ctx.filter;
    	}

    	set filter(filter) {
    		this.$set({ filter });
    		flush();
    	}

    	get refresh() {
    		return this.$$.ctx.refresh;
    	}

    	set refresh(value) {
    		throw new Error("<Selectable>: Cannot set read-only property 'refresh'");
    	}

    	get select() {
    		return this.$$.ctx.select;
    	}

    	set select(value) {
    		throw new Error("<Selectable>: Cannot set read-only property 'select'");
    	}
    }

    /* src\manager\aside\NoDisplayAside.svelte generated by Svelte v3.9.1 */

    const file$e = "src\\manager\\aside\\NoDisplayAside.svelte";

    // (51:0) <Selectable bind:this="{selectable}" filter="li" bind:selected="{selected}">
    function create_default_slot(ctx) {
    	var ul, li0, t_1, li1;

    	return {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Open";
    			t_1 = space();
    			li1 = element("li");
    			li1.textContent = "New";
    			attr(li0, "class", "svelte-1h52675");
    			add_location(li0, file$e, 52, 8, 1247);
    			attr(li1, "class", "svelte-1h52675");
    			add_location(li1, file$e, 53, 8, 1270);
    			attr(ul, "class", "svelte-1h52675");
    			add_location(ul, file$e, 51, 4, 1233);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ul, anchor);
    			append(ul, li0);
    			append(ul, t_1);
    			append(ul, li1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ul);
    			}
    		}
    	};
    }

    function create_fragment$r(ctx) {
    	var div, h1, i, t0, t1, updating_selected, current;

    	function selectable_1_selected_binding(value) {
    		ctx.selectable_1_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let selectable_1_props = {
    		filter: "li",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};
    	if (ctx.selected !== void 0) {
    		selectable_1_props.selected = ctx.selected;
    	}
    	var selectable_1 = new Selectable({
    		props: selectable_1_props,
    		$$inline: true
    	});

    	ctx.selectable_1_binding(selectable_1);
    	binding_callbacks.push(() => bind(selectable_1, 'selected', selectable_1_selected_binding));

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			i = element("i");
    			t0 = text(" Puddysticks");
    			t1 = space();
    			selectable_1.$$.fragment.c();
    			attr(i, "class", "logo-icon svelte-1h52675");
    			add_location(i, file$e, 49, 8, 1107);
    			attr(h1, "class", "svelte-1h52675");
    			add_location(h1, file$e, 49, 4, 1103);
    			attr(div, "class", "svelte-1h52675");
    			add_location(div, file$e, 48, 0, 1092);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(h1, i);
    			append(h1, t0);
    			append(div, t1);
    			mount_component(selectable_1, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var selectable_1_changes = {};
    			if (changed.$$scope) selectable_1_changes.$$scope = { changed, ctx };
    			if (!updating_selected && changed.selected) {
    				selectable_1_changes.selected = ctx.selected;
    			}
    			selectable_1.$set(selectable_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectable_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(selectable_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.selectable_1_binding(null);

    			destroy_component(selectable_1);
    		}
    	};
    }

    function instance$q($$self, $$props, $$invalidate) {
    	

        let { selected = {} } = $$props;

        let selectable;

        onMount(() => {
            selectable.select('li:first-child');
        });

    	const writable_props = ['selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NoDisplayAside> was created with unknown prop '${key}'`);
    	});

    	function selectable_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('selectable', selectable = $$value);
    		});
    	}

    	function selectable_1_selected_binding(value) {
    		selected = value;
    		$$invalidate('selected', selected);
    	}

    	$$self.$set = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	return {
    		selected,
    		selectable,
    		selectable_1_binding,
    		selectable_1_selected_binding
    	};
    }

    class NoDisplayAside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$r, safe_not_equal, ["selected"]);
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}
    }

    /* src\manager\widgets\Display.svelte generated by Svelte v3.9.1 */

    const file$f = "src\\manager\\widgets\\Display.svelte";

    // (17:4) {#if $properties.theme}
    function create_if_block$6(ctx) {
    	var link, link_href_value;

    	return {
    		c: function create() {
    			link = element("link");
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", link_href_value = "themes/" + ctx.$properties.theme + ".css");
    			add_location(link, file$f, 17, 8, 442);
    		},

    		m: function mount(target, anchor) {
    			insert(target, link, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$properties) && link_href_value !== (link_href_value = "themes/" + ctx.$properties.theme + ".css")) {
    				attr(link, "href", link_href_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(link);
    			}
    		}
    	};
    }

    function create_fragment$s(ctx) {
    	var div, div_style_value, t, if_block_anchor, current;

    	var container = new Container({
    		props: { items: ctx.config.items },
    		$$inline: true
    	});

    	var if_block = (ctx.$properties.theme) && create_if_block$6(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			container.$$.fragment.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(div, "class", "display");
    			attr(div, "style", div_style_value = ctx.$properties.style);
    			add_location(div, file$f, 11, 0, 251);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(container, div, null);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(document.head, null);
    			append(document.head, if_block_anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var container_changes = {};
    			if (changed.config) container_changes.items = ctx.config.items;
    			container.$set(container_changes);

    			if ((!current || changed.$properties) && div_style_value !== (div_style_value = ctx.$properties.style)) {
    				attr(div, "style", div_style_value);
    			}

    			if (ctx.$properties.theme) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(container);

    			if (detaching) {
    				detach(t);
    			}

    			if (if_block) if_block.d(detaching);
    			detach(if_block_anchor);
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $properties, $$unsubscribe_properties = noop, $$subscribe_properties = () => { $$unsubscribe_properties(); $$unsubscribe_properties = subscribe(properties, $$value => { $properties = $$value; $$invalidate('$properties', $properties); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_properties());

    	

        let { config = {} } = $$props;

    	const writable_props = ['config'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Display> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('config' in $$props) $$invalidate('config', config = $$props.config);
    	};

    	let properties;

    	$$self.$$.update = ($$dirty = { config: 1 }) => {
    		if ($$dirty.config) { properties = instanceStores[config.id]; $$subscribe_properties(), $$invalidate('properties', properties); }
    	};

    	return { config, properties, $properties };
    }

    class Display extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$s, safe_not_equal, ["config"]);
    	}

    	get config() {
    		return this.$$.ctx.config;
    	}

    	set config(config) {
    		this.$set({ config });
    		flush();
    	}
    }

    /* src\manager\main\DisplayMain.svelte generated by Svelte v3.9.1 */

    const file$g = "src\\manager\\main\\DisplayMain.svelte";

    // (13:4) {:catch error}
    function create_catch_block$1(ctx) {
    	var p, t_value = ctx.error.message + "", t;

    	return {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$g, 13, 8, 328);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.promise) && t_value !== (t_value = ctx.error.message + "")) {
    				set_data(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (9:4) {:then config}
    function create_then_block$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.config) && create_if_block$7(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.config) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (10:8) {#if config}
    function create_if_block$7(ctx) {
    	var current;

    	var display = new Display({
    		props: { config: ctx.$model },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			display.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(display, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var display_changes = {};
    			if (changed.$model) display_changes.config = ctx.$model;
    			display.$set(display_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(display.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(display.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(display, detaching);
    		}
    	};
    }

    // (7:20)           <p>...waiting</p>      {:then config}
    function create_pending_block$1(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			add_location(p, file$g, 7, 8, 182);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    function create_fragment$t(ctx) {
    	var await_block_anchor, promise_1, current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 'config',
    		error: 'error',
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = ctx.promise, info);

    	return {
    		c: function create() {
    			await_block_anchor = empty();

    			info.block.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, await_block_anchor, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (('promise' in changed) && promise_1 !== (promise_1 = ctx.promise) && handle_promise(promise_1, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $model;

    	validate_store(model, 'model');
    	component_subscribe($$self, model, $$value => { $model = $$value; $$invalidate('$model', $model); });

    	

        let { promise } = $$props;

    	const writable_props = ['promise'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<DisplayMain> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('promise' in $$props) $$invalidate('promise', promise = $$props.promise);
    	};

    	return { promise, $model };
    }

    class DisplayMain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$t, safe_not_equal, ["promise"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.promise === undefined && !('promise' in props)) {
    			console.warn("<DisplayMain> was created without expected prop 'promise'");
    		}
    	}

    	get promise() {
    		return this.$$.ctx.promise;
    	}

    	set promise(promise) {
    		this.$set({ promise });
    		flush();
    	}
    }

    /* src\manager\main\pane\DisplayNewPane.svelte generated by Svelte v3.9.1 */

    const file$h = "src\\manager\\main\\pane\\DisplayNewPane.svelte";

    function create_fragment$u(ctx) {
    	var div, h1, t_1, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "New Display";
    			t_1 = space();
    			button = element("button");
    			button.textContent = "Blank";
    			attr(h1, "class", "svelte-1v9neyv");
    			add_location(h1, file$h, 19, 8, 504);
    			add_location(button, file$h, 20, 8, 534);
    			attr(div, "class", "new-container svelte-1v9neyv");
    			add_location(div, file$h, 18, 0, 467);
    			dispose = listen(button, "click", ctx.newBlank);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t_1);
    			append(div, button);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function instance$t($$self) {
    	

            const dispatch = createEventDispatcher();

            function newBlank() {
                    dispatch('newfile', openFile('{"name": "Display", "title": "Untitled"}'));
            }

    	return { newBlank };
    }

    class DisplayNewPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$u, safe_not_equal, []);
    	}
    }

    /* src\manager\util\LocalFileReader.svelte generated by Svelte v3.9.1 */

    const file$i = "src\\manager\\util\\LocalFileReader.svelte";

    function create_fragment$v(ctx) {
    	var button, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Open";
    			attr(button, "type", "button");
    			add_location(button, file$i, 43, 0, 1098);
    			dispose = listen(button, "click", ctx.chooseLocalFile);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function readLocalFile(input) {
        let file = input.files[0],
                reader = new FileReader();

        let promise = new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException('Could not read local file'));
            };
            reader.onload = () => {
                resolve(reader.result);
            };
        });

        reader.readAsText(file);

        return promise;
    }

    function instance$u($$self) {
    	

        const dispatch = createEventDispatcher();

        function chooseLocalFile() {

            let input = document.createElement("input");

            input.type = "file";
            input.accept = ".puddy";
            input.onchange = function () {
                let promise = readLocalFile(input);

                promise.then(function(result){
                    dispatch('localfile', openFile(result));
                });
            };

            input.click();
        }
    	return { chooseLocalFile };
    }

    class LocalFileReader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$v, safe_not_equal, []);
    	}
    }

    /* src\manager\main\pane\DisplayOpenPane.svelte generated by Svelte v3.9.1 */

    const file$j = "src\\manager\\main\\pane\\DisplayOpenPane.svelte";

    function create_fragment$w(ctx) {
    	var div, h1, t1, h3, t3, ul, li, a, t5, h2, t7, current;

    	var localfilereader = new LocalFileReader({ $$inline: true });
    	localfilereader.$on("localfile", ctx.localfile_handler);

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Open Display";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Examples";
    			t3 = space();
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			a.textContent = "Example A";
    			t5 = space();
    			h2 = element("h2");
    			h2.textContent = "Local";
    			t7 = space();
    			localfilereader.$$.fragment.c();
    			attr(h1, "class", "svelte-1alxl3l");
    			add_location(h1, file$j, 9, 8, 208);
    			add_location(h3, file$j, 10, 8, 239);
    			attr(a, "href", "?display=examples/exampleA.puddy");
    			add_location(a, file$j, 12, 20, 292);
    			add_location(li, file$j, 12, 16, 288);
    			add_location(ul, file$j, 11, 8, 266);
    			add_location(h2, file$j, 14, 8, 378);
    			set_style(div, "padding", "1em");
    			add_location(div, file$j, 8, 0, 171);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t1);
    			append(div, h3);
    			append(div, t3);
    			append(div, ul);
    			append(ul, li);
    			append(li, a);
    			append(div, t5);
    			append(div, h2);
    			append(div, t7);
    			mount_component(localfilereader, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(localfilereader.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(localfilereader.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(localfilereader);
    		}
    	};
    }

    function instance$v($$self) {
    	function localfile_handler(event) {
    		bubble($$self, event);
    	}

    	return { localfile_handler };
    }

    class DisplayOpenPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$w, safe_not_equal, []);
    	}
    }

    /* src\manager\main\NoDisplayMain.svelte generated by Svelte v3.9.1 */

    // (9:0) {:else}
    function create_else_block$1(ctx) {
    	var current;

    	var displayopen = new DisplayOpenPane({ $$inline: true });
    	displayopen.$on("localfile", ctx.localfile_handler);

    	return {
    		c: function create() {
    			displayopen.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(displayopen, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(displayopen.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(displayopen.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(displayopen, detaching);
    		}
    	};
    }

    // (7:0) {#if selected && selected.textContent === 'New'}
    function create_if_block$8(ctx) {
    	var current;

    	var displaynew = new DisplayNewPane({ $$inline: true });
    	displaynew.$on("newfile", ctx.newfile_handler);

    	return {
    		c: function create() {
    			displaynew.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(displaynew, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(displaynew.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(displaynew.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(displaynew, detaching);
    		}
    	};
    }

    function create_fragment$x(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$8,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.selected && ctx.selected.textContent === 'New') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$w($$self, $$props, $$invalidate) {
    	

        let { selected = {} } = $$props;

    	const writable_props = ['selected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NoDisplayMain> was created with unknown prop '${key}'`);
    	});

    	function newfile_handler(event) {
    		bubble($$self, event);
    	}

    	function localfile_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    	};

    	return {
    		selected,
    		newfile_handler,
    		localfile_handler
    	};
    }

    class NoDisplayMain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$x, safe_not_equal, ["selected"]);
    	}

    	get selected() {
    		return this.$$.ctx.selected;
    	}

    	set selected(selected) {
    		this.$set({ selected });
    		flush();
    	}
    }

    /* src\manager\util\DynamicPageTitle.svelte generated by Svelte v3.9.1 */

    function create_fragment$y(ctx) {
    	var title_value;

    	document.title = title_value = "Puddysticks " + ctx.$properties.title;

    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,

    		p: function update(changed, ctx) {
    			if ((changed.$properties) && title_value !== (title_value = "Puddysticks " + ctx.$properties.title)) {
    				document.title = title_value;
    			}
    		},

    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    let id = 'puddy-0';

    function instance$x($$self, $$props, $$invalidate) {
    	let $properties, $$unsubscribe_properties = noop, $$subscribe_properties = () => { $$unsubscribe_properties(); $$unsubscribe_properties = subscribe(properties, $$value => { $properties = $$value; $$invalidate('$properties', $properties); }); };

    	$$self.$$.on_destroy.push(() => $$unsubscribe_properties());

    	let properties;

    	$$self.$$.update = ($$dirty = { id: 1 }) => {
    		if ($$dirty.id) { properties = instanceStores[id]; $$subscribe_properties(), $$invalidate('properties', properties); }
    	};

    	return { properties, $properties };
    }

    class DynamicPageTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$y, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.9.1 */

    const file$k = "src\\App.svelte";

    // (47:8) {:else}
    function create_else_block_1(ctx) {
    	var updating_selected, current;

    	function nodisplaysidebar_selected_binding(value) {
    		ctx.nodisplaysidebar_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let nodisplaysidebar_props = {};
    	if (ctx.noDisplaySelected !== void 0) {
    		nodisplaysidebar_props.selected = ctx.noDisplaySelected;
    	}
    	var nodisplaysidebar = new NoDisplayAside({
    		props: nodisplaysidebar_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(nodisplaysidebar, 'selected', nodisplaysidebar_selected_binding));

    	return {
    		c: function create() {
    			nodisplaysidebar.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(nodisplaysidebar, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var nodisplaysidebar_changes = {};
    			if (!updating_selected && changed.noDisplaySelected) {
    				nodisplaysidebar_changes.selected = ctx.noDisplaySelected;
    			}
    			nodisplaysidebar.$set(nodisplaysidebar_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(nodisplaysidebar.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(nodisplaysidebar.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(nodisplaysidebar, detaching);
    		}
    	};
    }

    // (45:8) {#if display}
    function create_if_block_2$1(ctx) {
    	var current;

    	var displaysidebar = new DisplayAside({
    		props: { promise: ctx.promise },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			displaysidebar.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(displaysidebar, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var displaysidebar_changes = {};
    			if (changed.promise) displaysidebar_changes.promise = ctx.promise;
    			displaysidebar.$set(displaysidebar_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(displaysidebar.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(displaysidebar.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(displaysidebar, detaching);
    		}
    	};
    }

    // (44:4) <aside slot="aside">
    function create_aside_slot(ctx) {
    	var aside, current_block_type_index, if_block, current;

    	var if_block_creators = [
    		create_if_block_2$1,
    		create_else_block_1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.display) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			aside = element("aside");
    			if_block.c();
    			attr(aside, "slot", "aside");
    			attr(aside, "class", "svelte-1hp0vd");
    			add_location(aside, file$k, 43, 4, 1235);
    		},

    		m: function mount(target, anchor) {
    			insert(target, aside, anchor);
    			if_blocks[current_block_type_index].m(aside, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(aside, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(aside);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (54:8) {:else}
    function create_else_block$2(ctx) {
    	var updating_selected, current;

    	function nodisplaymain_selected_binding(value) {
    		ctx.nodisplaymain_selected_binding.call(null, value);
    		updating_selected = true;
    		add_flush_callback(() => updating_selected = false);
    	}

    	let nodisplaymain_props = {};
    	if (ctx.noDisplaySelected !== void 0) {
    		nodisplaymain_props.selected = ctx.noDisplaySelected;
    	}
    	var nodisplaymain = new NoDisplayMain({
    		props: nodisplaymain_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(nodisplaymain, 'selected', nodisplaymain_selected_binding));
    	nodisplaymain.$on("localfile", ctx.openLocalFile);
    	nodisplaymain.$on("newfile", ctx.openNewFile);

    	return {
    		c: function create() {
    			nodisplaymain.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(nodisplaymain, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var nodisplaymain_changes = {};
    			if (!updating_selected && changed.noDisplaySelected) {
    				nodisplaymain_changes.selected = ctx.noDisplaySelected;
    			}
    			nodisplaymain.$set(nodisplaymain_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(nodisplaymain.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(nodisplaymain.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(nodisplaymain, detaching);
    		}
    	};
    }

    // (52:8) {#if display}
    function create_if_block_1$2(ctx) {
    	var current;

    	var displaymain = new DisplayMain({
    		props: { promise: ctx.promise },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			displaymain.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(displaymain, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var displaymain_changes = {};
    			if (changed.promise) displaymain_changes.promise = ctx.promise;
    			displaymain.$set(displaymain_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(displaymain.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(displaymain.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(displaymain, detaching);
    		}
    	};
    }

    // (51:4) <main slot="main">
    function create_main_slot(ctx) {
    	var main, current_block_type_index, if_block, current;

    	var if_block_creators = [
    		create_if_block_1$2,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type_1(changed, ctx) {
    		if (ctx.display) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr(main, "slot", "main");
    			add_location(main, file$k, 50, 4, 1440);
    		},

    		m: function mount(target, anchor) {
    			insert(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(main);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (43:0) <Drawer>
    function create_default_slot$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (1:0) <style>      aside {          height: 100%;      }
    function create_catch_block$2(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (60:28)       {#if display}
    function create_then_block$2(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.display) && create_if_block$9();

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.display) {
    				if (!if_block) {
    					if_block = create_if_block$9();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    									transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (61:4) {#if display}
    function create_if_block$9(ctx) {
    	var current;

    	var dynamicpagetitle = new DynamicPageTitle({ $$inline: true });

    	return {
    		c: function create() {
    			dynamicpagetitle.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(dynamicpagetitle, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(dynamicpagetitle.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(dynamicpagetitle.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(dynamicpagetitle, detaching);
    		}
    	};
    }

    // (1:0) <style>      aside {          height: 100%;      }
    function create_pending_block$2(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function create_fragment$z(ctx) {
    	var t0, promise_1, t1, current;

    	var drawer = new Drawer({
    		props: {
    		$$slots: {
    		default: [create_default_slot$1],
    		main: [create_main_slot],
    		aside: [create_aside_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 'config',
    		error: 'null',
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = ctx.promise, info);

    	return {
    		c: function create() {
    			drawer.$$.fragment.c();
    			t0 = space();

    			info.block.c();

    			t1 = space();
    			document.title = "Puddysticks";
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(drawer, target, anchor);
    			insert(target, t0, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t1.parentNode;
    			info.anchor = t1;

    			insert(target, t1, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var drawer_changes = {};
    			if (changed.$$scope || changed.display || changed.promise || changed.noDisplaySelected) drawer_changes.$$scope = { changed, ctx };
    			drawer.$set(drawer_changes);

    			info.ctx = ctx;

    			if (('promise' in changed) && promise_1 !== (promise_1 = ctx.promise) && handle_promise(promise_1, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(drawer.$$.fragment, local);

    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(drawer.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(drawer, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			info.block.d(detaching);
    			info.token = null;
    			info = null;

    			if (detaching) {
    				detach(t1);
    			}
    		}
    	};
    }

    function instance$y($$self, $$props, $$invalidate) {
    	

        initWidgets();

        let params = new URLSearchParams(location.search),
                display = params.get("display");

        let promise;

        if(display) {
            $$invalidate('promise', promise = openRemoteFile(display));
        }

        function openLocalFile(event) {
            $$invalidate('display', display = 'localfile');
            $$invalidate('promise', promise = new Promise(function(resolve, reject){
                resolve(event.detail);
            }));
        }

        function openNewFile(event) {
            $$invalidate('display', display = 'newfile');
            $$invalidate('promise', promise = new Promise(function(resolve, reject){
                resolve(event.detail);
            }));
        }

        let noDisplaySelected;

    	function nodisplaysidebar_selected_binding(value) {
    		noDisplaySelected = value;
    		$$invalidate('noDisplaySelected', noDisplaySelected);
    	}

    	function nodisplaymain_selected_binding(value) {
    		noDisplaySelected = value;
    		$$invalidate('noDisplaySelected', noDisplaySelected);
    	}

    	return {
    		display,
    		promise,
    		openLocalFile,
    		openNewFile,
    		noDisplaySelected,
    		nodisplaysidebar_selected_binding,
    		nodisplaymain_selected_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$z, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
