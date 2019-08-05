<script>
    export let selected_class='selected';
    export let selected = null;
    export let filter = '*';

    let div;

    $: descendents = div ? Array.from(div.querySelectorAll(filter)) : [];
    $: descendents.forEach(d => d.classList.toggle(selected_class, d === selected));
</script>
<span bind:this={div} on:click={e => selected = descendents.find(d => d === e.target)}>
    <slot></slot>
</span>