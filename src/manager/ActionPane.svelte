<script>
    import { writable } from 'svelte/store';
    import {components, instances, getUniqueId, componentHierarchy} from '../registry.js';

    export let selected;
    $: properties = instances[selected];

    let addComponentSelect;

    function add() {
            if ($properties) {
                /*console.log(addComponentSelect.value);*/

                if($properties.name === 'Display' || $properties.name === 'Panel') {

                    let id = getUniqueId();
                    let par = $properties;

                    /*TODO: If we define default config for each component somewhere besides inside the component we can avoid instantiating a throw-away component just to obtain it's default model*/
                    let newObj = new components[addComponentSelect.value].constructor({target: document.createElement('div')}).config;

                    newObj.name = addComponentSelect.value;
                    newObj.id = id;
                    newObj.par = par;

                    console.log(newObj);

                    instances[newObj.id] = writable(newObj);

                    $properties.items = $properties.items || [];

                    $properties.items.push(newObj);
                    $componentHierarchy = $componentHierarchy;
                }
            }
    }

    function remove() {
            if ($properties) {
                if($properties.par) {
                    let index = $properties.par.items.findIndex(function (element) {
                        return element.id == $properties.id;
                    });

                    selected = undefined;

                    $properties.par.items.splice(index, 1);
                }
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