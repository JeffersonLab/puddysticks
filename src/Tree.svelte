<style>
</style>
<script>
    import TreeNode from './TreeNode.svelte';
    export let config = {};
    export let selected = null;
</script>
<div class="tree">
    <TreeNode {config} bind:selected/>
</div>
<svelte:options tag="puddy-tree"/>