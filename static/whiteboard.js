var canvas = document.getElementById("draw");
var ctx = canvas.getContext("2d");
var debugout = document.getElementById("debug");

var updaterate = 30;

var updateEvent;

var mdown = false;
var mlastpos;
var mlastdown = false;

function getMousePos(canvas,event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(event.clientX - rect.left),
        y: Math.floor(event.clientY - rect.top)
    };
}

function paintcircle(e) {
    mpos = getMousePos(canvas,e);
    ctx.beginPath();
    ctx.arc(mpos.x,mpos.y,5,0,Math.PI*2,false);
    ctx.fill();
}

function mousemove(e) {
    mpos = getMousePos(canvas,e);
    //debugout.innerHTML = "X: " + mpos.x + "<br>" + "Y: " + mpos.y;
    if(mdown) {
        paintcircle(e);
        if(mlastdown) {
            ctx.beginPath();
            ctx.moveTo(mlastpos.x,mlastpos.y);
            ctx.lineTo(mpos.x,mpos.y);
            ctx.lineWidth = 10;
            ctx.stroke();
            debugout.innerHTML = "!!!";
        }
    }
    
    mlastpos = mpos;
    mlastdown = mdown;
    debugout.innerHTML = mlastdown;
}

function mousedown(e) {mdown = true;}
function mouseup(e) {mdown = false;}

function updatecanvas() {
    
}

function start() {
    updateEvent = setInterval(updatecanvas,1000/updaterate);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousedown", mousedown);
}

start();
