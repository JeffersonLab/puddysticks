import { writable } from 'svelte/store';
import { instances, instanceStores, getUniqueId, model } from '../registry.js';

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

    assignUniqueIdAndParentThenStore(obj);

    model.set(obj);

    return obj;
}

function assignUniqueIdAndParentThenStore(obj, par) {
    obj.id = getUniqueId();
    obj.par = par;
    instances[obj.id] = obj;
    instanceStores[obj.id] = writable(obj);
    /*instances[obj.id] = obj;*/

    /*console.log(obj);*/

    if(obj.items) {
        for (const item of obj.items) {
            assignUniqueIdAndParentThenStore(item, obj);
        }
    }
}