import {widgets} from './manager/util/registry.js';

import Panel from './widgets/Panel.svelte';

import Indicator from './widgets/Indicator.svelte';
import StaticIndicator from './dataproviders/StaticIndicator.svelte';
import RandomNumberGeneratorIndicator from './dataproviders/RandomNumberGeneratorIndicator.svelte';
import epics2webIndicator from './dataproviders/epics2webIndicator.svelte';

import Label from './widgets/Label.svelte';
import StaticLabel from './dataproviders/StaticLabel.svelte';
import RandomNumberGeneratorLabel from './dataproviders/RandomNumberGeneratorLabel.svelte';
import epics2webLabel from './dataproviders/epics2webLabel.svelte';

import Gauge from './widgets/Gauge.svelte';
import StaticGauge from './dataproviders/StaticGauge.svelte';
import RandomNumberGeneratorGauge from './dataproviders/RandomNumberGeneratorGauge.svelte';
import epics2webGauge from './dataproviders/epics2webGauge.svelte';

export function initWidgets() {
    widgets['Panel'] = {constructor: Panel, defaults: {style: '', class: '', items: []}, icon: 'window-restore.svg'};
    widgets['Label'] = {
        constructor: Label,
        dataproviders: {
            'Static': {constructor: StaticLabel, defaults: {value: 'Unlabeled'}},
            'RNG': {constructor: RandomNumberGeneratorLabel, defaults: {min: 0, max: 10, hz: 1, decimals: 2, tween: false}}
        },
        defaults: {dataprovider: {name: 'Static'}, style: '', class: ''},
        icon: 'sticky-note.svg'
    };
    widgets['Gauge'] = {
        constructor: Gauge,
        dataproviders: {
            'Static': {constructor: StaticGauge, defaults: {value: 0, min: 0, max: 100, labeldecimals: 2, tickdecimals: 0}},
            'RNG': {constructor: RandomNumberGeneratorGauge, defaults: {min: 0, max: 10, hz: 1, labeldecimals: 2, tickdecimals: 0, tween: true}}
        },
        defaults: {dataprovider: {name: 'Static'}, style: '', class: ''},
        icon: 'tachometer-alt.svg'
    };
    widgets['Indicator'] = {
        constructor: Indicator,
        dataproviders: {
            'Static': {constructor: StaticIndicator, defaults: {value: 0}},
            'RNG': {constructor: RandomNumberGeneratorIndicator, defaults: {min: 0, max: 1, hz: 1, tween: false}}
        },
        defaults: {dataprovider: {name: 'Static'}, style: '', class: '', onIf: function(data){return data.value > 0}, flash: true},
        icon: 'lightbulb.svg'
    };

    if('EPICS2WEB_ENABLED' === 'true') {
        widgets['Label'].dataproviders['epics2web'] = {constructor: epics2webLabel, defaults: {channel: '', decimals: 2}};
        widgets['Gauge'].dataproviders['epics2web'] = {constructor: epics2webGauge, defaults: {channel: '', min: 0, max: 10, labeldecimals: 2, tickdecimals: 0}};
        widgets['Indicator'].dataproviders['epics2web'] = {constructor: epics2webIndicator, defaults: {channel: ''}};
    }
}