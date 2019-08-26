<style>
     .tree-pane {
         padding: 8px;
         height: 300px;
         overflow: auto;
     }
     .properties-pane {
         height: 300px;
         overflow: auto;
         padding: 8px;
     }
     .action-pane {
         padding: 8px;
     }
     .add-options {
         margin-bottom: 8px;
     }
     :global(.tree-pane .selected) {
        border-top: 1px solid red;
        border-bottom: 1px solid red;
        color: red;
    }
    :global(.tree-pane span) {
        border: 1px solid transparent;
    }
    .button-bar {
        padding: 8px;
    }
    .save-button {
        float: right;
    }
</style>
<script>
    import {components, instances, getUniqueId, model} from '../registry.js';
    import { onMount } from 'svelte';
    import Tree from '../Tree.svelte';
    import PropertiesEditor from './PropertiesEditor.svelte';
    import ActionPane from './ActionPane.svelte';

    export let promise;

    function save(obj) {

        /*Filter out id*/
        let replacer = function (key, value) {
            if (key === 'id' || key === 'par') {
                return undefined;
            } else {
                return value;
            }
        };

        let json = JSON.stringify(obj, replacer, 2);

        let link = document.createElement("a");

        let title = obj.title || 'display';

        link.href = "data:application/json," + encodeURIComponent(json);
        link.download = title + ".puddy";

        link.click();
    }

    function close() {
        window.location.href = '/';
    }

    /*When DOM elements mounted and data is available*/
    onMount(() => {
        promise.then(function() {
            selected = 'puddy-0';
        });
    });

    let selected;
</script>
{#await promise}
    <p>...waiting</p>
{:then config}
    {#if config}
        <div class="button-bar">
            <button on:click="{close}">Menu</button>
            <button class="save-button" on:click="{()=>save(config)}">Save</button>
        </div>
        <hr/>
        <div class="tree-pane">
            <Tree config="{$model}" bind:selected/>
        </div>
        <hr/>
        <div class="properties-pane">
            <div>Properties</div>
            {#if selected}
                <PropertiesEditor selected="{selected}"/>
            {/if}
        </div>
        <hr/>
        <div class="action-pane">
            <div>Actions</div>
            {#if selected}
                <ActionPane {selected}/>
            {/if}
        </div>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-display-sidebar"/>