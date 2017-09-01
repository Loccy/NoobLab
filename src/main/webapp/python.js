// setup functions for skulpt
var pythonconsole = "";
var consoleupdatepid;
var hook = false;
var hookcommand = "";
var lastLineNo = -1;
var lastLine = "";
var proglines = [];
var isTest = false;

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

// extend the behaviour of integer division function - enable
// python 3 conventions so that we don't accidentally lose any
// decimal places in our calculations
Sk.builtin.int_.prototype.nb$divide = (function(_super) {
    return function() {
        var oldp3 = Sk.python3;
        Sk.python3 = true;
        var result = _super.apply(this,arguments);
        Sk.python3 = oldp3;
        return result;
    };
})(Sk.builtin.int_.prototype.nb$divide);

// extend Sk...readline
// make input evaluate numbers and not always return
// strings
Sk.builtin.file.prototype.readline.func_code = (function(_super) {
    return function() {        
        var result = _super.apply(this,arguments);
        if (result instanceof Sk.misceval.Suspension)
        {
            result.resume = (function(_innerSuper) {
                return function() {
                    var d = _innerSuper.apply(this,arguments);
                    if (lastLine.match(/\binput\s*\(/g))
                    {
                        if (d.v.match(/^\d+$/)) return new Sk.builtin.int_(parseInt(d.v)); // no decimal point
                        if (d.v.match(/^\d+\.\d+$/)) return new Sk.builtin.float_(parseFloat(d.v)); // decimal point
                    }
                    return d;
                }
            })(result.resume);
        }
        return result;
    };
})(Sk.builtin.file.prototype.readline.func_code);

// LEGACY -- probably easier to understand than the above...
/*Sk.existingReadline = Sk.builtin.file.prototype.readline.func_code;
Sk.builtin.file.prototype.readline = new Sk.builtin.func(function(a, b) { 
    var result = Sk.existingReadline(a,b);
    if (result instanceof Sk.misceval.Suspension)
    {
        // plug in our alternate resume code with number handling
        result.oldresume = result.resume;
        result.resume = function() {
            var d = result.oldresume();
            // if the last line of code run that got us here included input(...
            if (lastLine.match(/\binput\s*\(/g))
            {
                if (d.v.match(/^\d+$/)) return new Sk.builtin.int_(parseInt(d.v)); // no decimal point
                if (d.v.match(/^\d+\.\d+$/)) return new Sk.builtin.float_(parseFloat(d.v)); // decimal point
            }
            return d;
        }
    }
    return result;
}); */

function cls()
{
    $("div#output-py").contents().filter(function(){ return this.nodeType == 3; }).remove();
}

function outf(text,status) {
  setTimeout(function(){
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
        
        if (!isTest)
        {
            parent.editor.addLineClass(errorline-1,"background","error");
        }
        else
        {
            console.log(text);
            text = text.split(":")[1].trim();
            text = "Your program caused an error as NoobLab was testing it. This means it is not a full solution to the exercise! Make sure you have tested your code against all of the possible scenarios of the exercise.<p>The error was: "+text;
        }
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
  },1)
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
            var monitorbreak = setInterval(function(){
                if (Sk.paulspanner)
                {
                    clearInterval(monitorbreak);
                    reject();
                }
            },500);
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
    proglines = prog.split("\n");
    if (prog.indexOf("::istest::") != -1)
    {
        isTest = true;
        prog = prog.replace("::istest::","");
    }
    Sk.configure({inputfun : inputfunky, output:outf, read:builtinRead, debugging : true });    
    
    // set up hooks for each python cycle
    var handlers = {};
    handlers["Sk.debug"] = function(susp) {
      try {                          
        //outf("Suspended! Now resuming...");                
        proccount++;
        lastLineNo = susp.child.lineno;
        lastLine = proglines[lastLineNo-1];
        if (proccount > pythonmaxcycles)
        {          
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
            // put the resolution of the promise to only happen when the current JS stack is cleared...
            // this stops the browser from locking and lets the DOM catch up.
            return new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve(susp.resume());
                    },0);
            });
        }
        /*else
        {      
            // Return an already-resolved promise in this case
            return Promise.resolve(susp.resume());
        }*/
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
        var p = ""
        $.each(prog.split(/\n/g),function(index){
            p += (index+1)+":"+this+"\n";
        });
        console.log(p);
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