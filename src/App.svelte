<script>
	import {init} from './components.js';

    init();

	import {openRemoteFile} from './Display.svelte';
	import Display from './Display.svelte';
	import Tree from './Tree.svelte';
	import Drawer from './Drawer.svelte';

	let params = new URLSearchParams(location.search),
			file = params.get("file");

	if(!file) {
		file = "example.wedm";
	}

	let getLabel = function(config) {
		console.log(config);
		return config.component;
	};

	let promise = openRemoteFile(file);
</script>
{#await promise}
	<p>...waiting</p>
{:then config}
	<Drawer>
		<Tree {config} name="{config.name}" items="{config.items}" expanded/>
	</Drawer>
	<Display {config}/>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-app"/>