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
    export let selected;
</script>
<span id="{config.id}" on:click="{(e) => selected = config.id}" class:selected="{selected === config.id}">{config.name}</span>
{#if config.items != null}
    <ul>
        {#each config.items as item (item.id)}
            <li>
                <svelte:self bind:selected config="{item}"/>
            </li>
        {/each}
    </ul>
{/if}
<svelte:options tag="puddy-tree-node"/>