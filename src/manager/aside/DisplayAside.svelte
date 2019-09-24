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

    /*Selection top border is cut-off without this*/
    :global(.tree-pane .tree) {
        margin-top: 4px;
        margin-left: 1px;
        margin-bottom: 1px;
    }

    :global(.tree-pane .selected) {
        /*border-top: 1px solid red;
        border-bottom: 1px solid red;*/
        outline: 1px dashed red;
        color: red;
    }

    :global(.tree-pane span) {
        border: 3px solid transparent;
    }

    .button-bar {
        padding: 8px;
    }

    .save-button {
        float: right;
    }
</style>
<script>
    import { components, model } from '../../registry.js';
    import { onMount } from 'svelte';
    import Tree from '../widgets/Tree.svelte';
    import PropertiesEditor from './pane/PropertiesPane.svelte';
    import ActionPane from './pane/ActionPane.svelte';

    export let promise;

    function sortKeys(obj, newObj) {
        let keys = Object.keys(obj);

        keys.sort();

        /* We force first key to always be name, all other keys are in alphabetical order */
        newObj.name = obj.name;

        keys.forEach(key => {
            /* Might as well remove empty properties while we're here */
            if(obj[key] !== '') {
                newObj[key] = obj[key];
            }
        });

        /* TODO: should we sort dataprovider sub-object? */

        if(obj.items) {
            newObj.items = [];
            obj.items.forEach(child => {
                let newChild = {};
                newObj.items.push(newChild);
                sortKeys(child, newChild);
            });
        }
    }

    function save(obj) {

        /*Filter out id*/
        let replacer = function (key, value) {
            if (key === 'id' || key === 'par') {
                return undefined;
            } else {
                return value;
            }
        };

        let newObj = {};

        sortKeys(obj, newObj);

        let json = JSON.stringify(newObj, replacer, 2);

        let link = document.createElement("a");

        let title = obj.title || 'display';

        link.href = "data:application/json," + encodeURIComponent(json);
        link.download = title + ".puddy";

        link.click();
    }

    function close() {
        var url = [location.protocol, '//', location.host, location.pathname].join('');
        window.location.href = url;
    }

    /*When DOM elements mounted and data is available*/
    onMount(() => {
        promise.then(function () {
            selected = 'puddy-0';
        });
    });

    let selected;

    let iconizer = function(node) {
        let icon = undefined;
        let props = components[node.name];
        if(props) {
            icon = props.icon;
        } else if(node.name === 'Display') { /* Display widget is purposely left out of registry at this time... */
            icon = 'tv.svg';
        }
        return icon;
    }

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
                    <Tree config="{$model}" {iconizer} bind:selected/>
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
<svelte:options tag="puddy-display-aside"/>