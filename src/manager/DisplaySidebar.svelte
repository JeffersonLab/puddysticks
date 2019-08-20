<style>
    :global(#component-tree .selected) {
        border-top: 1px solid red;
        border-bottom: 1px solid red;
        color: red;
    }

    :global(#component-tree span) {
        border: 1px solid transparent;
    }
</style>
<script>
    import { display } from '../stores.js';
    import { onMount } from 'svelte';
    import Selectable from "../Selectable.svelte";
    import Tree from '../Tree.svelte';

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

    let nextId = 1000;

    function add() {
        if(selected) {
            if ($display && $display.lookup[selected.id] ) {
                let obj = $display.lookup[selected.id];

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
            if ($display && $display.lookup[selected.id] ) {
                let obj = $display.lookup[selected.id];
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
            if(selectable) {
                selectable.select('span:first-child');
            }
        });
    });

    $: if($display && selectable) {selectable.refresh()};

    let selectable;
    let config;
    let selected;
</script>
{#await promise}
    <p>...waiting</p>
{:then config}
    {#if config}
        <div>
            <button on:click="{close}">Menu</button>
            <button on:click="{()=>save(config.obj)}">Save</button>
        </div>
        <div id="component-tree">
            <Selectable bind:this="{selectable}" filter='span' bind:selected="{selected}">
                <Tree config="{$display.obj}"/>
            </Selectable>
        </div>
        <button on:click="{()=>add(config)}">Add</button>
        <button on:click="{()=>remove(config)}">Remove</button>
        <div>
            {#if selected && $display.lookup[selected.id]}
                <ul>
                    {#each Object.keys($display.lookup[selected.id]) as key}
                        {#if key == 'datasource'}
                            <li>datasource: {$display.lookup[selected.id][key].name}</li>
                        {:else if key != 'id' && key != 'items' && key != 'par'}
                            <li>{key}: {$display.lookup[selected.id][key]}</li>
                        {/if}
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-display-sidebar"/>