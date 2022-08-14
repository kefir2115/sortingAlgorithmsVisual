const sorts = document.querySelectorAll(".sort");
const columns = document.querySelector(".cols");
const sp = document.querySelector(".speed");
const code = document.querySelector(".code")
const pp = document.querySelector(".pp");

var sorting = 0;
var started = false;
var step = 0;
var stepi = 0;
var values = [];
var tag = "sorting:";
var speed = 2;
var operations = 0;
var operationLog = "";
var playing = false;
var ticks = 0;
var hl = [];

function init() {
    loadStorage();
    createColumns();
    ticker();
}
init();

function r(min, max) {
    return min+Math.round(Math.random()*(max-min));
}
function get(i) {
    return columns.childNodes[i] != null && columns.childNodes[i].innerHTML*1;
}

function createColumns() {
    columns.innerHTML = "";
    let size = r(10, 20);
    for(let i = 0; i < size; i++) {
        let rd = r(1, size-3);
        columns.appendChild(createColumn(rd));
    }
    operationLog = [];
}

function createColumn(rd) {
    let e = document.createElement("div");
    e.className = "col";
    e.innerHTML = rd;
    e.style.height = ((rd+2)*10)+"px";
    e.style.marginTop = (120-(rd+2)*10)+"px";
    return e;
}

function ticker() {
    let childSize = columns.childNodes.length;
    setTimeout(() => {
        ticker();
    }, percOfSpeed());
    if(started && playing) {
        ticks++;
        if(ticks>=1000) {
            ticks = 0;
        }
        checkFinished();
        checkHL();
        if(sorting==0) {
            if(step==0) {
                if(values[0]==null) {
                    values[0] = childSize-1;
                }
                if(stepi==values[0]) {
                    stepi=0
                    values[0]--;
                }
                let el1 = get(stepi);
                let el2 = get(stepi+1);
    
                stat("Checking if "+el1+" is greater than "+el2);
                highlight(stepi, "check");
                highlight(stepi+1, "check");
                if(el1>el2) {
                    step = 1;
                } else {
                    stepi++;
                }
            } else if(step==1) {
                highlight(stepi, "succ");
                highlight(stepi+1, "succ");
                stat("Swapping positions");
                swap(stepi);
                stepi++;
                step = 0;
            }
        } else if(sorting==1) {
            if(step==0) {
                if(values[1]==null) values[1]=0;
                if(stepi==columns.childNodes.length) {
                    step=1;
                    return;
                }
                let e1 = get(stepi);
                stat("Checking if "+e1+" is the lowest");
                highlight(stepi, "check");
                if(e1 != false && (values[0] == null || e1<=values[2])) {
                    if(values[0] != null && values[0] != -1) {
                        highlight(values[0], "succ", 0);
                    }
                    values[0] = stepi;
                    values[2] = e1;
                    stat("Declaring "+e1+" as lowest value");
                    highlight(stepi, "succ", -1);
                }
                stepi++;
            } if(step==1) {
                if(values[0] != -1) {
                    stat("Swapping first unsorted value with lowest found");
                    swapel(values[0], values[1]);
                    highlight(values[0], "succ");
                    highlight(values[1], "succ");
                }
                values[1]++;
                values[0] = -1;
                values[2] = 100;
                stepi=values[1];
                step = 0;
            }
        } else if(sorting==2) {
            if(step==0) {
                let e = get(stepi);
                stat("Finding next unsorted value");
                if(values[0]==null) {
                    values[0] = e;
                    values[1] = stepi;
                    values[2] = stepi;
                    highlight(stepi, "check");
                    step = 1;
                }
                stepi++;
            } else if(step==1) {
                if(values[1]!=0) {
                    stat("Swapping with previous value if it is higher");
                    let e = get(values[1]-1);
                    highlight(values[1], "check");
                    highlight(values[1]-1, "check");
                    if(values[0]<e) {
                        values[1]--;
                        swap(values[1]);
                        highlight(values[1], "succ");
                        highlight(values[1]+1, "succ");
                    } else {
                        values[1] = 0;
                    }
                }
                if(values[1]==0 || values[0] == null) {
                    values[0] = null;
                    values[1] = null;
                    step = 0;
                }
            }
        } else if(sorting==3) {
            if(step==0) {
                stat("Split values into groups of 2, then take first element of each group in order");
                if(stepi<columns.childNodes.length-1) {
                    let e = get(stepi);
                    let e2 = get(stepi+1);
                    highlight(stepi, "check");
                    highlight(stepi+1, "check");
                    if(e>e2) {
                        swap(stepi);
                        highlight(stepi, "succ");
                        highlight(stepi+1, "succ");
                    }
                    stepi+=2;
                } else {
                    step=1;
                    stepi=0;
                }
            } if(step==1) {
                stat("Split values into groups of 4, then take first element of each group in order");
                let elements = [];

                for(let i = 0; i < 4; i++) {
                    if(stepi+i<childSize) {
                        elements.push(get(stepi+i));
                    }
                }
                if(elements.length==0) {
                    step=2;
                    stepi = 0;
                }
                updateFrom(stepi, sortarr(elements));
                stepi+=elements.length;
            } if(step==2) {
                stat("Split values in half, then take first element of each group in order");
                let size = stepi == 0 ? parseInt(childSize/2) : childSize-stepi+1;
                let elements = [];

                for(let i = 0; i < size; i++) {
                    if(stepi+i<childSize-1) elements.push(get(stepi+i));
                }
                if(elements.length==0) {
                    step=3;
                    stepi = 0;
                }
                updateFrom(stepi, sortarr(elements));
                stepi+=size;
            } if(step==3) {
                stat("Sort array by taking first element of each group in order");
                let elements = [];

                for(let i = 0; i < childSize; i++) {
                    elements.push(get(i));
                }
                updateFrom(stepi, sortarr(elements));
                step=4;
                stepi=0;
            } if(step==4) {
                stepi++;
            }
        } else if(sorting==4) {

        } else {
            console.log("ERROR: Invalid sorting algorithm selected!");
        }
    }
}

function percOfSpeed() {
    return speed==5?0:speed==4?50:speed==3?100:speed==2?200:speed==1?400:800;
}

function swap(i1) {
    let e1 = columns.childNodes[i1];
    let e2 = columns.childNodes[i1+1];
    e1.remove();
    insertAfter(e1, e2);
}
function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    operations++;
}

function swapel(i1, i2) {
    if(i1 == i2) return;
    let e1 = columns.childNodes[i1];
    let e2 = columns.childNodes[i2];
    let c1 = e1.cloneNode();
    let c2 = e2.cloneNode();
    c1.innerHTML = e1.innerHTML;
    c2.innerHTML = e2.innerHTML;
    insertAfter(c1, e2);
    insertAfter(c2, e1);
    e1.remove();
    e2.remove();
}

function checkFinished() {
    let item = 0;
    columns.childNodes.forEach(element => {
        let v = element.innerHTML*1;
        if(v>=item) item = v;
        else item = 100;
    });
    if(item != 100) {
        let o = operations;
        reset();
        operations = o;
        stat("Array sorted");
    }
}

window.onclick = (e) => {
    let t = e.target.className;
    if(t=="execute") {
        reset();
        started = true;
        playing = true;
    }
    if(t=="sort") {
        sorts.forEach((element, i) => {
            element.className = element.className.replaceAll(" selected", "");
            if(element==e.target) sorting = i;
        });
        sorts[sorting].className+=" selected";
        reset();
        createColumns();
        localStorage.setItem(tag+"selected", sorting);
    }
    if(t=="reset") {
        reset();
        createColumns();
    }
    if(t=="download") {
        downloadOperationLog();
    }
    if(t=="pp") {
        playing = !playing;
        if(playing) {
            started = true;
        }
        pp.src = "assets/"+(playing?"pause":"play")+".png";
    }
}

function loadStorage() {
    let item = localStorage.getItem(tag+"selected");
    if(item == null) {
        localStorage.setItem(tag+"selected", sorting);
        localStorage.setItem(tag+"speed", speed);
        sorts[0].className+=" selected";
    } else {
        sorting = item*1;
        speed = localStorage.getItem(tag+"speed")*1;
        sp.selectedIndex = speed;
        sorts[sorting].className+=" selected";
    }
}

function reset() {
    started = false;
    step = 0;
    stepi = 0;
    values = [];
    operations = 0;
    endHL();
    stat("Waiting to sort...");
}
function changeSpeed(event) {
    speed = event.target.selectedIndex;
    localStorage.setItem(tag+"speed", speed);
    stat("Speed set to: " + event.target.childNodes[speed*2+1].innerHTML);
}

function stat(text) {
    code.innerHTML = text + "<br>Operations: "+operations;
    operationLog+="["+getDateFormated()+"] "+text+"\n";
}

function getDateFormated() {
    let d = new Date();
    return formatItem(d.getHours())+":"+formatItem(d.getMinutes())+":"+formatItem(d.getSeconds());
}
function formatItem(item) {
    return (item+"").length==1?"0"+item:item;
}
/**
 * @param {integer} index 
 * @param {string} color
 * @param {integer} timeout
 * Colors:
 *  "check" - yellow
 *  "succ" - green
 */
function highlight(index, color, timeout) {
    if(timeout == null) timeout = 1;
    let cn = columns.childNodes[index].className;
    if(cn.includes(" ")) {
        columns.childNodes[index].className = cn.split(" ")[0];
    }
    columns.childNodes[index].className+=" "+color;
    if(timeout != -1) {
        unhighlight(index, color, timeout);
    }
}

function unhighlight(index, color, timeout) {
    hl.push([index, color, timeout]);
}

/**
 * 
 * Code from https://stackabuse.com/insertion-sort-in-javascript/
 */
function sortarr(inputArr) {
    let n = inputArr.length;
    for(let i = 1; i < n; i++) {
        let current = inputArr[i];
        let j = i-1; 
        while((j > -1) && (current < inputArr[j])) {
            inputArr[j+1] = inputArr[j];
            j--;
        }
        inputArr[j+1] = current;
    }
    return inputArr;
}

function updateFrom(index, arr) {
    arr.forEach((e, i) => {
        let tc = columns.childNodes[index+i];
        let c = createColumn(e);
        tc.setAttribute("style", c.getAttribute("style"));
        tc.innerHTML = c.innerHTML;
        highlight(index+i, "succ");
        operations++;
    });
}
function downloadOperationLog() {
    if(operationLog.length==0) return;
    var e = document.createElement('a');
    e.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(operationLog);
    e.download = "operationLog.log";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
}

function checkHL() {
    hl.forEach((e, i) => {
        e[2]--;
        let index = e[0];
        let color = e[1];
        let t = e[2];
        let cn = columns.childNodes[index].className;
        if(t<=0) {
            if(cn.includes(" "+color)) {
                columns.childNodes[index].className = cn.split(" ")[0];
            }


            hl.splice(hl.indexOf(e), 1);
        }
    });
}
function endHL() {
    while(hl.length != 0) {
        hl.forEach((e, i) => {
            e[2]--;
            let index = e[0];
            let color = e[1];
            let t = e[2];
            let cn = columns.childNodes[index].className;
            if(t<=0) {
                if(cn.includes(" "+color)) {
                    columns.childNodes[index].className = cn.split(" ")[0];
                }
    
    
                hl.splice(hl.indexOf(e), 1);
            }
        });
    }
}

function getAll() {
    let t = [];

    columns.childNodes.forEach((e, i) => {
        t.push(e.innerHTML*1);
    });

    return t;
}
function setIndexToNewNode(index, node) {
    let tc = columns.childNodes[index];
    let c = node;
    tc.setAttribute("style", c.getAttribute("style"));
    tc.innerHTML = c.innerHTML;
    highlight(index, "succ");
    operations++;
}