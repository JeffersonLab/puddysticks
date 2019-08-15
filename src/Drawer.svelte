<style>
    .aside {
        position: fixed;
        width: 250px;
        background-color: lightgray;
        height: 100%;
        z-index: 1;
        padding: 0;
        overflow-x: hidden;
        transition: 0.5s;
    }
    .toggle {
        position: fixed;
        left: 255px;
        bottom: 5px;
        transition: 0.5s;
        border: none;
        background: url(icons/arrow-circle-right.svg) 0 0 no-repeat;
        cursor: pointer;
        width: 28px;
        height: 28px;
        outline: none;
    }
    .open {
        background: url(icons/arrow-circle-left.svg) 0 0 no-repeat;
    }
    .main {
        transition: margin-left .5s;
    }
</style>
<script>
    export let config;

    let drawerOpen = true;
    let toggleButton;
    let aside;
    let main;

    function toggle() {
        if(drawerOpen) { /* Do Close */
            aside.style.width = "0";
            main.style.marginLeft = "0";
            toggleButton.style.left = "5px";
        } else { /* Do Open */
            aside.style.width = "250px";
            main.style.marginLeft = "250px";
            toggleButton.style.left = "255px";
        }

        drawerOpen = !drawerOpen;
    }
</script>
<div>
    <button bind:this="{toggleButton}" class="toggle" class:open="{drawerOpen}" on:click="{toggle}"></button>
    <div bind:this="{aside}" class="aside">
        <slot name="aside"></slot>
    </div>
    <div bind:this="{main}" class="main">
        <slot name="main"></slot>
    </div>
</div>
<svelte:options tag="puddy-drawer"/>