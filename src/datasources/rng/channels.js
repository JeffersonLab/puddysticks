import { readable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const configA = {hz: 1, max: 10, min: 0};
const configB = {hz: 2, max: 100, min: 0};
const configC = {hz: 3, max: 1000, min: 0};

function randomFloat(config) {
    return Math.random() * (config.max - config.min) + config.min;
}

function createRng(config) {
    const tweener = tweened(0, {duration: 1000 * config.hz, easing: cubicOut});
    const {subscribe, set, update} = readable(null, function start(set) {

        tweener.subscribe(value => {set(value)});

        const interval = setInterval(() => {
            tweener.set(randomFloat(config));

        }, 1000 * config.hz);

        return function stop() {
            clearInterval(interval);
        }
    });

    return {subscribe};
}

export const a = createRng(configA);
export const b = createRng(configB);
export const c = createRng(configC);