////weather API
//"api.apixu.com/v1/history.json?key=e471246cdceb49f2add35227171911&q=22903&dt=2017-11-17"





var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");
var formatTime = d3.timeFormat("%H:%M:%S");
var formatDate = d3.timeFormat("%B %e");

var svg = d3.select("#line-chart"),
    margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 24
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "svgGroup"),
    gY = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "yGroup"),
    gX = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "xGroup");

var x = d3.scaleTime()
    .rangeRound([0, width]),

    y = d3.scaleLinear()
    .rangeRound([height, 0]),

    line = d3.line()
    .x(function (d) {
        return x(d.time);
    })
    .y(function (d) {
        return y(d.value);
    })
    .curve(d3.curveBasis),

    area = d3.area()
    .x(function (d) {
        return x(d.time);
    })
    .y0(height)
    .y1(function (d) {
        return y(d.value)
    })
    .curve(d3.curveBasis);

y.domain([30, 150]);

gY.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "translate(80)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Temperature (F°)");



function clear() {
    d3.selectAll("#svgGroup > *").remove();
    d3.selectAll("#xGroup > *").remove();
}

function draw(feed) {
    var data = [];
    var hours = $("#select").val();
    var startTime = $("input[name*='startTime']").val();
    var endTime = $("input[name*='endTime']").val();

    if (!startTime) {
        console.log("no time value")
    } else {
        startTime = new Date(startTime).toISOString();
        endTime = new Date(endTime).toISOString();
        console.log(startTime, endTime);
    }

    $.ajax({
        url: "https://io.adafruit.com/api/v2/2012zhangzihao/feeds/temperature." + feed + "/data/chart?start_time=" + startTime + "&end_time=" + endTime + "&hours=" + hours,
        async: false,
        success: function (result) {
            console.log(result);
            for (i = 0; i < result.data.length - 1; i++) {
                var datum = {};
                datum.time = parseTime(result.data[i][0]);
                datum.value = parseInt(result.data[i][1]);
                data.push(datum);
            }
            console.log(data);
            x.domain([data[0].time, data[data.length - 1].time]);

            g.append("path")
                .datum(data)
                .attr("id", feed + "area")
                .attr("d", area);

            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#006699")
                .attr("id", feed)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1)
                .attr("d", line);
            d3.selectAll("#xGroup > *").remove();
            gX.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .select(".domain")
                .remove();
        }
    });
}

function drawLive() {
    data = [];
    d3.selectAll("#svgGroup > *").remove();
    d3.selectAll("#xGroup > *").remove();

    $.getJSON('https://io.adafruit.com/api/v2/2012zhangzihao/feeds/home.temperature/data/last', function (result) {
        if (isNaN(result.value)) {
            return false;
        } else {
            var datum = {};
            datum.time = parseTime(result.created_at);
            datum.value = +result.value;;
            data.push(datum);
        }
        console.log(data);

        g.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        g.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .on("start", tick);
    });

    function tick() {
        $.getJSON('https://io.adafruit.com/api/v2/2012zhangzihao/feeds/home.temperature/data/last', function (result) {
            if (isNaN(result.value)) {
                return false;
            } else {
                var datum = {};
                datum.time = parseTime(result.created_at);
                datum.value = +result.value;
                data.push(datum);
            }
        })

        x.domain([data[0].time, data[data.length - 1].time]);
        d3.selectAll("#xGroup > *").remove();
        gX.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Redraw the line.
        d3.select(this)
            .attr("d", line)
            .attr("transform", null);
        // Slide it to the left.
        d3.active(this)
            //      .attr("transform", "translate(-2)")
            .transition()
            .on("start", tick);
        //  Pop the old data point off the front.
        //data.shift();
        console.log(data);
    }
}

//function drawWeather() {
//    var now = new Date();
//
//    $.getJSON("https://api.apixu.com/v1/history.json?key=e471246cdceb49f2add35227171911&q=22903&dt=2017-11-17", function (result) {
//        console.log(result);
//    })
//}

draw("ac");
draw("room");
draw("yard");

//drawWeather();

$("#select").change(function () {
    $("input[name*='startTime']").val("");
    $("input[name*='endTime']").val("");
    clear();
    draw("ac");
    draw("room");
    draw("yard");
});

$("input[name*='go']").click(function () {
    clear();
    draw("ac");
    draw("room");
    draw("yard");
})
