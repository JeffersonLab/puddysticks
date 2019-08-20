<style>
    :root {
        --blink-rate: 0.8s;
        --on-rgb: rgb(242, 38, 19);
        --on-rgba: rgba(242, 38, 19, 0.5);
        --off-rgb: rgb(150, 40, 27);
        --off-rgba: rgba(150, 40, 27, 0.25);
    }
    div {
        margin: 0 auto;
        width: 24px;
        height: 24px;
        background-color: var(--off-rgb);
        border-radius: 4px;
    }

    .on {
        background-color: var(--on-rgb);
        box-shadow: 0 0 2px 4px var(--on-rgba), 0 0 2px 4px var(--off-rgba) inset;
    }

    .on.flash {
        animation: blink var(--blink-rate) infinite;
    }

    @keyframes blink {
        from { background-color: var(--off-rgb); }
        50% { background-color: var(--on-rgb); box-shadow: 0 0 2px 2px var(--on-rgba), 0 0 2px 2px var(--off-rgba) inset;}
        to { background-color: var(--off-rgb); }
    }
</style>
<script>
    let defaultConfig = {datasource: {name: 'Static'}, onIf: function(data){return data.value > 0}, flash: false, style: ''};

    export let config = defaultConfig;
    export let data = {value: 0};

    config = {...defaultConfig, ...config};

    /*$: console.log(data.value);*/
</script>
<div class="indicator" style="{config.style}" class:flash="{config.flash}" class:on="{config.onIf ? config.onIf(data) : {}}"></div>
<svelte:options tag="puddy-indicator"/>