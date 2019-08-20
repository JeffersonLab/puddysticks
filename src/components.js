import {components} from './registry.js';

import Panel from './components/Panel.svelte';
import Label from './components/Label.svelte';
import Gauge from './components/Gauge.svelte';
import Indicator from './components/Indicator.svelte';

export function initComponents() {
    components['Panel'] = Panel;
    components['Label'] = Label;
    components['Gauge'] = Gauge;
    components['Indicator'] = Indicator;
}