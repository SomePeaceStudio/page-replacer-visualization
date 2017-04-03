var $area; // global variable

$(document).ready(function(){
    $area = $("#page-replace-visualizer .dataContainer");
        
    // Execute FIFO button
    $("#run-fifo").click(function(){
        runFifo();
    });
    
    // Execute LRU button
    $("#run-lru").click(function(){
        runLru();
    });
    
    // Execute Random button
    $("#run-random").click(function(){
        runRandom();
    });
    
    // Execute Optimal button
    $("#run-optimal").click(function(){
        runOptimal();
    });

    // Execute Nfu button
    $("#run-nfu").click(function(){
        runNfu();
    });


    // Reset Everyting
    $("#clear-all").click(function(){
        clearAll();
    });


    // Execute Random data button
    $("#rnd-gen").click(function(){
        var length = $('#rnd-page-length').val();
        var bufferMin = $('#rnd-buffer-min').val();
        var bufferMax = $('#rnd-buffer-max').val();
        genRandomData(length);
        genRandomBufferSize(bufferMin,bufferMax);
    });
    
    //Test all n times
    $("#test-all").click(function(){
        setTimeout(function(){
            showSpinner();
        },0)
        var times = parseInt($('#execute-times').val());
        if (times < 0) {
            times = 0;
        }
        else if (times > 200) {
            times = 200;    // should have some upper limit as well for safety :)
        }
        setProgressBar(0);
        $area.html('');
        if (times === 0) {
            $('#results-wrap').hide();
        }
        setTimeout(function(){
            for (var i=1; i <= times; i++){
            setTimeout(function(i){
                var length = $('#rnd-page-length').val();
                var bufferMin = $('#rnd-buffer-min').val();
                var bufferMax = $('#rnd-buffer-max').val();
                genRandomData(length);
                genRandomBufferSize(bufferMin,bufferMax);

                runFifo();
                runLru();
                runRandom();
                runOptimal();
                runNfu();
                // TODO: add other algo functions
                setProgressBar((i/times)*100);
                if (i == times){
                    setTimeout(function(){
                        hideSpinner();
                    },0);
                }
            },0,i);
        }
        },10)
        
    });

    // Run all with input data provided
    $("#run-all").click(function(){
        runFifo();
        runLru();
        runRandom();
        runOptimal();
        runNfu();
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
    'random':[],
    'optimal':[]
};

// Return random integer in range [min,max]
function getRandomInteger(min,max){
    return Math.floor(Math.random()*(max))+min;
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

function showSpinner(){
    $('#spinner').show();
}

function hideSpinner(){
    $('#spinner').hide();
}

// Update page faults chart
function updateChart(){
    chartData[0].y = getAveragePageFault('fifo');
    chartData[0].toolTipContent = "{label}: {y} page faults \n"+faultData['fifo'].length+" executions";
    
    chartData[1].y = getAveragePageFault('aging');
    chartData[1].toolTipContent = "{label}: {y} page faults \n"+faultData['aging'].length+" executions";
    
    chartData[2].y = getAveragePageFault('secondChance');
    chartData[2].toolTipContent = "{label}: {y} page faults \n"+faultData['secondChance'].length+" executions";
    
    chartData[3].y = getAveragePageFault('clock');
    chartData[3].toolTipContent = "{label}: {y} page faults \n"+faultData['clock'].length+" executions";
    
    chartData[4].y = getAveragePageFault('clockPro');
    chartData[4].toolTipContent = "{label}: {y} page faults \n"+faultData['clockPro'].length+" executions";
    
    chartData[5].y = getAveragePageFault('wsclock');
    chartData[5].toolTipContent = "{label}: {y} page faults \n"+faultData['wsclock'].length+" executions";
    
    chartData[6].y = getAveragePageFault('car');
    chartData[6].toolTipContent = "{label}: {y} page faults \n"+faultData['car'].length+" executions";
    
    chartData[7].y = getAveragePageFault('lru');
    chartData[7].toolTipContent = "{label}: {y} page faults \n"+faultData['lru'].length+" executions";
    
    chartData[8].y = getAveragePageFault('nfu');
    chartData[8].toolTipContent = "{label}: {y} page faults \n"+faultData['nfu'].length+" executions";
    
    chartData[9].y = getAveragePageFault('random');
    chartData[9].toolTipContent = "{label}: {y} page faults \n"+faultData['random'].length+" executions";
    
    chartData[10].y = getAveragePageFault('optimal');
    chartData[10].toolTipContent = "{label}: {y} page faults \n"+faultData['random'].length+" executions";
    
    faultChart.render();
}

// Reset all charts / data
function clearAll(){
    for (obj in faultData){
        faultData[obj]=[];
        updateChart();
        $(".dataContainer *").remove();
    }
};

// ---------- Functions for running all algorithms ----------------------------- //

// Run fifo algo
function runFifo(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var fifoStart = new Date(); 
        var results = fifo(data,buffSize);
        var fifoEnd = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in FIFO");
            return;
        }

        // Add data to array
        faultData['fifo'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").show();
        $area.append("<h4>FIFO : "+results.pageFaults+" page faults!</h4>");
        $area.append("<h4>FIFO Time: " + (fifoEnd-fifoStart)/1000 + "s</h4>");
        $area.append("<hr>");
        
        // Update chart
        updateChart();
}

// Run lru algo
function runLru(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var lruStart = new Date(); 
        var results = lru(data,buffSize);
        var lruEnd = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in LRU");
            return;
        }

        // Add data to array
        faultData['lru'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").show();
        $area.append("<h4>LRU : "+results.pageFaults+" page faults!</h4>");
        $area.append("<h4>LRU Time: " + (lruEnd-lruStart)/1000 + "s</h4>");
        $area.append("<hr>");
        
        // Update chart
        updateChart();
}

// Run Random algo
function runRandom(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var randStart = new Date(); 
        var results = random(data,buffSize);
        var randEnd = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in Random");
            return;
        }

        // Add data to array
        faultData['random'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").show();
        $area.append("<h4>Random : "+results.pageFaults+" page faults!</h4>");
        $area.append("<h4>Random Time: " + (randEnd-randStart)/1000 + "s</h4>");
        $area.append("<hr>");
        
        // Update chart
        updateChart();
}

// Run Optimal algo
function runOptimal(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var Start = new Date(); 
        var results = optimal(data,buffSize);
        var End = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in Optimal");
            return;
        }

        // Add data to array
        faultData['optimal'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").show();
        $area.append("<h4>Optimal : "+results.pageFaults+" page faults!</h4>");
        $area.append("<h4>Optimal Time: " + (End-Start)/1000 + "s</h4>");
        $area.append("<hr>");
        
        // Update chart
        updateChart();
}

// Run Nfu algo
function runNfu(){
    // Read input data
        var data = $('#page-data-input').val().split(',').map(Number);
        var buffSize = parseInt($('#buffer-size-input').val());
        
        // Mesure execution time
        var Start = new Date(); 
        var results = nfu(data,buffSize);
        var End = new Date();
        
        // Return if erros where found
        if(results == null){
            console.log("Error in Nfu");
            return;
        }

        // Add data to array
        faultData['nfu'].push(results.pageFaults);
        
        // Append and display results
        $("#results-wrap").show();
        $area.append("<h4>NFU : "+results.pageFaults+" page faults!</h4>");
        $area.append("<h4>NFU Time: " + (End-Start)/1000 + "s</h4>");
        $area.append("<hr>");
        
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
    $area.append("<table><tbody></tbody></table>");
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

// Fing oldest indes in history object
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
// ========================================================================= //
// ------------------------------ FIFO ------------------------------------- //
// ========================================================================= //

// First in first out
// fifo(data, buffer size)
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

//---- FIFO END ---- //


// ========================================================================= //
// ------------------------------ LRU -------------------------------------- //
// ========================================================================= //

// Least reacently used
// lru(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function lru(data, bs){ 
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
            history[idx].age = age;
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

// ========================================================================= //
// ------------------------------ Random ------------------------------------- //
// ========================================================================= //

// Random algorithm
// random(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function random(data, bs){ 
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
        idx = getRandomInteger(0,bs-1);
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

//---- Random END ---- //


// ========================================================================= //
// ------------------------------ Optimal ---------------------------------- //
// ========================================================================= //


// Fing oldest indes in history object
function findOptimalPageToReplace(data, history){
    var index = null;// index of element to replace
    var notUsedTheLongest = 0;

    // Abort if there is no elements in history
    if(history.length<1){
        return -1;
    }
    
    for (var i = 0; i < history.length; i++)
    {
        var currElem = history[i].page;
        var elemFound = false;
        for (var j = 0; j < data.length; j++)
        {
            if(currElem == data[j])
            {
                elemFound = true;
                if(notUsedTheLongest < j)
                {
                    notUsedTheLongest = j;
                    index = i;
                }
                
                break;
            }
        }
        
        if (elemFound === false)
        {
            index = i;
            return index;
        }
    }
    
    return index;
}

// Random algorithm
// int random(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function optimal(data, bs){ 
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
        idx = findOptimalPageToReplace(data.slice(i,data.length),history);
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

//---- Optimal END ---- //


// ========================================================================= //
// -------------------------- NFU/LFU -------------------------------------- //
// ========================================================================= //

// Not frequently used
// nfu(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function nfu(data, bs){ 
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
            history[idx].count++;
            updateBuffer(buffer,history,-1);
            pageHits++;
            continue;
        }

        // If buffer not full: add new page
        if(buffer.data.length<bs){
            history.push({page:data[i],age: age, count: 1})
            updateBuffer(buffer,history,history.length-1);
            pageFaults++;
            age++;
            continue;
        }
        
        // If page is not in buffer: page fault
        idx = findLeastFrequentlyUsed(history);
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

// Finds least frequently usef page
// if there are two then use fifo to break the tie
// return index for least frequently used element
function findLeastFrequentlyUsed(history){
    var index = null;// index for element of interest
    var sCount = null; // smallest count
    var sAge = null; // smallest age

    // Abort if there is no elements in history
    if(history.length<1){
        return -1;
    }

    // Find smallest count
    index = 0;
    sCount = history[0].count;
    for (var i = 1; i < history.length; i++){
        if(history[i].count<sCount){
            sCount = history[i].count;
            index = i;
        }
    }
    // Find smallest age
    sAge = history[index].age;
    for (var i = 0; i < history.length; i++){
        if(history[i].count == sCount && history[i].age<sAge){
            sAge = history[i].age;
            index = i;
        }
    }

    return index;
}

//---- NFU/LFU END ---- //



// ========================================================================= //
// ------------------------------ MRU -------------------------------------- //
// ========================================================================= //

// Most reacently used
// mru(data, buffer size)
// return: 
//      >=0 : { page faults:int, page hits: int } 
//      null  : error
function mru(data, bs){ 
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
            history[idx].age = age;
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
        idx = findJungestIndex(history);
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

// Finds most reacently used page
function findJungestIndex(history){
    var index = null;// index of oldest element
    var lAge = null; // largest age

    // Abort if there is no elements in history
    if(history.length<1){
        return -1;
    }

    index = 0;
    lAge = history[0].age;
    for (var i = 1; i < history.length; i++){
        if(history[i].age>lAge){
            lAge = history[i].age;
            index = i;
        }
    }
    return index;
}

//---- MRU END ---- //