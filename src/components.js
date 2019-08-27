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
    components['Panel'] = {constructor: Panel, defaults: {style: '', items: []}};
    components['Label'] = {
        constructor: Label,
        dataproviders: {
            'Static': {constructor: StaticLabel, defaults: {}},
            'RNG': {constructor: RandomNumberGeneratorLabel, defaults: {min: 0, max: 10, hz: 1, decimals: 2}},
            'epics2web': {constructor: epics2webLabel, defaults: {}}
        },
        defaults: {value: 'Unlabeled', dataprovider: {name: 'Static'}, style: ''}
    };
    components['Gauge'] = {
        constructor: Gauge,
        dataproviders: {
            'Static': {constructor: StaticGauge, defaults: {min: 0, max: 100, decimals: 2}},
            'RNG': {constructor: RandomNumberGeneratorGauge, defaults: {min: 0, max: 10, hz: 1, decimals: 2, tween: true}},
            'epics2web': {constructor: epics2webGauge, defaults: {}}
        },
        defaults: {value: 0, dataprovider: {name: 'Static'}, style: ''}
    };
    components['Indicator'] = {
        constructor: Indicator,
        dataproviders: {
            'Static': {constructor: StaticIndicator, defaults: {}},
            'RNG': {constructor: RandomNumberGeneratorIndicator, defaults: {min: 0, max: 1, hz: 1}},
            'epics2web': {constructor: epics2webIndicator, defaults: {}}
        },
        defaults: {value: 0, dataprovider: {name: 'Static'}, style: '', onIf: function(data){return data.value > 0}, flash: true}
    };
}