<style>
	:global(#component-tree .selected) {
		border-top: 1px solid red;
		border-bottom: 1px solid red;
		color: red;
	}
	:global(#component-tree span) {
		border: 1px solid transparent;
	}
</style>
<script>
	import {initComponents} from './components.js';
	import {initMediators} from './mediators.js';

	initComponents();
	initMediators();

	import {openRemoteFile} from './Display.svelte';
	import Display from './Display.svelte';
	import Tree from './Tree.svelte';
	import Drawer from './Drawer.svelte';
	import Selectable from "./Selectable.svelte";

	let params = new URLSearchParams(location.search),
			file = params.get("file");

	if (!file) {
		file = "example.wedm";
	}

	let promise = openRemoteFile(file);
	let selected;

	function save(obj) {

		/*Filter out id*/
		let replacer = function(key, value) {
			if(key === 'id') {
				return undefined;
			} else {
				return value;
			}
		};

		let json = JSON.stringify(obj, replacer, 2);

		let link = document.createElement("a");

		link.href = "data:application/json," + encodeURIComponent(json);
		link.download = "display.wedm";

		link.click();
	}
</script>
{#await promise}
	<p>...waiting</p>
{:then config}
	<Drawer config="{config.obj}">
		<div>
			<button>Open</button>
			<button on:click="{()=>save(config.obj)}">Save</button>
		</div>
		<div id="component-tree">
			<Selectable filter='span' bind:selected="{selected}">
				<Tree config="{config.obj}"/>
			</Selectable>
		</div>
		<button>Add</button>
		<button>Remove</button>
		<div>
			{#if selected}
				<ul>
					{#each Object.keys(config.lookup[selected.id]) as key}
						{#if key == 'datasource'}
							<li>datasource: {config.lookup[selected.id][key].name}</li>
						{:else if key != 'id' && key != 'items'}
							<li>{key}: {config.lookup[selected.id][key]}</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>
	</Drawer>
	<Display config="{config.obj}"/>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-app"/>