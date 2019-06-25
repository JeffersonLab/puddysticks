<script>
	import {init} from './components.js';

    init();

	import {openRemoteFile} from './Display.svelte';
	import Display from './Display.svelte';

	let params = new URLSearchParams(location.search),
			file = params.get("file");

	if(!file) {
		file = "example.wedm";
	}

	let promise = openRemoteFile(file);
</script>
{#await promise}
	<p>...waiting</p>
{:then config}
	<Display {config}/>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
<svelte:options tag="puddy-app"/>