<style>
</style>
<script>
    import {initComponents} from './components.js';
    import {initMediators} from './mediators.js';
    import Display, {openRemoteFile} from './Display.svelte';
    import Tree from './Tree.svelte';
    import Drawer from './Drawer.svelte';
    import Selectable from "./Selectable.svelte";
    import DisplaySidebar from "./manager/DisplaySidebar.svelte";
    import NoDisplaySidebar from "./manager/NoDisplaySidebar.svelte";
    import DisplayMain from "./manager/DisplayMain.svelte";
    import NoDisplayMain from "./manager/NoDisplayMain.svelte";

    initComponents();
    initMediators();

    let params = new URLSearchParams(location.search),
            display = params.get("display");

    let promise;

    if(display) {
        promise = openRemoteFile(display);
    }

    let noDisplaySelected;
</script>
<Drawer>
    <aside slot="aside">
        {#if display}
            <DisplaySidebar {promise}/>
        {:else}
            <NoDisplaySidebar bind:selected="{noDisplaySelected}"/>
        {/if}
    </aside>
    <main slot="main">
        {#if display}
            <DisplayMain {promise}/>
        {:else}
            <NoDisplayMain bind:selected="{noDisplaySelected}"/>
        {/if}
    </main>
</Drawer>
<svelte:options tag="puddy-app"/>