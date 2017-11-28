$("#svgContainer").load("/liveDrawing.svg");

$(document).ready(function () {

    setInterval(function () {
        draw("ac", 216, 317)
        draw("room", 355, 524)
        draw("yard", 423, 286)
    }, 3500)

    function draw(feed, x, y) {
        $.getJSON('https://io.adafruit.com/api/v2/2012zhangzihao/feeds/temperature.' + feed + '/data/last', function (result) {
            var data = {};

            if (isNaN(result.value)) {
                return false;
            } else {
                data.time = parseTime(result.created_at);
                data.value = result.value;
            }
            console.log(data.value);
            d3.selectAll("#" + feed + "Group").remove();
            var g = d3.select("#" + feed).append("g")
                .attr("id", feed + "Group");
            g.append("circle")
                .attr("id", feed + "Circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 0)
                .attr("opacity", "0.9")
                .transition()
                .ease(d3.easeCircle)
                .duration(3500)
                .attr("opacity", "0")
                .attr("r", map_range(data.value, 30, 100, 20, 200));
            g.append("text")
                .attr("class", feed + "Circle")
                .attr("x", x)
                .attr("y", y)
                .attr("font-size", 2)
                .attr("text-anchor", "middle")
                .text(data.value + " F°")
                .attr("opacity", "0")
                .transition()
//                .ease(d3.easeSin)
                .duration(1500)
                .attr("opacity", "1")
                .attr("font-size", data.value / 2)
                .attr("y", y - 20)
                .transition()
                .ease(d3.easeSin)
                .duration(2000)
                .attr("opacity", "0")
                .attr("font-size", data.value / 2)
                .attr("y", y - 50);


            //                .attr("transform", "scale(2)");

        });
    }

});


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
//console.log(ac);
