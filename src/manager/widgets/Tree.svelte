<script>
    import TreeNode from './TreeNode.svelte';
    export let config = {};
    export let selected = null;
    export let iconizer;
</script>
<div class="tree">
    <TreeNode {config} {iconizer} bind:selected/>
</div>
<svelte:options tag="puddy-tree"/>