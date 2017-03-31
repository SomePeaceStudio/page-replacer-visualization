$(document).ready(function(){
    // Bind Author button
    $('#authors-button').click(function(){
        toggleAuthorsFrame();
    });
    
    // Draw chart
    faultChart.render();
});

// Define axis data
var chartData = [
                    {label: "FIFO", y:0},
                    {label: "Aging",y:0},
                    {label: "Second chance",y:0},
                    {label: "Clock",y:0},
                    {label: "Clock pro",y:0},
                    {label: "WSclock",y:0},
                    {label: "CAR",y:0},
                    {label: "LRU",y:0},
                    {label: "NFU",y:0},
                    {label: "Random",y:0}
                    ];

// Define chart object
var faultChart = new CanvasJS.Chart("chart-container",{
    title:{
        text: "Page faults"
    },
    axisY: {
        title: "Average page faults"
    },
    data:[
        {
            type:"column",
            toolTipContent: "{label}: {y} page faults",
            dataPoints: chartData
        }

    ]
});
function toggleAuthorsFrame(){
    $('#author-list').toggle();
}

