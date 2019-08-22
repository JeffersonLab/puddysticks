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

/* Store of component hierarchy - reactive */
function createModel() {
    const { subscribe, set, update } = writable({});

    const addChild = (parent, child) => {
        child.id = 'puddy-' + nextId++;
        child.par = parent;
        instances[child.id] = child;
        instanceStores[child.id] = writable(child);

        parent = instances[parent.id];
        parent.items = parent.items || [];
        parent.items.push(child);
        update(_model => {
            return Object.assign({}, _model);
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
                return Object.assign({}, _model);
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