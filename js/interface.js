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
                    {label: "MRU",y:0},
                    {label: "NFU",y:0},
                    {label: "Random",y:0},
                    {label: "Optimal",y:0},
                    {label: "GClock",y:0},
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
    $('.authors-wrap').toggleClass('opened');
}

function setProgressBar(percent){
    $('#bar').css('width',percent+'%');
}

// Error notification for invalid page data format
function spawnPageValidationError(){
    $('#invalid-page-data-error').show();
//    hideTimer = setTimeout(function(){
//        $('#invalid-page-data-error').hide();
//    },5000);
}

function despawnPageValidationError(){
    $('#invalid-page-data-error').hide();
}
