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
</style>
<script>
    export let config;
    export let expanded = false;
    export let name;
    export let items;

    function toggle() {
        expanded = !expanded;
    }

    let type = 'md';
</script>
<span class:expanded on:click={toggle}>{name}</span>
{#if expanded && items != null}
    <ul>
        {#each items as item}
            <li>
                {#if item.type === 'Container'}
                    <svelte:self config="{item}" name="{item.name}" items="{item.items}" expanded/>
                {:else}
                    <span style="background-image: url(icons/leaf.svg)">{item.name}</span>
                {/if}
            </li>
        {/each}
    </ul>
{/if}
<svelte:options tag="puddy-tree"/>