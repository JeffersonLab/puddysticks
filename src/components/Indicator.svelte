<style>
    :root {
        --blink-rate: 0.8s;
        --on-rgb: rgb(242, 38, 19);
        --on-rgba: rgba(242, 38, 19, 0.5);
        --off-rgb: rgb(150, 40, 27);
        --off-rgba: rgba(150, 40, 27, 0.25);
    }
    div {
        display: inline-block;
        width: 24px;
        height: 24px;
        background-color: var(--off-rgb);
        background-image: linear-gradient(var(--on-rgba) 10%, var(--off-rgba));
        border-radius: 4px;
        transition: 0.5s;
        box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0,0,0,.12);
        position: relative;
    }

    .on:after {
        content: "";
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        background: radial-gradient(ellipse at 50% 45%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8) 14%, rgba(255, 255, 255, 0) 24%);
        /*transform: skewX(70deg) skewY(0deg);*/
        filter: blur(4px);
        transition: 0.5s;
    }

    .on {
        background-image: none;
        background-color: var(--on-rgb);
        box-shadow: 0 0 1px 2px var(--on-rgba), 0 0 1px 2px var(--off-rgba) inset;
        /*box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2) inset, 0px 1px 1px 0px rgba(0, 0, 0, 0.14) inset, 0px 1px 3px 0px rgba(0,0,0,.12) inset, 0 0 1px 2px var(--on-rgba);*/
        transition: 0.5s;
    }

    .on.flash {
        animation: blink var(--blink-rate) infinite;
    }

    @keyframes blink {
        from { background-color: var(--off-rgb); }
        50% { background-color: var(--on-rgb); box-shadow: 0 0 1px 2px var(--on-rgba), 0 0 1px 2px var(--off-rgba) inset;}
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
<div class="indicator {config.class}" style="{config.style}" class:flash="{flash}" class:on="{onIf ? onIf(data) : {}}"></div>
<svelte:options tag="puddy-indicator"/>