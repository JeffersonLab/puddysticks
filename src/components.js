import {components} from './registry.js';

import Display from './Display.svelte';
import Grid from './Grid.svelte';
import Panel from './Panel.svelte';
import Tabs from './Tabs.svelte';
import Label from './Label.svelte';
import Gauge from './Gauge.svelte';

export function init() {
    components['Display'] = Display;
    components['Grid'] = Grid;
    components['Panel'] = Panel;
    components['Tabs'] = Tabs;
    components['Label'] = Label;
    components['Gauge'] = Gauge;
}