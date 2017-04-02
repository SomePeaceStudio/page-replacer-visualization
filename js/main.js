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
        setProgressBar(0);
        
        for (var i=1; i <= times; i++){
            setTimeout(function(i){
                var length = $('#rnd-page-length').val();
                var bufferMin = $('#rnd-buffer-min').val();
                var bufferMax = $('#rnd-buffer-max').val();
                genRandomData(length);
                genRandomBufferSize(bufferMin,bufferMax);

                runFifo();
                // TODO: add other algo functions
                setProgressBar((i/times)*100)
            },0,i);
        }
    });
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
    for (var i=1; i <= length; i++){
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

// Run fifo algo
function runFifo(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var FIFOstart = new Date(); 
        var results = fifo(data,buffSize);
        var FIFOend = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in FIFO");
            return;
        }

        // Add data to array
        faultData['fifo'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").append("<h4>FIFO : "+results.pageFaults+" page faults!</h4>");
        $('#results-wrap').append("<h4>FIFO Time: " + (FIFOend-FIFOstart)/1000 + "s</h4>");
        $("#results-wrap").show();
        
        // Update chart
        updateChart();
}

// ---------- Functions used by all algorithms ----------------------------- //

// Render buffer in current state
// Used by every page replacement algorithm
function renderBuffer(page, buffer, bs){
    var table = $("#page-replace-visualizer tbody").last();
    var i = -1; // index for buffer (escape 1.row)
    table.children("tr").each(function(){
        $this = $(this);
        var content = $this.html();
        // Add page number (1.row)
        if(i==-1){
            content+="<th>"+page+"</th>"
            $this.html(content);
            i++;
            return;
        }
        // Add F/H identifier (last row)
        if(i==bs){
            if(buffer.pageFaultIdx == -1){
                content += "<td class=\"green\">H</td>";
            }else{
                content += "<td class=\"red\">F</td>";
            }
            $this.html(content);
            i++;
            return;
        }
        // Add page buffer (2.row -> last row-1)
        if(i>buffer.data.length-1){
            content += "<td></td>";
            $this.html(content);
            i++;
            return;
        }
        // Add red class for page fault
        if(buffer.pageFaultIdx == i){
            content += "<td class=\"red\">"+buffer.data[i]+"</td>";
            $this.html(content);
            i++;
            return;
        }
        content+="<td>"+buffer.data[i]+"</td>"
        $this.html(content);
        i++;
    })
}

// Initialize new render area 
function renderBufferInit(bs){
    // Make new table and initialize with empty rows
    var area = $("#page-replace-visualizer");
    area.append("<table><tbody></tbody></table>");
    var table = $("#page-replace-visualizer tbody").last();
    var data = "";
    for (var i = 0; i < bs+2; i++){
        data += "<tr></tr>";
    }
    table.append(data);
}

// ---------- Functions used by multiple algorithms ------------------------ //

// Find page in history using page number
function findPage(page, history){
    for (var i = 0; i < history.length; i++){
        if(history[i].page==page){
            return i;
        }
    }
    return -1;
}

// Copy data from history objects to buffer array for easier rendering 
function updateBuffer(buffer,history,pageFaultIdx){
    for (var i = 0; i < history.length; i++){
        buffer.data[i]=history[i].page;
    }
    buffer.pageFaultIdx = pageFaultIdx;
}

// ========================================================================= //
// ------------------------------ FIFO ------------------------------------- //
// ========================================================================= //

// First in first out
// int fifo(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function fifo(data, bs){ 
    var buffer = { 
                    data:[], // buffer data
                    pageFaultIdx: -1    // index where was page fault
                                        // -1 for page hit
                 } 
    var pageFaults = 0;
    var pageHits = 0;

    var history = []; // page replacement history
    var age = 0; // page place time
    var idx; // Index for element of interest

    renderBufferInit(bs);
    for (var i = 0; i < data.length; i++){
        // Render buffer after first cycle
        if (i>0){
            renderBuffer(data[i-1],buffer,bs); 
        }

        // If page is in buffer/history: page hit
        idx = findPage(data[i], history);
        if(idx != -1){
            updateBuffer(buffer,history,-1);
            pageHits++;
            continue;
        }

        // If buffer not full: add new page
        if(buffer.data.length<bs){
            history.push({page:data[i],age: age})
            updateBuffer(buffer,history,history.length-1);
            pageFaults++;
            age++;
            continue;
        }
        
        // If page is not in buffer: page fault
        idx = findOldestIndex(history);
        // If element was not found
        if(idx == -1){
            return null; // Error state
        }
        history[idx].page = data[i];
        history[idx].age = age;
        pageFaults++;
        age++;
        updateBuffer(buffer,history,idx);
    }
    renderBuffer(data[data.length-1],buffer,bs);
    return {pageFaults:pageFaults,pageHits:pageHits};
}

function findOldestIndex(history){
    var index = null;// index of oldest element
    var sAge = null; // smallest age

    // Abort if there is no elements in history
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

//---- FIFO END ---- //


// ========================================================================= //
// ------------------------------ LRU -------------------------------------- //
// ========================================================================= //

//---- LRU END ---- //

// ========================================================================= //
// -------------------------- NFU/LFU -------------------------------------- //
// ========================================================================= //

//---- NFU/LFU END ---- //