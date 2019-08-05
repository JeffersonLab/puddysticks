<style>
    span {
        padding: 0 0 0 1.5em;
        background: url(icons/container-closed.svg) 0 0.1em no-repeat;
        background-size: 1em 1em;
        font-weight: bold;
        cursor: pointer;
    }

    .expanded {
        background-image: url(icons/container-open.svg);
    }

    ul {
        padding: 0.2em 0 0 0.5em;
        margin: 0 0 0 0.5em;
        list-style: none;
        border-left: 1px solid #eee;
    }

    li {
        padding: 0.2em 0;
    }
    .active {
        color: red;
    }
</style>
<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function selectItem() {
        dispatch('selected', {name: name});
    }

    let type = 'Contanier';

    export let config;
    export let expanded = false;
    export let name;
    export let items;
    export let active;
    export let collapsible = false;

    function toggle() {
        if (collapsible) {
            expanded = !expanded;
        } else {
            expanded = true;
        }
    }

</script>
<span class:expanded on:click="{selectItem}" on:click={toggle} class:active="{active}">{name}</span>
{#if expanded && items != null}
    <ul>
        {#each items as item}
            <li>
                <svelte:self config="{item}" name="{item.name}" items="{item.items}" active="{item.active}" expanded on:selected/>
            </li>
        {/each}
    </ul>
{/if}
<svelte:options tag="puddy-tree-node"/>