import { writable } from 'svelte/store';

/* Map of component 'palette' - constructors and their dataproviders */
export const components = {};

/* Map of component instance config - for quick lookup of node in model */
export const instances = {};

/* Reactive store of component instance config */
export const instanceStores = {};

/* Unique ID counter for component instances - if we add a new component we need a unique ID */
let nextId = 0;
export function getUniqueId() {
    return 'puddy-' + nextId++;
};

export function prepareInstance(par, obj) {
    obj.id = getUniqueId();
    obj.par = par;

    /* Display root component is excluded from components map, so we skip it */
    if (components[obj.name]) {
        let defaultConfig = components[obj.name].defaults;

        obj = {...defaultConfig, ...obj};
    }

    if(obj.dataprovider) {
        let dataproviderDefaults = components[obj.name].dataproviders[obj.dataprovider.name].defaults;

        obj.dataprovider = {...dataproviderDefaults, ...obj.dataprovider};
    }

    instances[obj.id] = obj;
    instanceStores[obj.id] = writable(obj);

    return obj;
}

/* Store of component hierarchy - reactive */
function createModel() {
    const { subscribe, set, update } = writable({});

    const addChild = (parent, child) => {
        child = prepareInstance(parent, child);

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

    return {
        subscribe,
        set,
        update,
        addChild,
        remove
    };
}

export const model = createModel();