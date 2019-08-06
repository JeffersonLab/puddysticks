<style>
    .container {
        position: relative;
        margin: 100px auto 50px auto;
        height: 165px;
        width: 330px;

        background-color: black;
        font-family: Verdana, Geneva, sans-serif;
        font-size: 12px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
    }

    .output {
        line-height: 35px;
        width: 60px;
        height: 30px;
        background-color: dimgray;
        border-radius: 60px 60px 0 0;
        position: absolute;
        top: 135px;
        left: 135px;
        text-align: center;
        color: white;
    }

    .outline {
        fill: dimgray;
    }

    .meter {
        fill: lightskyblue;
    }

    .needle {
        fill: red;
    }

    .scale {
        stroke: white;
    }

    text {
        text-anchor: middle;
        dominant-baseline: alphabetic;
    }
</style>
<script>
    /*Gauge inspired by https://codepen.io/enxaneta/pen/EVYRJJ*/

    export let config;
    export let data;

    let rad = Math.PI / 180,
            W = 330,
            offset = 40,
            cx = ~~(W / 2),
            cy = 160,
            r1 = cx - offset,
            delta = ~~(r1 / 4),
            x1 = cx + r1,
            y1 = cy,
            r2 = r1 - delta,
            x2 = offset,
            y2 = cy,
            x3 = x1 - delta,
            y3 = cy,
            outline = getOutline(cx, cy, r1, offset, delta),
            min = 0,
            max = 100,
            decimals = 0;

    if(config.datasource) {
        min = config.datasource.min ? config.datasource.min : 0;
        max = config.datasource.max ? config.datasource.max : 100;
        decimals = config.datasource.decimals ? config.datasource.decimals : 0;
    }

    let ticks = getTicks(min, max);

    $: value = isNaN(data) ? 0 : data;
    /*$: value = 9;*/

    $: a = getA(value, min, max);
    $: meter = getMeter(cx, cy, r1, offset, delta, a);
    $: needle = getNeedle(cx, cy, r1, a);

    /*$: console.log(value);*/

    function getTicks(min, max) {
        let sr1 = r1 + 5,
                sr2 = r2 - 5,
                srT = r1 + 20,
                ticks = [];

        let n = 0,
                amount = (Math.abs(max - min) / 10);
        for (let sa = -180; sa <= 0; sa += 18) {
            let sx1 = cx + sr1 * Math.cos(sa * rad),
                    sy1 = cy + sr1 * Math.sin(sa * rad),
                    sx2 = cx + sr2 * Math.cos(sa * rad),
                    sy2 = cy + sr2 * Math.sin(sa * rad),
                    sxT = cx + srT * Math.cos(sa * rad),
                    syT = cy + srT * Math.sin(sa * rad),
                    line = {
                        x1: sx1,
                        y1: sy1,
                        x2: sx2,
                        y2: sy2
                    },
                    label = {
                        x: sxT,
                        y: syT,
                        text: min + (n * amount)
                    };

            ticks.push({line: line, label: label});

            n++;
        }

        return ticks;
    }

    function getNeedle(cx, cy, r1, a) {
        let nx1 = cx + 5 * Math.cos((a - 90) * rad),
                ny1 = cy + 5 * Math.sin((a - 90) * rad),
                nx2 = cx + (r1 + 15) * Math.cos(a * rad),
                ny2 = cy + (r1 + 15) * Math.sin(a * rad),
                nx3 = cx + 5 * Math.cos((a + 90) * rad),
                ny3 = cy + 5 * Math.sin((a + 90) * rad);

        return nx1 + "," + ny1 + " " + nx2 + "," + ny2 + " " + nx3 + "," + ny3;
    }

    function getA(val, min, max) {
        let newVal = (!isNaN(val) && val >= min && val <= max) ? val : min,
                scale = 180 / Math.abs(max - min),
                zeroAdj = Math.abs(0 - min),
                pa = ((newVal + zeroAdj) * scale) - 180,
                p = {};

        p.x = cx + r1 * Math.cos(pa * rad);
        p.y = cy + r1 * Math.sin(pa * rad);

        let x = p.x,
                y = p.y,
                lx = cx - x,
                ly = cy - y;

        return Math.atan2(ly, lx) / rad - 180;
    }

    function getOutline(cx, cy, r1, offset, delta) {
        let x1 = cx + r1,
                y1 = cy,
                x2 = offset,
                y2 = cy,
                r2 = r1 - delta,
                x3 = x1 - delta,
                y3 = cy;

        return "M " + x1 + ", " + y1 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x3 + "," + y3 + " z";
    }

    function getMeter(cx, cy, r1, offset, delta, a) {
        a *= rad;
        let r2 = r1 - delta,
                x4 = cx + r1 * Math.cos(a),
                y4 = cy + r1 * Math.sin(a),
                x5 = cx + r2 * Math.cos(a),
                y5 = cy + r2 * Math.sin(a);

        return "M " + x4 + ", " + y4 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x5 + "," + y5 + " z";
    }
</script>
<div class="container">
    <svg height="165" width="330" view-box="0 0 330 165">
        <g class="scale">
            {#each ticks as tick}
                <line x1="{tick.line.x1}" y1="{tick.line.y1}" x2="{tick.line.x2}" y2="{tick.line.y2}"></line>
                <text x="{tick.label.x}" y="{tick.label.y}">{tick.label.text}</text>
            {/each}
        </g>
        <path class="outline" d="{outline}"/>
        <path class="meter" d="{meter}"/>
        <polygon class="needle" points="{needle}"/>
    </svg>
    <div class="output">{Number(value).toFixed(decimals)}</div>
</div>
<svelte:options tag="puddy-gauge"/>