<style>
    aside {
        height: 100%;
    }
    .corner-ribbon {
        top: 25px;
        right: -50px;
        left: auto;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        position: fixed;
        border: 1px solid red;
        background:  #e43;
        box-shadow: 0 0 3px rgba(0,0,0,.3);
        width: 200px;
        background: #e43;
        text-align: center;
        line-height: 50px;
        letter-spacing: 1px;
        color: #f0f0f0;
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
<div class="corner-ribbon">Pre-Release!</div>
<svelte:options tag="puddy-app"/>
{#await promise then config}
    {#if display}
        <DynamicPageTitle/>
    {/if}
{/await}
<svelte:head>
    <title>Puddysticks</title>
</svelte:head>