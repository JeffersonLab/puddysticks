<style>
    /*Inspired by https://medium.com/compass-true-north/css-grid-maintaining-aspect-ratio-and-managing-overflow-ed54c510782a*/
    *, *:before, *:after {
        box-sizing: border-box;
    }
    :root {
        /* variables */
        --spacing: 24px;
        --min-card-width: 200px;
        --ratio-percent: 40px;
        --addl-height: 100px;
    }
    body {
        margin: 0;
    }
    section {
        /* hide all the overflowing cards */
        overflow: hidden;
    }
    article {
        grid-row: 1 / -1;
        grid-column: 1 / -1;
        position: relative;
    }
    ul {
        /* clear ul styles */
        list-style: none;
        margin: 0;
        padding: 0;

        /* additional gap */
        grid-row-gap: var(--spacing);
    }
    li {
        /* set up aspect ratio hack */
        position: relative;
    }
    .absolute-fill {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--min-card-width), 1fr));
        grid-column-gap: var(--spacing);
    }
    .aspect-ratio {
        padding-top: var(--ratio-percent);
    }
</style>
<script>
    export let config;

    let active = config.tabs[0].label;
</script>
<section class="grid">
    <aside class="aspect-ratio"></aside>
    <article>
{#if config.tabs}
    <ul class="grid absolute-fill">
        {#each config.tabs as tab}
            <li class="aspect-ratio" class:active="{active === tab.label}" on:click="{() => active = tab.label}"><div class="absolute-fill">{tab.label}</div></li>
        {/each}
    </ul>
{/if}
    </article>
</section>
<svelte:options tag="puddy-tabs"/>