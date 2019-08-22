<script>
    import {components, instances, instanceStores, getUniqueId, model} from '../registry.js';

    export let selected;
    $: properties = instanceStores[selected];

    let addComponentSelect;

    function add() {
            if($properties) {
                let obj = new components[addComponentSelect.value].constructor({target: document.createElement('div')}).config;

                obj.name = addComponentSelect.value;

                if(obj.name === 'Panel') {
                    obj.items = [];
                }

                model.addChild($properties, obj);
            }
    }

    function remove() {
            if ($properties) {
                model.remove($properties);
            }
    }
</script>
    {#if $properties.name === 'Panel' || $properties.name === 'Display'}
        <div class="add-options">
            <select bind:this="{addComponentSelect}">
                {#each Object.keys(components) as component}
                    <option>{component}</option>
                {/each}
            </select>
            <button on:click="{add}">Add</button>
        </div>
    {/if}
    {#if $properties.name != 'Display'}
        <button on:click="{remove}">Remove</button>
    {/if}
<svelte:options tag="puddy-action-pane"/>