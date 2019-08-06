import {components} from './registry.js';

import Tree from './Tree.svelte';
import TreeNode from './TreeNode.svelte';
import Display from './Display.svelte';
import Grid from './Grid.svelte';
import Panel from './Panel.svelte';
import Tabs from './Tabs.svelte';
import Label from './components/Label.svelte';
import Gauge from './components/Gauge.svelte';
import Indicator from './components/Indicator.svelte';
import Drawer from './Drawer.svelte';

export function initComponents() {
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