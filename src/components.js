import {components} from './registry.js';

import Panel from './components/Panel.svelte';

import Indicator from './components/Indicator.svelte';
import StaticIndicator from './dataproviders/StaticIndicator.svelte';
import RandomNumberGeneratorIndicator from './dataproviders/RandomNumberGeneratorIndicator.svelte';
import epics2webIndicator from './dataproviders/epics2webIndicator.svelte';

import Label from './components/Label.svelte';
import StaticLabel from './dataproviders/StaticLabel.svelte';
import RandomNumberGeneratorLabel from './dataproviders/RandomNumberGeneratorLabel.svelte';
import epics2webLabel from './dataproviders/epics2webLabel.svelte';

import Gauge from './components/Gauge.svelte';
import StaticGauge from './dataproviders/StaticGauge.svelte';
import RandomNumberGeneratorGauge from './dataproviders/RandomNumberGeneratorGauge.svelte';
import epics2webGauge from './dataproviders/epics2webGauge.svelte';

export function initComponents() {
    components['Panel'] = {constructor: Panel};
    components['Label'] = {
        constructor: Label, dataproviders: {
            'Static': StaticLabel,
            'RNG': RandomNumberGeneratorLabel,
            'epics2web': epics2webLabel
        }
    };
    components['Gauge'] = {
        constructor: Gauge, dataproviders: {
            'Static': StaticGauge,
            'RNG': RandomNumberGeneratorGauge,
            'epics2web': epics2webGauge
        }
    };
    components['Indicator'] = {
        constructor: Indicator, dataproviders: {
            'Static': StaticIndicator,
            'RNG': RandomNumberGeneratorIndicator,
            'epics2web': epics2webIndicator
        }
    };
}