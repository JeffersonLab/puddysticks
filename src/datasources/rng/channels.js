import { readable } from 'svelte/store';

const configA = {hz: 1, max: 10, min: 0};
const configB = {hz: 2, max: 100, min: 0};

function randomFloat(config) {
    return Math.random() * (config.max - config.min) + config.min;
}

export const a = readable(null, function start(set) {
    const interval = setInterval(() => {
            set(randomFloat(configA));
    }, 1000 * configA.hz);

    return function stop() {
        clearInterval(interval);
    };
});

export const b = readable(null, function start(set) {
    const interval = setInterval(() => {
        set(randomFloat(configB));
    }, 1000 * configB.hz);

    return function stop() {
        clearInterval(interval);
    };
});