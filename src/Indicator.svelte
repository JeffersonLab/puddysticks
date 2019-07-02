<style>
    :root {
        --blink-rate: 0.8s;
        --on-rgb: 242, 38, 19;
        --on-rgba: rgba(var(--on-rgb), 0.5);
        --off-rgb: 150, 40, 27;
        --off-rgba: rgba(var(--off-rgb), 0.5);
    }
    div {
        margin: 0 auto;
        width: 24px;
        height: 24px;
        background-color: rgb(var(--off-rgb));
        border-radius: 4px;
        animation: blink var(--blink-rate) infinite;
    }

    @keyframes blink {
        from { background-color: rgb(var(--off-rgb)); }
        50% { background-color: rgb(var(--on-rgb)); box-shadow: 0 0 2px 2px var(--on-rgba), 0 0 2px 2px var(--off-rgba) inset;}
        to { background-color: rgb(var(--off-rgb)); }
    }
</style>
<script>
    export let config;
</script>
<div></div>
<svelte:options tag="puddy-indicator"/>