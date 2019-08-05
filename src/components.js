import {components} from './registry.js';

import Tree from './Tree.svelte';
import TreeNode from './TreeNode.svelte';
import Display from './Display.svelte';
import Grid from './Grid.svelte';
import Panel from './Panel.svelte';
import Tabs from './Tabs.svelte';
import Label from './Label.svelte';
import Gauge from './Gauge.svelte';
import Indicator from './Indicator.svelte';
import Drawer from './Drawer.svelte';

export function init() {
    components['Tree'] = Tree;
    components['TreeNode'] = TreeNode;
    components['Display'] = Display;
    components['Grid'] = Grid;
    components['Panel'] = Panel;
    components['Tabs'] = Tabs;
    components['Label'] = Label;
    components['Gauge'] = Gauge;
    components['Indicator'] = Indicator;
    components['Drawer'] = Drawer;
}