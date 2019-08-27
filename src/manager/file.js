import { writable } from 'svelte/store';
import { components, instances, instanceStores, getUniqueId, model } from '../registry.js';

export async function openRemoteFile(url) {
    const res = await fetch(url);
    const text = await res.text();

    if (res.ok) {
        return openFile(text);

    } else {
        throw new Error(text);
    }
};

export function openFile(text) {
    let obj = JSON.parse(text);

    assignUniqueIdAndParentSetDefaultsThenStore(undefined, obj);

    model.set(obj);

    return obj;
}

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

function assignUniqueIdAndParentSetDefaultsThenStore(par, obj) {
    obj = prepareInstance(par, obj);

    if(obj.items) {
        for (const item of obj.items) {
            assignUniqueIdAndParentSetDefaultsThenStore(obj, item);
        }
    }
}