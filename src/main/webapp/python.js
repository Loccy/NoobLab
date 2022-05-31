// setup functions for skulpt
var pythonconsole = "";
var consoleupdatepid;
var hook = false;
var hookcommand = "";
var lastLineNo = -1;
var lastLine = "";
var proglines = [];
var isTest = false;

$.ajaxSetup({
    async: false
    });

// Why, in the name of Satan's testicles, would Skulpt remove the
// external library functionality?!
$.get("pythontest_module.js",function(done){    
    Sk.builtinFiles.files["src/lib/noobtest/__init__.js"] = done;
})

$.get("carol_py.js",function(done){    
    Sk.builtinFiles.files["src/lib/carol/__init__.js"] = done;
})

$.get("canvas_module.js",function(done){
    Sk.builtinFiles.files["src/lib/noobgraphics/__init__.js"] = done;
})

// ugly hack to accommodate hashlib/sha256
Sk.builtinFiles.files["src/lib/hashlib/__init__.js"] = 'var $builtinmodule = function(name)  {    var mod = {};   mod.sha256 = new Sk.builtin.func(function(str){      return Sk.builtin.str("sha256:"+str.v);       });    return mod;  }';
Sk.builtin.str.prototype.encode = new Sk.builtin.func(function(self) {    
    return new Sk.builtin.str(self.v);
});
Sk.builtin.str.prototype.hexdigest = new Sk.builtin.func(function(self) {    
    var str = self.v;
    if (str.length <7 || str.slice(0,7) != "sha256:") throw "'str' object has no attribute 'hexdigest'";        
    return new Sk.builtin.str(_SHA256(str.slice(7)));
});
function _SHA256(s){var chrsz=8;var hexcase=0;function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF)}function S(X,n){return(X>>>n)|(X<<(32-n))}function R(X,n){return(X>>>n)}function Ch(x,y,z){return((x&y)^((~x)&z))}function Maj(x,y,z){return((x&y)^(x&z)^(y&z))}function Sigma0256(x){return(S(x,2)^S(x,13)^S(x,22))}function Sigma1256(x){return(S(x,6)^S(x,11)^S(x,25))}function Gamma0256(x){return(S(x,7)^S(x,18)^R(x,3))}function Gamma1256(x){return(S(x,17)^S(x,19)^R(x,10))}function core_sha256(m,l){var K=[0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2];var HASH=[0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19];var W=[64];var a,b,c,d,e,f,g,h,i,j;var T1,T2;m[l>>5]|=0x80<<(24-l%32);m[((l+64>>9)<<4)+15]=l;for(var i=0;i<m.length;i+=16){a=HASH[0];b=HASH[1];c=HASH[2];d=HASH[3];e=HASH[4];f=HASH[5];g=HASH[6];h=HASH[7];for(var j=0;j<64;j+=1){if(j<16){W[j]=m[j+i]}else{W[j]=safe_add(safe_add(safe_add(Gamma1256(W[j-2]),W[j-7]),Gamma0256(W[j-15])),W[j-16])}T1=safe_add(safe_add(safe_add(safe_add(h,Sigma1256(e)),Ch(e,f,g)),K[j]),W[j]);T2=safe_add(Sigma0256(a),Maj(a,b,c));h=g;g=f;f=e;e=safe_add(d,T1);d=c;c=b;b=a;a=safe_add(T1,T2)}HASH[0]=safe_add(a,HASH[0]);HASH[1]=safe_add(b,HASH[1]);HASH[2]=safe_add(c,HASH[2]);HASH[3]=safe_add(d,HASH[3]);HASH[4]=safe_add(e,HASH[4]);HASH[5]=safe_add(f,HASH[5]);HASH[6]=safe_add(g,HASH[6]);HASH[7]=safe_add(h,HASH[7])}return HASH}function str2binb(str){var bin=Array();var mask=(1<<chrsz)-1;for(var i=0;i<str.length*chrsz;i+=chrsz){bin[i>>5]|=(str.charCodeAt(i/chrsz)&mask)<<(24-i%32)}return bin}function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n+=1){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}return utftext}function binb2hex(binarray){var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var str="";for(var i=0;i<binarray.length*4;i+=1){str+=hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8+4))&0xF)+hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8))&0xF)}return str}s=Utf8Encode(s);return binb2hex(core_sha256(str2binb(s),s.length*chrsz))}

$.ajaxSetup({
    async: true
    });

/* Sk.externalLibraries = {
            carol : {
                path: 'carol_py.js'                
            },
            noobtest : {
                path: 'pythontest_module.js'
            }
        }; */
        
// Sk.hold(x) where x is the the number of millis to hold        
// ugly hack used by async Javascript functions
Sk.hold = function(waittime) {
    Sk.paulpause = waittime;
};        

// Sk.halt(msg), throws an error with msg
Sk.halt = function(msg) {
    Sk.paulspanner = msg;    
}

// Sk.python3 = true;

// extend the behaviour of integer division function - enable
// python 3 conventions so that we don't accidentally lose any
// decimal places in our calculations
// (not sure we need this any more given the above line, but there
// you go...)
/*Sk.builtin.int_.prototype.nb$divide = (function(_super) {
    return function() {
        var oldp3 = Sk.python3;
        Sk.python3 = true;
        var result = _super.apply(this,arguments);
        Sk.python3 = oldp3;
        return result;
    };
})(Sk.builtin.int_.prototype.nb$divide); */

// extend Sk...readline
// make input evaluate numbers and not always return
// strings

if (parent.$("div.parameter#noinputfix").text().trim() != "true")
{    
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
                            if (d.v.trim().match(/^(-{1})?\d+$/)) return new Sk.builtin.int_(parseInt(d.v.trim())); // no decimal point
                            if (d.v.trim().match(/^(-{1})?\d+\.\d+$/)) return new Sk.builtin.float_(parseFloat(d.v.trim())); // decimal point
                        }
                        return d;
                    }
                })(result.resume);
            }
            return result;
        };
    })(Sk.builtin.file.prototype.readline.func_code);
}

parent.Sk = Sk;

Sk.builtin.file.prototype.write.func_code = (function(_super) {
    return function() {
        var filename = arguments[0].name;
        if (filename != "/dev/stdout")
        {
            console.log("NON-STDOUT WRITE DETECTED:");
            console.log(arguments[0]);
            console.log(arguments[1]);
            var existing = parent.localStorage.getItem("nl-"+filename);
            parent.localStorage.setItem("nl-"+filename,existing+arguments[1].v);
        }
        var result = _super.apply(this,arguments);
        return result;
    } 
})(Sk.builtin.file.prototype.write.func_code)

document._getElementById = document.getElementById;
document.getElementById = function(id)
{
    var result = document._getElementById(id);
    if (result == null)
    {
        // try to pull from file system
        console.log("Trying to pull file");
        var pseudofile = getVirtualPyFile(id);
        console.log(pseudofile);
        if (pseudofile || pseudofile === "")
        {
            var fakeDom = {
                "nodeName" : "textarea",
                "value" : pseudofile
            }
            console.log(fakeDom);
            return fakeDom;
        }
    }
    return result;
}

function getVirtualPyFile(filename)
{
    return parent.localStorage.getItem("nl-"+filename);
    //return "This is my virtual file\nThere are many in the world like it but this one is mine.";
}

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
    $("div#output-py span.input").remove();
}

function outf(text,status) {
  text = text.replace(/[^\x00-\x7F]{2}/g, "&pound;");
  Sk.hold(5); // introduce a brief delay otherwise print statements can arrive out of sequence under certain circumstances...
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
            if (text == "Ran out of input")
            {
                text = "Your program caused an error as NoobLab was testing it. It is likely that you have a loop in your program that does not end when it is supposed to. Make sure you have tested your code against all the possible scenarios of the exercise.";
            }
            else text = "Your program caused an error as NoobLab was testing it. This means it is not a full solution to the exercise! Make sure you have tested your code against all of the possible scenarios of the exercise.<p>The error was: "+text;
        }
    }
    if (status && status != "input")
    {
        text = '<br/><span style="color: '+status+'">'+text+"</span>";
        $("div#output-py").append(text);
    }
    else
    {
        if (status == "input") text = '<span class="input">'+text+'</span>'+"\n";
        $("div#output-py span#input").before(text);
    }
    //mypre.innerHTML = mypre.innerHTML + text;
    window.scrollTo(0,document.body.scrollHeight);
  },1)
}
 
function focusInput()
{    
    setTimeout(function() { $('#input').focus(); },50);
}

function inputfunky()
{    
    var promise = new Promise(function (resolve,reject){
        if (inputbuffer)
        {
            if (inputbuffer.length == 0) 
            {
                Sk.paulspanner = "Ran out of input";                
                resolve("");
            }
            else
            {
                var result = inputbuffer.shift();
                outf(result,"input");
                resolve(result);
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
                    outf(result,"input");
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

function pythonShims(prog)
{
    // shim to accommodate Python 3 conventions for calling a superclass constructor
    // Apparently there is an update to Skulpt that handles this properly, but this should
    // be in the current build we're using, and it doesn't seem to be...    
    prog = prog.replace(/super\(\)/g,"super(self.__class__,self)");
    
    return prog;
}

function internalRunPython()
{
    var proccount = 0;
    var prog = $("pre#python-code").text();
    
    // apply Skulpt-specific shims
    prog = pythonShims(prog);
    
    proglines = prog.split("\n");
    if (prog.indexOf("::istest::") != -1)
    {
        isTest = true;
        prog = prog.replace("::istest::","");
    }
    Sk.configure({inputfun : inputfunky, output:outf, read:builtinRead, debugging : true, __future__ : Sk.python3 });    
    
    // set up hooks for each python cycle
    var handlers = {};
    handlers["Sk.debug"] = function(susp) {
      try {                          
        //outf("Suspended! Now resuming...");                
        proccount++;        
        lastLineNo = susp.child.lineno || susp.child.$lineno; // Satan's testicles once again rear their dangly selves
        lastLine = proglines[lastLineNo-1];         
        if (proccount > pythonmaxcycles)
        {          
            if (!pythonautokill) var cont = confirm("Your program seems to be stuck in a loop, or is otherwise really busy! Click OK to continue running or select Cancel to abort. Maybe you have an infinite loop somewhere...");
            if (pythonautokill || !cont) throw "Program aborted during possible infinite loop.";
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
                    try
                    {
                        resolve(susp.resume());
                    }
                    catch (e)
                    {
                        reject(e);
                    }
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
    
    if (prog.indexOf("#maxcycles") != -1)
    {
        pythonmaxcycles = parseInt(prog.match(/#maxcycles=([0-9]+)/)[1]);
    }
    
    pythonautokill = prog.indexOf("#autokill") != -1;

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