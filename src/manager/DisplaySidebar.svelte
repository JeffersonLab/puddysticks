<style>
    .wrapper {
        position: relative;
        height: 100%;
        width: 250px;
    }

    .pane-grid {
        position: absolute;
        top: 40px;
        bottom: 0;
        display: flex;
        flex-direction: column;
    }

    .pane-grid > .flex-cell {
        flex: 1;
        width: 250px;
        overflow: hidden;
        position: relative;
    }

    .pane-grid > .flex-cell > .detail-pane {
        position: absolute;
        top: 40px;
        bottom: 0;
        overflow: auto;
        margin: 8px 0 8px 8px;
        width: 242px;
    }

    .detail-header {
        margin-left: 8px;
        font-weight: bold;
    }

    .properties-pane {
        /*height: 300px;*/
        overflow: auto;
    }

    .action-pane {
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
    import { model } from '../registry.js';
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
        promise.then(function () {
            selected = 'puddy-0';
        });
    });

    let selected;
</script>
{#await promise}
    <p>...waiting</p>
{:then config}
    {#if config}
        <div class="wrapper">
            <div class="button-bar">
                <button on:click="{close}">Menu</button>
                <button class="save-button" on:click="{()=>save(config)}">Save</button>
            </div>
            <div class="pane-grid">
                <div class="flex-cell">
                    <hr/>
                    <span class="detail-header">Model</span>
                <div class="detail-pane tree-pane">
                    <Tree config="{$model}" bind:selected/>
                </div>
                </div>
                <div class="flex-cell">
                    <hr/>
                    <span class="detail-header">Properties</span>
                <div class="detail-pane properties-pane">
                    {#if selected}
                        <PropertiesEditor selected="{selected}"/>
                    {/if}
                </div>
                </div>
                <div class="flex-cell">
                    <hr/>
                    <span class="detail-header">Actions</span>
                <div class="detail-pane action-pane">
                    {#if selected}
                        <ActionPane {selected}/>
                    {/if}
                </div>
                </div>
            </div>
        </div>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-display-sidebar"/>