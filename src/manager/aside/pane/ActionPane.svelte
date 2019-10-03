<style>
    .edit-pane,
    .order-pane {
        padding: 8px;
    }
    button {
        text-align: left;
        width: 90px;
        height: 32px;
        line-height: 26px;
    }
    .button-icon {
        width: 16px;
        height: 16px;
        background-size: 16px 16px;
        background-repeat: no-repeat;
        display: inline-block;
        vertical-align: text-bottom;
    }
    .arrow-up {
        background-image: url(icons/arrow-up.svg);
    }
    .arrow-down {
        background-image: url(icons/arrow-down.svg);
    }
    .add {
        background-image: url(icons/plus.svg);
    }
    .remove {
        background-image: url(icons/minus.svg);
    }
</style>
<script>
    import {widgets, instanceStores, model} from '../../util/registry.js';

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
            let parent = $properties.par;
            let index = parent.items.findIndex(function(node){return node.id === selected});
            let selectNext = index > 0 ? parent.items[index - 1] : parent;

            let toBeDeleted = $properties;

            /* TODO: Neither of these works... need to investigate fix */
            selected = 'puddy-0';
            //selected = selectNext;

            model.remove(toBeDeleted);
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
    <div class="edit-pane">
    <div class="add-options">
        <button on:click="{add}" disabled="{$properties.name !== 'Panel' && $properties.name !== 'Display'}"><i class="button-icon add"></i> Add</button>
        <select bind:this="{addComponentSelect}">
            {#each Object.keys(widgets) as component}
                <option>{component}</option>
            {/each}
        </select>
    </div>
    <div class="trash-pane">
        <button on:click="{remove}" disabled="{$properties.name === 'Display'}"><i class="button-icon remove"></i> Remove</button>
    </div>
    </div>
<div class="order-pane">
    <div>
        <button on:click="{up}" disabled="{!canMoveUp}"><i class="button-icon arrow-up"></i> Up</button>
    </div>
    <div>
        <button on:click="{down}" disabled="{!canMoveDown}"><i class="button-icon arrow-down"></i> Down</button>
    </div>
</div>
<svelte:options tag="puddy-action-pane"/>