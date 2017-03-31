$(document).ready(function(){
    // Execute FIFO button
    $("#run-fifo").click(function(){
        runFifo();
    });
    
    // Execute Random data button
    $("#rnd-gen").click(function(){
        var length = $('#rnd-page-length').val();
        var bufferMin = $('#rnd-buffer-min').val();
        var bufferMax = $('#rnd-buffer-max').val();
        genRandomData(length);
        genRandomBufferSize(bufferMin,bufferMax);
    });
    
    //Run all n times
    $("#run-all").click(function(){
        var times = parseInt($('#execute-times').val());
        console.debug(times);
        for (var i=0; i< times; i++){
            console.debug('going');
            var length = $('#rnd-page-length').val();
            var bufferMin = $('#rnd-buffer-min').val();
            var bufferMax = $('#rnd-buffer-max').val();
            genRandomData(length);
            genRandomBufferSize(bufferMin,bufferMax);
            
            runFifo();
            // TODO: add other algo functions
        }
        
    })
});

var faultData = {
    'fifo':[],
    'aging':[],
    'secondChance':[],
    'clock':[],
    'clockPro':[],
    'wsclock':[],
    'car':[],
    'lru':[],
    'nfu':[],
    'random':[]
};

// Return random integer in range [min,max]
function getRandomInteger(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

// Place random page input data in textarea
function genRandomData(length,min,max){
    if (length === undefined){
        length = 16;
    }
    if (min === undefined){
        min = 1;
    }
    if (max === undefined){
        max = 20;
    }
    var pageData = '';
    for (i=1; i <= length; i++){
        pageData += getRandomInteger(min,max);
        if (i != length){
            pageData += ',';
        }
    }
    $('#page-data-input').val(pageData);
}

function genRandomBufferSize(min,max){
    if (min === undefined){
        var min = 3;
    }
    if (max === undefined){
        var max = 6;
    }
    var num = getRandomInteger(parseInt(min),parseInt(max));
    $('#buffer-size-input').val(num);
}

// Get average page faults
function getAveragePageFault(algo){
    if (faultData[algo].length == 0){
        return 0;
    }
    var sum = 0;
    for (i in faultData[algo]){
        sum += parseInt(faultData[algo][i]);
    }
    return sum/faultData[algo].length;
}

// Update page faults chart
function updateChart(){
    chartData[0].y = getAveragePageFault('fifo');
    chartData[1].y = getAveragePageFault('aging');
    chartData[2].y = getAveragePageFault('secondChance');
    chartData[3].y = getAveragePageFault('clock');
    chartData[4].y = getAveragePageFault('clockPro');
    chartData[5].y = getAveragePageFault('wsclock');
    chartData[6].y = getAveragePageFault('car');
    chartData[7].y = getAveragePageFault('lru');
    chartData[8].y = getAveragePageFault('nfu');
    chartData[9].y = getAveragePageFault('random');
    faultChart.render();
}

var BUFFER = [];
var PAGE_FAULT = 0;
var STEP = 0;

// Run fifo algo
function runFifo(){
    // Read input data
        var DATA = $('#page-data-input').val().split(',').map(Number);
        var BUFF_SIZE = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var FIFOstart = new Date(); 
        fifo(DATA,BUFF_SIZE);
        var FIFOend = new Date();
        
        //Add data to array
        faultData['fifo'].push(PAGE_FAULT);
        
        // Append and display results
        $("#results-wrap").append("<h4>FIFO : "+PAGE_FAULT+" page faults!</h4>");
        $('#results-wrap').append("<h4>FIFO Time: " + (FIFOend-FIFOstart)/1000 + "s</h4>");
        $("#results-wrap").show();
        
        // Update chart
        updateChart();
}

function fifo(data, bs){ 
    pf = 0;
    BUFFER = [];
    STEP = -1;
    PAGE_FAULT = 0;
    var history = [];
    var age = 0;
    var idx; // Index for element of interest
    for (var i = 0; i < data.length; i++){
        STEP++;
        renderBuffer();
        // If page is in buffer/history
        idx = findPage(data[i], history);
        if(idx != -1){
//            console.log("Element in ");
            history[idx].age = age;
            continue;
        }

        // Buffer not full - add at the end
        if(BUFFER.length<bs){
            history.push({page:data[i],age: age})
            updateBuffer(history);
            age++;
            continue;
        }
        
        // If page is not in buffer/history = page fault
        idx = findOldestIndex(history);
        // Check for errors
        if(idx == -1){
            console.log("Index == -1");
            return;
        }
        history[idx].page = data[i];
        history[idx].age = age;
        PAGE_FAULT++;

        // Increment "time"
        age++;
        updateBuffer(history);
    }
    renderBuffer();
}

function findOldestIndex(history){
    var index = null;
    var sAge = null; // smallest age
    if(history.length<1){
        return -1;
    }
    index = 0;
    sAge = history[0].age;

    for (var i = 1; i < history.length; i++){
        if(history[i].age<sAge){
            sAge = history[i].age;
            index = i;
        }
    }
    return index;
}

function findPage(page, history){
    for (var i = 0; i < history.length; i++){
        if(history[i].page==page){
            return i;
        }
    }
    return -1;
}

function updateBuffer(history){
    for (var i = 0; i < history.length; i++){
        BUFFER[i]=history[i].page;
    }
//    console.log(BUFFER);
}

function renderBuffer(){
    var table = $("tbody");
    var data = "<td>STEP "+STEP+":</td>";
    for (var i = 0; i < BUFFER.length; i++){
        data += "<td>"+BUFFER[i]+"</td>";
    }
    table.append("<tr>"+data+"</tr>");
}
