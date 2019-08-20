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
    import {components} from '../registry.js';
    import { display } from '../stores.js';
    import { onMount } from 'svelte';
    import Tree from '../Tree.svelte';
    import PropertiesEditor from './PropertiesEditor.svelte';

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

        link.href = "data:application/json," + encodeURIComponent(json);
        link.download = "display.wedm";

        link.click();
    }

    function close() {
        window.location.href = '/';
    }

    function add() {
        if(selected) {
            if ($display && $display.lookup[selected] ) {
                let obj = $display.lookup[selected];

                if(obj.name === 'Display' || obj.name === 'Panel') {

                    let id = $display.nextId++;
                    let par = obj;

                    let newObj = {name: 'Label', text: 'Hello World', id: id, par: par};
                    $display.lookup[id] = newObj;
                    obj.items.push(newObj);
                    $display = $display; /*Trigger update*/
                }
            }
        }
    }

    function remove() {
        if(selected) {
            if ($display && $display.lookup[selected] ) {
                let obj = $display.lookup[selected];
                if(obj.par) {
                    let index = obj.par.items.findIndex(function (element) {
                        return element.id == obj.id;
                    });

                    selected = undefined;

                    obj.par.items.splice(index, 1);
                    $display = $display; /*Trigger update*/
                }
            }
        }
    }

    /*When DOM elements mounted and data is available*/
    onMount(() => {
        promise.then(function() {
            selected = $display.obj.id;
        });
    });

    let config;
    let selected;
</script>
{#await promise}
    <p>...waiting</p>
{:then config}
    {#if config}
        <div class="button-bar">
            <button on:click="{close}">Menu</button>
            <button class="save-button" on:click="{()=>save(config.obj)}">Save</button>
        </div>
        <hr/>
        <div class="tree-pane">
            <Tree config="{$display.obj}" bind:selected/>
        </div>
        <hr/>
        <div class="properties-pane">
            <div>Properties</div>
            {#if selected && $display.lookup[selected]}
                <PropertiesEditor bind:properties="{$display.lookup[selected]}"/>
            {/if}
        </div>
        <hr/>
        <div class="action-pane">
            <div>Actions</div>
            {#if selected && ($display.lookup[selected].name === 'Panel' || $display.lookup[selected].name === 'Display')}
            <div class="add-options">
                <select>
                {#each Object.keys(components) as component}
                    <option>{component}</option>
                {/each}
                </select>
                <button on:click="{add}">Add</button>
            </div>
            {/if}
            {#if selected && $display.lookup[selected].name != 'Display'}
                <button on:click="{remove}">Remove</button>
            {/if}
        </div>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-display-sidebar"/>