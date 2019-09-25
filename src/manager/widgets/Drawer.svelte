<style>
    .aside {
        position: fixed;
        width: 0;
        background-color: lightgray;
        height: 100%;
        z-index: 1;
        padding: 0;
        overflow-x: hidden;
        transition: 0.5s;
    }
    .main {
        margin-left: 0;
        transition: margin-left 0.5s;
        overflow: hidden;
    }
    .button {
        position: fixed;
        left: 5px;
        bottom: 5px;
        transition: 0.5s;
        border: none;
        background: url(icons/arrow-circle-right.svg) 0 0 no-repeat;
        cursor: pointer;
        width: 28px;
        height: 28px;
        outline: none;
        z-index: 1;
    }
    .open .aside {
        width: 250px;
    }
    .open .main {
        margin-left: 250px;
    }
    .open .button {
        background: url(icons/arrow-circle-left.svg) 0 0 no-repeat;
        left: 255px;
    }
</style>
<script>
    export let config = {};

    let open = true;
    let button;
    let aside;
    let main;

    function toggle() {
        open = !open;
    }
</script>
<div class="drawer" class:open="{open}">
    <button bind:this="{button}" class="button extra" on:click="{toggle}"></button>
    <div bind:this="{aside}" class="aside">
        <slot name="aside"></slot>
    </div>
    <div bind:this="{main}" class="main">
        <slot name="main"></slot>
    </div>
</div>
<svelte:options tag="puddy-drawer"/>