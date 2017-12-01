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
        return y(d.temperature);
    })
    .curve(d3.curveBasis);

//    area = d3.area()
//    .x(function (d) {
//        return x(d.time);
//    })
//    .y0(height)
//    .y1(function (d) {
//        return y(d.value)
//    })
//    .curve(d3.curveBasis);

//y.domain([30, 150]);





function clear() {
    d3.selectAll("#svgGroup > *").remove();
    d3.selectAll("#xGroup > *").remove();
    d3.selectAll("#yGroup > *").remove();
}

function draw() {
    var ac = [];
    var room = [];
    var yard = [];

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
        url: "https://io.adafruit.com/api/v2/2012zhangzihao/feeds/temperature.ac/data/chart?start_time=" + startTime + "&end_time=" + endTime + "&hours=" + hours,
        async: false,
        success: function (result) {
            console.log(result);
            for (i = 0; i < result.data.length; i++) {
                var datum = {};
                datum.time = parseTime(result.data[i][0]);
                datum.value = parseInt(result.data[i][1]);
                ac.push(datum);
            }
        }
    });

    $.ajax({
        url: "https://io.adafruit.com/api/v2/2012zhangzihao/feeds/temperature.room/data/chart?start_time=" + startTime + "&end_time=" + endTime + "&hours=" + hours,
        async: false,
        success: function (result) {
            //            console.log(result);
            for (i = 0; i < result.data.length; i++) {
                var datum = {};
                datum.time = parseTime(result.data[i][0]);
                datum.value = parseInt(result.data[i][1]);
                room.push(datum);
            }
        }
    });

    $.ajax({
        url: "https://io.adafruit.com/api/v2/2012zhangzihao/feeds/temperature.yard/data/chart?start_time=" + startTime + "&end_time=" + endTime + "&hours=" + hours,
        async: false,
        success: function (result) {
            //            console.log(result);
            for (i = 0; i < result.data.length; i++) {
                var datum = {};
                datum.time = parseTime(result.data[i][0]);
                datum.value = parseInt(result.data[i][1]);
                yard.push(datum);
            }
        }
    });

    var data = [];
    for (i = 0; i < ac.length; i++) {
        var datum = {};
        datum.ac = ac[i].value;
        datum.yard = yard[i].value;
        datum.room = room[i].value;
        datum.time = ac[i].time;
        data.push(datum);
    }
    console.log(data);

    var color = d3.scaleOrdinal(["#f89838", "#006699", "#99ca3c"]);

    color.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "time";
    }));

    var temps = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    time: d.time,
                    temperature: +d[name]
                };
            })
        };
    });
    console.log(temps)
    //    console.log(temps[0], color(temps[0].name));
    //    console.log(temps[1], color(temps[1].name));
    //    console.log(temps[2], color(temps[2].name));

    x.domain(d3.extent(data, function (d) {
        return d.time;
    }));

    //    y.domain([
    //            d3.min(temps, function (c) {
    //            return d3.min(c.values, function (v) {
    //                return v.temperature;
    //            });
    //        }),
    //            d3.max(temps, function (c) {
    //            return d3.max(c.values, function (v) {
    //                return v.temperature;
    //            });
    //        })
    //        ]);
    y.domain([35, 120]);

    var temp = g.selectAll(".city")
        .data(temps)
        .enter().append("g")
        .attr("class", "city")


    gX.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    gY.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(80)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Temperature (F°)");

    temp.append("path")
        .attr("class", "line")
        .attr("id", function (d) {
            return d.name;
        })
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });


    var mouseG = g.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(temps)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 3)
        .style("stroke", function (d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function () {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                    // console.log(width / mouse[0])
                    var xDate = x.invert(mouse[0]),
                        bisect = d3.bisector(function (d) {
                            return d.time;
                        }).right;
                    idx = bisect(d.values, xDate);

                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    d3.select(this).select('text')
                        .text(y.invert(pos.y).toFixed(2));

                    return "translate(" + mouse[0] + "," + pos.y + ")";
                });


        });
}


draw();
//drawWeather();

$("#select").change(function () {
    $("input[name*='startTime']").val("");
    $("input[name*='endTime']").val("");
    clear();
    draw();
});

$("input[name*='go']").click(function () {
    clear();
    draw();
});
