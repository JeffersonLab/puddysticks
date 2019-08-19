<script>
    import Selectable from "../Selectable.svelte";
    import Tree from '../Tree.svelte';

    export let promise;

    function save(obj) {

        /*Filter out id*/
        let replacer = function (key, value) {
            if (key === 'id') {
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

    let config = {};
    let selected = {};
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
            <Selectable filter='span' bind:selected="{selected}">
                <Tree config="{config.obj}"/>
            </Selectable>
        </div>
        <button>Add</button>
        <button>Remove</button>
        <div>
            {#if selected && config.lookup[selected.id]}
                <ul>
                    {#each Object.keys(config.lookup[selected.id]) as key}
                        {#if key == 'datasource'}
                            <li>datasource: {config.lookup[selected.id][key].name}</li>
                        {:else if key != 'id' && key != 'items'}
                            <li>{key}: {config.lookup[selected.id][key]}</li>
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