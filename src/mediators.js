import {mediators} from './registry.js';

import RandomNumberGeneratorLabel from './mediators/RandomNumberGeneratorLabel.svelte';
import RandomNumberGeneratorGauge from './mediators/RandomNumberGeneratorGauge.svelte';

export function initMediators() {
    mediators['RandomNumberGeneratorLabel'] = RandomNumberGeneratorLabel;
    mediators['RandomNumberGeneratorGauge'] = RandomNumberGeneratorGauge;
}