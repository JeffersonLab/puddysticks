import { writable } from 'svelte/store';

/* The hierarchical display model.  The model contains widget instance configurations */
export const model = createModel();

/* Map of widget name to widget default / class configuration - a 'palette' of widgets to choose - configuration consists of constructors, data providers, and default properties */
export const widgets = {};

/* Map of widget id to widget instance configuration - for quick lookup instead of slowly traversing hierarchical model */
export const instances = {};

/* Reactive store of widget instance configuration.  This is needed because changes made to the widget instance properties in the model otherwise don't generate update events */
export const instanceStores = {};

/* Unique ID counter for widget instances - if we add a new widget we generate a unique ID for it */
let nextId = 0;
export function getUniqueId() {
    return 'puddy-' + nextId++;
};

/* Given a widget instance configuration default values are set if missing and extraneous properties not recognized are removed.
*  Also, the widget instance configuration has a unique ID property assigned and a parent widget reference added.
*  Finally, the widget instance is added to the instances map for quick lookup and an instanceStore entry is created
*  for handling event changes to instance properties */
export function prepareInstance(par, obj) {
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