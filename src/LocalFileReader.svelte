<script>
    import { createEventDispatcher } from 'svelte';
    import { openFile } from './manager/file.js';

    const dispatch = createEventDispatcher();

    function chooseLocalFile() {

        let input = document.createElement("input");

        input.type = "file";
        input.accept = ".wedm";
        input.onchange = function () {
            let promise = readLocalFile(input);

            promise.then(function(result){
                dispatch('localfile', openFile(result));
            });
        };

        input.click();
    };

    function readLocalFile(input) {
        let file = input.files[0],
                reader = new FileReader();

        let promise = new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException('Could not read local file'));
            };
            reader.onload = () => {
                resolve(reader.result);
            };
        });

        reader.readAsText(file);

        return promise;
    };
</script>

<button type="button" on:click="{chooseLocalFile}">Open</button>

<svelte:options tag="puddy-local-file-reader"/>