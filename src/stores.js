import { writable } from 'svelte/store';

function createDisplay() {
    const { subscribe, set, update } = writable({});

    return {
        subscribe,
        set,
        update
    };
}

export const display = createDisplay();