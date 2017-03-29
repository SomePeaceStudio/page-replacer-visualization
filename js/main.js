$(document).ready(function(){
    $("#run").click(function(){
        // Read data from textarea
        var DATA = $('#page-input').val().split(',').map(Number)
        var FIFOstart = new Date(); 
        fifo(DATA,BUFF_SIZE);
        var FIFOend = new Date();
        $("#results").append("<h4>FIFO : "+PAGE_FAULT+" page faults!</h4>");
        $('#results').append("<h4>FIFO Time: " + (FIFOend-FIFOstart)/1000 + "s</h4>")
        $("#results").show();
    });
});

var BUFFER = [];
var BUFF_SIZE = 3;
var PAGE_FAULT = 0;
var STEP = 0;

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
            console.log("Element in ");
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