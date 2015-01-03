var canvas = document.getElementById("draw");
var ctx = canvas.getContext("2d");
var debugout = document.getElementById("debug");
var chatmain = document.getElementById("chatmain");
var chattext = document.getElementById("chattext");
var chatsend = document.getElementById("chatsendbutton");
var boardname = function(a){return a[a.length-1];}
                (window.location.pathname.split("/"));
var loguser = document.getElementById("loguser")
loguser = loguser ? loguser.innerHTML : "Anonymous"

var canvasupdaterate = 30;
var chatupdaterate = 1;

var canvasUpdateEvent;
var chatUpdateEvent;

var mdown = false;
var mlastpos;
var mlastdown = false;

function updatechat(r) {
    chatmain.innerHTML = r.content;
    chatmain.scrollTop = chatmain.scrollHeight;
    //fix this at some point
}

function ajaxsendchat(text) {
    if(text.length==0) {return;}
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/ajax/chat/"+boardname,
        data: JSON.stringify({content: text, board: boardname}),
        dataType: "json",
        success: function(r){debugout.innerHTML="r";}
    });
    if(sessionStorage.username) {
        user = sessionStorage.username;
    } else {
        user = "Anonymous";
    }
    chatmain.innerHTML += "&lt;"+user+"&gt; "+text+"<br>\n";
    chatmain.scrollTop = chatmain.scrollHeight;
}

function ajaxupdatechat() {
    jQuery.getJSON("/ajax/chat/"+boardname,updatechat);
}

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

function chatkey(e) {
    if(e.keyCode==13) {
        chatsend.click();
    }
}

function chatsendclick(e) {
    ajaxsendchat(chattext.value);
    ajaxupdatechat();
    chattext.value = "";
}

function updatecanvas() {
    
}

function start() {
    canvasUpdateEvent = setInterval(updatecanvas,1000/canvasupdaterate);
    chatUpdateEvent = setInterval(ajaxupdatechat,1000/chatupdaterate);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousedown", mousedown);
    chattext.addEventListener("keydown", chatkey);
    chatsend.addEventListener("click", chatsendclick);
    
    jQuery.getJSON("/ajax/test",
                   function(r){debugout.innerHTML = r.x;})
    ajaxupdatechat();
}

start();
