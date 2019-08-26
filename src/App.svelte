<style>
</style>
<script>
    import {initComponents} from './components.js';
    import {openRemoteFile} from './manager/file.js';
    import Drawer from './Drawer.svelte';
    import DisplaySidebar from "./manager/DisplaySidebar.svelte";
    import NoDisplaySidebar from "./manager/NoDisplaySidebar.svelte";
    import DisplayMain from "./manager/DisplayMain.svelte";
    import NoDisplayMain from "./manager/NoDisplayMain.svelte";

    initComponents();

    let params = new URLSearchParams(location.search),
            display = params.get("display");

    let promise;
    let title;

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

    $: {
        if(promise){
            promise.then(function(result){
                title = result.title || '';
            });
        } else {
            title = '';
        }
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
<svelte:head>
    <title>Puddysticks {title}</title>
</svelte:head>