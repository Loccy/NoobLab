/*
  This file contains various ugly hacks to make the version of Doppio that we scraped
  from their demo site actually run.
*/

/* fake enough of the Ace editor to get past page initialisation */
ace = {
  edit : function() { return ace },
  setTheme : function() { return ace }
}

var Buffer;

function proposeGeometry(term){
    globalTerm.focus();
    var availableHeight = $("div#console").height();
    var availableWidth = $("div#console").width();
    $("div#console div.xterm-rows").append('<div id="widthscanner" style="display: inline-block">mmmmmmmmmm</div>');
    var cursorWidth = $("div#widthscanner").width()/10;
    var cursorHeight = $("div#widthscanner").height();
    $("div#widthscanner").remove();
    var geometry = {
      cols: Math.floor(availableWidth / (cursorWidth)),
      rows: Math.floor(availableHeight / (cursorHeight))
    };
    return geometry;
  };

function resizeWindow()
{
  var geom = proposeGeometry(globalTerm);
  globalTerm.resize(geom.cols,geom.rows);
}

var commands = [];
var shellpid = undefined;
var postfunc = [];

function runShellCommand(cmd,pf)
{
    // need to offset the postfunc stack by one, as an initial
    // postfunc will fire on the first command
    if (postfunc.length == 0) postfunc.push(undefined);
    postfunc.push(pf);
    
    shell._shellEnabled = true;
    commands.push(cmd);    
    if (shellpid == undefined) shellpid = setInterval(function(){        
        if (commands.length == 0 && !shell._activeCommand)
        {
            var nextpost = postfunc.shift();
            if (nextpost) nextpost();
            shell._shellEnabled = false;
            clearInterval(shellpid);
            postfunc = [];
            shellpid = undefined;
        }
        if (!shell._activeCommand && commands.length != 0)
        {
            var nextpost = postfunc.shift();
            if (nextpost) nextpost();
            var single = commands.shift();
            shell._runCommand(single,single.trim().split(/\s+/g));
        }
    },100);        
}

function newDoppioLoaded()
{                    
    parent.$("div#output-main div.status").remove();
    parent.enableRun();
    shell._shellEnabled = false;
    Buffer = BrowserFS.BFSRequire('buffer').Buffer;
    parent.status("The enhanced Java runtime has loaded. Photon torpedoes ready, captain.","border");
    setTimeout(function(){
        parent.$("div#output-main div.status").remove();
    },5000);        
    
    setTimeout(function(){
        //resizeWindow();
        var resizeTimer;
        $(window).on('resize', function(e) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function() {
            // Run code here, resizing has "stopped"
            resizeWindow();
            //console.log("stopped");
          },50);
        });
      },1000);
}

$(document).ready(function(){
  // click the "start demo" button
  setTimeout(function(){
    $("button#demo_button").click();
    parent.$("input#runbutton").prop('disabled', true);
    parent.status("The enhanced Java runtime is loading. You'll be able to run code once it's done - although you can start editing right away.","border error");
  },10);

});
