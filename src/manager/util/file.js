import { writable } from 'svelte/store';
import { components, instances, instanceStores, getUniqueId, model, prepareInstance } from './registry.js';

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

function assignUniqueIdAndParentSetDefaultsThenStore(par, obj) {
    prepareInstance(par, obj);

    if(obj.items) {
        for (const item of obj.items) {
            assignUniqueIdAndParentSetDefaultsThenStore(obj, item);
        }
    }
}