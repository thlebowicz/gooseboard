var canvas = document.getElementById("draw");
var ctx = canvas.getContext("2d");
var debugout = document.getElementById("debug");
var chatmain = document.getElementById("chatmain");
var chattext = document.getElementById("chattext");
var chatsend = document.getElementById("chatsendbutton");
var saveboard = document.getElementById("saveboardbutton");
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

function saveBoardToDB(){
    var dataURL = canvas.toDataURL();
}

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

$("#full").spectrum({
    color: "#ECC",
    showInput: true,
    className: "full-spectrum",
    showInitial: true,
    showPalette: true,
    showSelectionPalette: true,
    maxPaletteSize: 10,
    preferredFormat: "hex",
    localStorageKey: "spectrum.demo",
    move: function (color) {
        
    },
    show: function () {
    
    },
    beforeShow: function () {
    
    },
    hide: function () {
    
    },
    change: function() {
        
    },
    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
        "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
        "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
        "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
        "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
        "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
        "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ]
});


function start() {
    canvasUpdateEvent = setInterval(updatecanvas,1000/canvasupdaterate);
    chatUpdateEvent = setInterval(ajaxupdatechat,1000/chatupdaterate);
    saveboard.addEventListener("click", saveBoardToDB);
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
