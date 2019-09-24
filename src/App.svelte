<style>
    aside {
        height: 100%;
    }
</style>
<script>
    import {initWidgets} from './widgets.js';
    import {openRemoteFile} from './manager/util/file.js';
    import Drawer from './manager/widgets/Drawer.svelte';
    import DisplaySidebar from "./manager/aside/DisplayAside.svelte";
    import NoDisplaySidebar from "./manager/aside/NoDisplayAside.svelte";
    import DisplayMain from "./manager/main/DisplayMain.svelte";
    import NoDisplayMain from "./manager/main/NoDisplayMain.svelte";
    import DynamicPageTitle from './manager/util/DynamicPageTitle.svelte';

    initWidgets();

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