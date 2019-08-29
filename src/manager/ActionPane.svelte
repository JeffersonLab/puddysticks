<script>
    import {components, instanceStores, model} from '../registry.js';

    export let selected;
    $: properties = instanceStores[selected];

    let addComponentSelect;

    function add() {
        if ($properties) {
            //let obj = new components[addComponentSelect.value].constructor({target: document.createElement('div')}).config;

            let obj = {};

            obj.name = addComponentSelect.value;

            if (obj.name === 'Panel') {
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

    function up() {
        if($properties) {
            model.up($properties);
        }
    }

    function down() {
        if($properties) {
            model.down($properties);
        }
    }

    let canMoveUp = false;
    let canMoveDown = false;

    $: {
        if ($properties.par) {
            let index = 0;
            $properties.par.items.forEach(function (item, i) {
                if (item.id === $properties.id) {
                    index = i;
                    return;
                }
            });

            let maxIndex = $properties.par.items.length - 1;

            canMoveUp = (index > 0);
            canMoveDown = (index < maxIndex);
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
    <div>
        <button on:click="{remove}">Remove</button>
    </div>
{/if}
{#if canMoveUp}
    <div>
        <button on:click="{up}">Up</button>
    </div>
{/if}
{#if canMoveDown}
    <div>
        <button on:click="{down}">Down</button>
    </div>
{/if}
<svelte:options tag="puddy-action-pane"/>