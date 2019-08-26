<script>
    import Container from './Container.svelte';
    export let config = {};

    /*$: console.log(config);*/

</script>
<Container items="{config.items}"/>
<svelte:options tag="puddy-display"/>