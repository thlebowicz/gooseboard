//-----global vars

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

var canvasupdaterate = 1;
var chatupdaterate = 1;

var mdown = false;
var mlastpos;
var mlastdown = false;

var pensize = 10;

var curboard;
var curstroke;

var lastserverstroketime = 0;
var initloaded = false;
var allowdraw = false;

//-----object prototypes

function Whiteboard() {
    this.strokes = [];
    this.image = null;
    this.addStroke = function(stroke) {
        this.strokes.push(stroke);
    }
}

function Stroke(owner,thickness,source) {
    this.owner = owner;
    this.source = source;
    this.path = [];
    this.thickness = thickness;
    this.addPoint = function(x,y) {
        var next = new Point(x,y);
        this.path.push(next);
    }
    this.debugPrint = function() {
        console.log("STROKE");
        for (i=0; i<this.path.length; i++) {
            console.log("X: "+this.path[i].x+"Y: "+this.path[i].y); 
        }
    }
    this.draw = function() {
        for (i=0; i<this.path.length-1; i++) {
            paintcircle(this.path[i].x,this.path[i].y,5);
            paintcircle(this.path[i+1].x,this.path[i+1].y,5);
            paintline(this.path[i].x,this.path[i].y,
                      this.path[i+1].x,this.path[i+1].y,
                      10);
        }
    }
    //this.draw = function() {}
}

function Point(x,y) {
    this.x = x;
    this.y = y;
}

//-----functions

//doesn't work
//not sure how to access flask session from javascript
function getcuruser() {
    if(sessionStorage.username) {
        return sessionStorage.username;
    } else {
        return "Anonymous";
    }
}

function updatechat(r) {
    chatmain.innerHTML = r.content;
    chatmain.scrollTop = chatmain.scrollHeight;
    window.setTimeout(ajaxupdatechat,1000/chatupdaterate);
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
        success: function(r){debugout.innerHTML="ajaxsendchat";}
    });
    user = getcuruser();
    chatmain.innerHTML += "&lt;"+user+"&gt; "+text+"<br>\n";
    chatmain.scrollTop = chatmain.scrollHeight;
}

function ajaxupdatechat() {
    jQuery.getJSON("/ajax/chat/"+boardname,updatechat);
}

function ajaxsendstroke(stroke) {
    if(!stroke) {return;}
    if(stroke.path.length==0) {return;}
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/ajax/canvasstroke/"+boardname,
        data: JSON.stringify({content: stroke, board: boardname}),
        dataType: "json",
        success: function(r){
            debugout.innerHTML=JSON.stringify(r);
        }
    });
}

function updatecanvas(r) {
    lastserverstroketime = r.content[r.content.length-1].time
    max = r.content.length;
    for(k=0; k<max; k++) {
        cur = new Stroke(r.content[k].author,10,"SERVER");
        for(j=0; j<r.content[k].content.path.length; j++) {
            cur.addPoint(r.content[k].content.path[j].x,
                         r.content[k].content.path[j].y);
        }
        cur.draw();
    }
    window.setTimeout(ajaxupdatecanvas,1000/canvasupdaterate);
}

function ajaxupdatecanvas() {
    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/ajax/canvas/"+boardname+"/"+lastserverstroketime,
        success: function(r) {
            updatecanvas(r);
        }
    });
}

function getMousePos(canvas,event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(event.clientX - rect.left),
        y: Math.floor(event.clientY - rect.top)
    };
}

function paintcircle(x,y,radius) {
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2,false);
    ctx.fill();
}

function paintline(x1,y1,x2,y2,radius) {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineWidth = pensize;
    ctx.stroke();
}

function mousemove(e) {
    mpos = getMousePos(canvas,e);
    //debugout.innerHTML = "X: " + mpos.x + "<br>" + "Y: " + mpos.y;
    if(mdown) {
        paintcircle(mpos.x, mpos.y, pensize/2);
        if(mlastdown) {
            paintline(mlastpos.x, mlastpos.y, mpos.x, mpos.y, pensize/2);
            curstroke.addPoint(mpos.x, mpos.y);
            debugout.innerHTML = "!!!";
        } else {
            curstroke = new Stroke(getcuruser(),pensize,"CLIENT");
            curboard.addStroke(curstroke);
            curstroke.addPoint(mpos.x, mpos.y);
        }
    }
    
    mlastpos = mpos;
    mlastdown = mdown;
    debugout.innerHTML = curstroke;
}

function mousedown(e) {mdown = true;}
function mouseup(e) {
    mdown = false;
    ajaxsendstroke(curstroke);
}

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

/*$("#full").spectrum({
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
});*/   

function start() {
    //saveboard.addEventListener("click", saveBoardToDB);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousedown", mousedown);
    chattext.addEventListener("keydown", chatkey);
    chatsend.addEventListener("click", chatsendclick);
    
    curboard = new Whiteboard();

    jQuery.getJSON("/ajax/test",
                   function(r){debugout.innerHTML = r.x;})
    ajaxupdatechat();
    ajaxupdatecanvas();
}

start();
