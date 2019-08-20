<script>
    export let selected_class='selected';
    export let selected = null;
    export let filter = '*';

    let span;

    export function refresh() {
       descendents = Array.from(span.querySelectorAll(filter));
    }

    export function select(f) {
        selected = span.querySelector(f);
    };

    $: descendents = span ? Array.from(span.querySelectorAll(filter)) : [];
    $: descendents.forEach(d => d.classList.toggle(selected_class, d === selected));
</script>
<span bind:this={span} on:click={e => selected = descendents.find(d => d === e.target)}>
    <slot></slot>
</span>
<svelte:options tag="puddy-selectable"/>