<style>
    .gauge {
        display: inline-block;
        position: relative;

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
        left: 120px; /* Dependent on gauge width */
        text-align: center;
        color: white;
    }

    .outline {
        fill: dimgray;
    }

    .critical {
        fill: none;
        stroke: rgb(150, 40, 27);
        stroke-width: 10;
    }

    .meter {
        fill: lightskyblue;
    }

    .needle {
        fill: red;
    }

    .scale {
        stroke: black;
    }

    text {
        text-anchor: middle;
        dominant-baseline: alphabetic;
    }
</style>
<script>
    /*Gauge inspired by https://codepen.io/enxaneta/pen/EVYRJJ*/

    /* Note: Default values are managed externally in file.js */
    export let config;

    /* data is separate from config because they update at different frequencies and also to avoid circular dependency since datasource config is nested inside config */
    export let data = {value: 0};

    let rad = Math.PI / 180,
            W = 300, /* widget bounding box width */
            H = 165, /* widget bounding box height */
            A = 180, /* Angle of gauge*/
            R = 180, /* Reference point / origin of angle w.r.t. standard cartesian reference */
            offset = 40, /* space between bounding box and arc */
            cx = ~~(W / 2), /* ~~ is roughly same as Math.floor() - used to obtain int from float for example - cx is center point horizontally */
            cy = 160, /* center point vertically */
            r1 = cx - offset, /* radius */
            delta = ~~(r1 / 4),
            x1 = cx + r1, /* end of arc (outside edge) */
            y1 = cy, /* end of arc (outside edge) */
            r2 = r1 - delta, /* radius */
            x2 = offset, /* start of arc */
            y2 = cy, /* start of arc */
            x3 = x1 - delta, /* end of arc (inside edge) */
            y3 = cy, /* end of arc (inside edge) */
            outline = getOutline(); /* SVG Path commands to draw outline */

    /*$: value = data.value;*/
    $: labeldecimals = config.dataprovider.labeldecimals;
    $: tickdecimals = config.dataprovider.tickdecimals;

    let ticks, a, meter, needle, min, max, value, critical, criticalMin, criticalMax, criticalMinAngle, criticalMaxAngle;

    /*$: console.log('data.value', data.value);*/

    $: {
        /*console.log('dataprovider', config.dataprovider.name);*/

        min = config.dataprovider.min;
        max = config.dataprovider.max;

        if(isNaN(min) || min === '') {
            min = 0;
        }

        if(isNaN(max) || max === '') {
            max = 100;
        }

        /* Convert from String to number (could use parseFloat instead) */
        min = min * 1.0;
        max = max * 1.0;

        if(min > max) {
            min = 0;
            max = 100;
        }

        value = validateValue(data.value, min, max);

        /*criticalMin = 50;
        criticalMax = 75;

        criticalMinAngle = getAngle(criticalMin, min, max);
        criticalMaxAngle = getAngle(criticalMax, min, max);

        console.log(criticalMinAngle);
        console.log(criticalMaxAngle);*/

        ticks = getTicks(min, max);
        a = getAngle(value, min, max);
        /*console.log('value', value);
        console.log('min', min);
        console.log('max', max);
        console.log('a', a);*/
        meter = getMeter(a);
        needle = getNeedle(a);
        //critical = getCritical(criticalMinAngle, criticalMaxAngle);
    }

    /*$: console.log(value);*/

    function validateValue(value, min, max) {
        let result = value;

        if(isNaN(value) || value === '') {
            result = min;
        }

        /* Convert from string to number */
        result = result * 1.0;

        if(value < min || value > max) {
            result = min;
        }

        return result;
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    /* angles are in reference to SVG cartesian coordinates which have 0,0 at upper left (not lower left like standard math).  Also grows down, not up */
    function describeArc(x, y, radius, startAngle, endAngle){
        let start = polarToCartesian(x, y, radius, endAngle),
            end = polarToCartesian(x, y, radius, startAngle),
            largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1",
            sweepFlag = endAngle > startAngle ? 0 : 1,
            d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
            ].join(" ");

        return d;
    }

    function getTicks(min, max) {
        let sr1 = r1 + 5,
                sr2 = r2 - 5,
                srT = r1 + 20,
                ticks = [];

        let n = 0,
                amount = (Math.abs(max - min) / 10);
        for (let sa = -A; sa <= 0; sa += 18) {
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
                    t = min + (n * amount),
                    label = {
                        x: sxT,
                        y: syT,
                        text: tickdecimals ? t.toFixed(tickdecimals) : t
                    };

            ticks.push({line: line, label: label});

            n++;
        }

        return ticks;
    }

    function getNeedle(a) {
        let nx1 = cx + 5 * Math.cos((a - 90) * rad),
                ny1 = cy + 5 * Math.sin((a - 90) * rad),
                nx2 = cx + (r1 + 15) * Math.cos(a * rad),
                ny2 = cy + (r1 + 15) * Math.sin(a * rad),
                nx3 = cx + 5 * Math.cos((a + 90) * rad),
                ny3 = cy + 5 * Math.sin((a + 90) * rad);

        return nx1 + "," + ny1 + " " + nx2 + "," + ny2 + " " + nx3 + "," + ny3;
    }

    function normalizeAngle(a) {
        if(a > 360) {
            a = a % 360;
        } else if(a < -360) {
            a = a % -360;
        }

        if(a < 0) {
            a = 360 + a;
        }

        return a;
    }

    /* this function returns a relative angle to outline arc, which is NOT what SVG uses. */
    function getAngle(val, min, max) {
        let /*newVal = (!isNaN(val) && val >= min && val <= max) ? val : min,*/
                scale = A / Math.abs(max - min),
                zeroAdj = Math.abs(0 - min),
                pa = ((val + zeroAdj) * scale) - A,
                p = {};

        p.x = cx + r1 * Math.cos(pa * rad);
        p.y = cy + r1 * Math.sin(pa * rad);

        let x = p.x,
                y = p.y,
                lx = cx - x,
                ly = cy - y;

        return Math.atan2(ly, lx) / rad - A;
    }

    function getOutline() {
        return "M " + x1 + ", " + y1 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x3 + "," + y3 + " z";
    }

    function getCritical(minA, maxA) {
        /* Expects SVG coordinates with 0,0 at top left  */
        return describeArc(cx, cy, r1 - 5, 0, 45);
    }

    function getMeter(a) {
        a *= rad;
        let     x4 = cx + r1 * Math.cos(a),
                y4 = cy + r1 * Math.sin(a),
                x5 = cx + r2 * Math.cos(a),
                y5 = cy + r2 * Math.sin(a);

        // Move to x4,y4 then create arc with radius r1 with 0 deg rotation small arc flag and anticlockwise sweep flag ending at x2, y2
        // then draw horizontal line to create bar thickness then arc again with inner radius with 0 deg rotation, small arc flag and clockwise sweep flag ending at x5,y5
        return "M " + x4 + ", " + y4 + " A" + r1 + "," + r1 + " 0 0 0 " + x2 + "," + y2 + " H" + (offset + delta) + " A" + r2 + "," + r2 + " 0 0 1 " + x5 + "," + y5 + " z";
    }
</script>
<div class="gauge {config.class}" style="{config.style}">
    <svg height="{H}" width="{W}" viewBox="0 0 {W} {H}">
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
    <div class="output">{Number(value).toFixed(labeldecimals)}</div>
</div>
<svelte:options tag="puddy-gauge"/>