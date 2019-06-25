<style>
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        background-color: lightskyblue;
        border: 1px solid black;
        text-align: center;
    }
    a {
        color: black;
    }
    li {
        background-color: gray;
        padding: 0.5em;
        margin: 0.5em;
        border-radius: 0.5em;
    }
    .active {
        background-color: red;
    }
    .active a {
        color: white;
    }
</style>
<script>
    export let config;

    let active = config.tabs[0].label;
</script>
{#if config.tabs}
    <ul>
        {#each config.tabs as tab}
            <li class:active="{active === tab.label}" on:click="{() => active = tab.label}"><a href="#">{tab.label}</a></li>
        {/each}
    </ul>
{/if}
<svelte:options tag="puddy-tabs"/>