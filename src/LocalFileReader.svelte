<script>
    import FileParser from './FileParser.svelte';

    function chooseLocalFile() {

        let input = document.createElement("input"),
                json;

        input.type = "file";
        input.accept = ".wedm";
        input.onchange = function () {
            json = readLocalFile(input);
        };

        input.click();

        let obj = FileParser.fromJSON(json);
    };

    function readLocalFile(input) {
        let file = input.files[0],
                reader = new FileReader();

        console.log('read file');

        let textFile = /json.*/;

        if (file.type.match(textFile)) {
            reader.onload = function (event) {
                preview.innerHTML = event.target.result;
            }
        } else {
            preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
        }
        return reader.readAsText(file);
    };
</script>

<button type="button" on:click="{chooseLocalFile}">Open</button>

<svelte:options tag="ps-local-file-reader"/>