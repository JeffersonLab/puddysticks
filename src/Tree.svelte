<style>
</style>
<script>
    import TreeNode from './TreeNode.svelte';

    export let config;
    export let expanded = false;
    export let name;
    export let items;
    export let collapsible = false;
    let active = null;

    function setSelected(active, node) {
        if(node.name === active) {
            node.active = true;
        } else {
            node.active = false;
        }

        if(node.items) {
            for(let i = 0; i < node.items.length; i++) {
                setSelected(active, node.items[i]);
            }
        }
    }

    function doSelect(event) {
        active = event.detail.name;
        setSelected(active, config);
        config = config;
    }

</script>
<TreeNode {config} name="{config.name}" items="{config.items}" active="{config.active}" expanded on:selected="{doSelect}"/>
<svelte:options tag="puddy-tree"/>