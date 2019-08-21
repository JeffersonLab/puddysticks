/* Map of component 'palette' - constructors and their dataproviders */
export const components = {};

/* Map of component instances in the display - used to obtain reactive store of instance config */
export const instances = {};

/* Unique ID counter for component instances - if we add a new component we need a unique ID */
let nextId = 0;
export function getUniqueId() {
    return 'puddy-' + nextId++;
};

/* Store of component hierarchy - reactive */
export const componentHierarchy = {};