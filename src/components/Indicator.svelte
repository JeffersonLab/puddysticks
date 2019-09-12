<style>
    :root {
        --blink-rate: 0.8s;
        --on-rgb: rgb(242, 38, 19);
        --on-rgba: rgba(242, 38, 19, 0.5);
        --off-rgb: rgb(150, 40, 27);
        --off-rgba: rgba(150, 40, 27, 0.25);
    }
    div {
        margin: 8px auto;
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

    /*Round Yellow Indicator: "--on-rgb: rgb(255, 255, 0); --on-rgba: rgba(255, 255, 0, 0.75); --off-rgb: rgb(255, 217, 0); --off-rgba: rgba(255, 217, 0, 0.25); border-radius: 16px; width: 16px; height: 16px;"*/
</style>
<script>
    /* Note: Default values are managed externally in file.js */
    export let config;

    /* data is separate from config because they update at different frequencies and also to avoid circular dependency since datasource config is nested inside config */
    export let data = {value: 0};

    let flash = false;
    let onIf = function(data) {
        return false;
    };

    $: {
        /* If we used Svelte checkbox then conversion is automatic... */
        flash = (config.flash === true || config.flash === 'true') ? true : false;

        if (typeof config.onIf === 'function') {
            onIf = config.onIf;
        } else if (typeof config.onIf === 'string') {
            try {
                onIf = Function('"use strict";return (' + config.onIf + ')')();
            } catch(e) {
                /*console.log(e);*/
            }
        } else {
            onIf = function(data) {return false;};
        }
    }

    /*$: console.log(data.value);*/
    /*$: console.log(onIf);*/
</script>
<div class="indicator" style="{config.style}" class:flash="{flash}" class:on="{onIf ? onIf(data) : {}}"></div>
<svelte:options tag="puddy-indicator"/>