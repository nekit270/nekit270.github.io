//WindowManager based on BCLib
//Written by Nekit270 (https://github.com/nekit270)
//ver 1.0

if(!document.querySelector("#windows")){
    let d = document.createElement("div");
    d.id = "windows";
    document.body.appendChild(d);
}

let windows = document.querySelector("#windows");
let wnd = 0;
let windowStyle = "overflow: auto; resize: both; background: white; display: inline-block; border: solid 1px black; position: absolute;";
let windowHeaderStyle = "";
let closeButtonStyle = "float: right; background: white; border: solid 1px black;";
let closeButtonText = " X ";

function openWindow(title, html, opt){
    wnd++;
    if(!opt) opt = {};
    let left = opt.x || Math.floor(Math.random()*(window.innerWidth - 300));
    let top = opt.y || Math.floor(Math.random()*(window.innerHeight - 300));
    let win = document.createElement("div");
    win.draggable = true;
    win.id = "w"+wnd;
    win.style = windowStyle;
    win.innerHTML = "<div id='header' style='"+windowHeaderStyle+"'>" +
    title + " <button tabindex='-1' onclick='windows.removeChild(document.getElementById(\"w"+wnd+"\")); delete bclib.task[\""+title+"\"]' title=\"Закрыть\" style='"+closeButtonStyle+"'>" + closeButtonText + "</button></div> " +
    "<hr style='margin: 0px; clear: both; background: black;'>" + html;
    windows.appendChild(win);
    win.style.left = left+"px";
    win.style.top = top+"px";
    win.ondragend = function(e){
        e.preventDefault();
        let dx = e.pageX;
        let dy = e.pageY;
        e.target.style.left = dx+"px";
        e.target.style.top = dy+"px";
    }
    win.ondrag = function(e){
        e.preventDefault();
    }
    return wnd;
}

function closeWindow(id){
    let win = document.querySelector("#w"+id);
    windows.removeChild(win);
}
