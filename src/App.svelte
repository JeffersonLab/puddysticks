<style>
    aside {
        height: 100%;
    }
</style>
<script>
    import {initComponents} from './components.js';
    import {openRemoteFile} from './manager/file.js';
    import Drawer from './Drawer.svelte';
    import DisplaySidebar from "./manager/DisplaySidebar.svelte";
    import NoDisplaySidebar from "./manager/NoDisplaySidebar.svelte";
    import DisplayMain from "./manager/DisplayMain.svelte";
    import NoDisplayMain from "./manager/NoDisplayMain.svelte";
    import DynamicPageTitle from './manager/DynamicPageTitle.svelte';

    initComponents();

    let params = new URLSearchParams(location.search),
            display = params.get("display");

    let promise;

    if(display) {
        promise = openRemoteFile(display);
    }

    function openLocalFile(event) {
        display = 'localfile';
        promise = new Promise(function(resolve, reject){
            resolve(event.detail);
        });
    }

    function openNewFile(event) {
        display = 'newfile';
        promise = new Promise(function(resolve, reject){
            resolve(event.detail);
        });
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
            <NoDisplayMain bind:selected="{noDisplaySelected}" on:localfile="{openLocalFile}" on:newfile="{openNewFile}"/>
        {/if}
    </main>
</Drawer>
<svelte:options tag="puddy-app"/>
{#await promise then config}
    {#if display}
        <DynamicPageTitle/>
    {/if}
{/await}
<svelte:head>
    <title>Puddysticks</title>
</svelte:head>