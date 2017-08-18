// setup functions for skulpt
var pythonconsole = "";
var consoleupdatepid;
var hook = false;
var hookcommand = "";
var lastLineNo = -1;

Sk.externalLibraries = {
            carol : {
                path: 'carol_py.js'                
            },
            noobtest : {
                path: 'pythontest_module.js'
            }
        };
        
// Sk.hold(x) where x is the the number of millis to hold        
// ugly hack used by async Javascript functions
Sk.hold = function(waittime) {
    Sk.paulpause = waittime;
};        

// Sk.halt(msg), throws an error with msg
Sk.halt = function(msg) {
    Sk.paulspanner = msg;
}

function cls()
{
    $("div#output-py").contents().filter(function(){ return this.nodeType == 3; }).remove();
}

function outf(text,status) {        
    if (status == "error")
    {
        status = "red";
        var errorline = lastLineNo - 1;
        var errorparse = text.match(/on line ([0-9]+)/);
        if (errorparse) errorline = errorparse[1];
        //if (Sk.paulspanner) lastLineNo -= 1; // last line gets "run" if spanner is thrown
        text = text.replace(/on line [0-9]+/,"");
        text = "Error at line "+(errorline)+": "+text;
        if (text.indexOf("ParseError") == -1)
        {
            text = "Runtime "+text;
        }
        text = text.replace("ParseError: bad input","Syntax error");
        if (text.indexOf("Syntax error") != -1)
        {
            parent.LOGsyntaxError(text);
        }
        else
        {
            parent.LOGerror(text);
        }
        parent.editor.addLineClass(errorline-1,"background","error");
    }
    if (status)
    {
        text = '<br/><span style="color: '+status+'">'+text+"</span>";
        $("div#output-py").append(text);
    }
    else
    {
        $("div#output-py span#input").before(text);
    }
    //mypre.innerHTML = mypre.innerHTML + text;
    window.scrollTo(0,document.body.scrollHeight);
}
 
function focusInput()
{     
     $('#input').focus();     
}

function inputfunky()
{    
    var promise = new Promise(function (resolve,reject){
        if (inputbuffer)
        {
            if (inputbuffer.length == 0) 
            {
                resolve("");
            }
            else
            {                
                resolve(inputbuffer.shift());
            }
        }
        else
        {        
            //$("span#input").text("");
            $('#input').text("");
            focusInput();
            $("#input").on("keyup",function(e){
                if (e.keyCode == 13)
                {                
                    var result = $("#input").text();
                    result = result.replace(/[\n\r]+/g, ''); // remove trailing return
                    $("#input").text("");
                    $("#input").off("keyup");
                    outf(result+"<br/>");
                    resolve(result);
                }
            });
        }
    });
    return promise;
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function internalRunPython()
{
    var proccount = 0;
    var prog = $("pre#python-code").text();
    Sk.configure({inputfun : inputfunky, output:outf, read:builtinRead, debugging : true });    
    
    // set up hooks for each python cycle
    var handlers = {};
    handlers["Sk.debug"] = function(susp) {
      try {                          
        //outf("Suspended! Now resuming...");
        proccount++;
        lastLineNo = susp.child.lineno;
        if (proccount > pythonmaxcycles)
        {
            // force a DOM redraw on chrome
            //$('pre#python-code').hide().show(0);
            var cont = confirm("Your program seems to be stuck in a loop, or is otherwise really busy! Click OK to continue running or select Cancel to abort. Maybe you have an infinite loop somewhere...");
            if (!cont) throw "Program aborted during possible infinite loop.";
        }
        if (Sk.paulspanner)
        {            
            throw Sk.paulspanner;
        }
        // ugly hack to introduce delays for Javascript async code in mods
        // Sk.paulpause is set by Sk.hold - see top of this file
        else if (Sk.paulpause)
        {
            return new Promise(function(resolve, reject){
                setTimeout(function(){
                    Sk.paulpause = undefined;
                    try
                    {
                        if (Sk.paulspanner)
                        {                            
                            throw Sk.paulspanner;
                        }
                        resolve(susp.resume());
                    }
                    catch (e)
                    { 
                        reject(e);
                    }
                },Sk.paulpause);
            });
        }
        else
        {      
            // Return an already-resolved promise in this case
            return Promise.resolve(susp.resume());
        }
      } catch(e) {
        return Promise.reject(e);
      }
    };

    // run python code
    // reset Carol's move delay, if she's involved.
    if (prog.indexOf("import carol") != -1)
    {
        parent.carol.setDelay(300);
    }
    var myPromise = Sk.misceval.callsimAsync(handlers, function(){
        // handle
        console.log(prog);
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    }).then(function(mod) {
       outf('Program completed without errors.',"green");
       parent.LOGrunSuccess();
       parent.enableRun();
   },
   function(err) {              
       outf(err.toString(),"error");       
       parent.enableRun();
   });
}

// on load, run python
$(document).ready(internalRunPython);