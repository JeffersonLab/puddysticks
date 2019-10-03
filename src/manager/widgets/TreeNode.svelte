<style>
    span {
        padding: 0 0 0 1.75em;
        background-repeat: no-repeat;
        background-size: 24px 24px;
        font-weight: bold;
        cursor: pointer;
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
    export let iconizer;

    let style = '';
    let icon = iconizer ? iconizer(config) : undefined;

    if(icon) {
        style = 'background-image: url(icons/' + icon + ');';
    }

</script>
<span id="{config.id}" on:click="{(e) => selected = config.id}" class:selected="{selected === config.id}" style="{style}">{config.name}</span>
{#if config.items != null}
    <ul>
        {#each config.items as item (item.id)}
            <li>
                <svelte:self bind:selected config="{item}" {iconizer}/>
            </li>
        {/each}
    </ul>
{/if}
<svelte:options tag="puddy-tree-node"/>