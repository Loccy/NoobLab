// A sizable chunk of the code for the C++ subsystem was either taken from
// or inspired by Javi Agenjo's webc project on Github. I also learned a
// shitton about web workers from his project. Many thanks.
// 
// https://github.com/jagenjo/webc

var oldconsolelog = console.log;
var oldprompt = window.prompt;
var cppworker;
var cppcompiling = false;

function runCPP(codes)
{
    disableRun();
    coutclear();
    cout("Compiling...","green");
    cppcompiling = true;
    
    var filenames = codes[1];
    var codeFiles = codes[0];
    
    $.ajax({
        data : {
            code : codeFiles,
            mode : "submitCode",
            
           // main : main,
           // mainPkg : mainPkg
        },
        type : "POST",
        url : contextPath + "/CPPRunner",
        success : function(data) {
            if (cppcompiling == false) return; // if they hit "STOP"
            cppcompiling = false;
            if (data.indexOf("***ERROR***") == -1) // yay!
            {
                if (cppworker != undefined)
                {
                    cppworker.terminate();
                }                
                cppworker = new Worker(contextPath+"/CPPRunner");
                //coutclear();
                cppworker.onerror = function(err) { 
			//cout("Error in code","red"); 
			cout("\n"+err.message,"red"); 
			console.log(err);
                        enableRun();
		}

		cppworker.addEventListener("message", function(e){
			if(!e.data) return;
			var data = e.data;
                        
			//allow to call exported instances
			if(data.action == "eval")
			{
                            if (data.instance == "console" && data.method == "log")
                            {
                                console.log(data.params);
                            }
                            if (data.instance == "console" && data.method == "error")
                            {
                                console.error(data.params);
                            }
			}
                        else if (data.action == "cout")
                        {
                            cout(data.params);
                        }
                        else if (data.action == "coutclear")
                        {
                            coutclear();
                        }
                        else if (data.action == "ready")
                        {
                            // call main
                            this.postMessage({action : "callMain", urlcontext : contextPath });
                        }
                        else if (data.action == "updateStdin")
                        {
                            cppstdin = data.params;                            
                        }
                        else if (data.action == "end")
                        {
                            cppworker.terminate();
                            cppworker = undefined;
                            cout("\nProgram completed with no errors.","green");
                            enableRun();
                        }
                        
                        
		});
            }
            else
            {
                alert(data);
            }
        }
    });
}

function cout(data,colour) 
{
        data = data.replace(/\n/g,"<br/>");        
        if (colour == "red") // errr-oooorrrrr (points at screen)
        {
            alert("errorr");
            // extract tab index
            var filename = data.match(/[0-9]\.cpp/)[0];
            var tabNo = filename.replace(/\.cpp/,"");
            data = data.replace(filename,"");
            data = data.replace(/error:&nbsp;/,"");
            data = data.replace(/Uncaught Error:/,"");
            var location  = data.match(/:[0-9]*:[0-9]*:/g)[0].split(/:/g);
            var lineno = location[1];
            var colno = location[3];
            // select offending editor tab
            if (!($("div.tab").eq(tabNo-1).hasClass("selected"))) selectEditorTab($("div.tab").eq(tabNo-1));
            // highlight offending line
            alert(lineno);
            highlightLine(parseInt(lineno));
        }
    
        var lastspan = $("body",outputframe.document).find("span").last();        
        if ((lastspan.hasClass("hascolour") && colour == undefined) || (lastspan.html().length > 2000))
        {
            lastspan = $("<span></span>");
            $("body",outputframe.document).find("div#cin").before(lastspan);
        }
        if (colour != undefined)
        {
            data = '<span class="hascolour" style="color: '+colour+'">'+data+'</span>';
            $("body",outputframe.document).find("div#cin").before(data);
        }
        else
        {            
            spanhtml = lastspan.html();
            spanhtml += data;
            lastspan.html(spanhtml);
        }                
        outputframe.window.scrollTo(0,outputframe.document.body.scrollHeight);
}

function coutclear()
{
     $("body",outputframe.document).empty();
     $("body",outputframe.document).css("font-family","monospace");
     $("body",outputframe.document).css("word-break","normal");
     $("body",outputframe.document).append("<span></span>");
     $("body",outputframe.document).append('<div id="cin"><input style="width: 100%; background-color: transparent; border: 0px; font-family: monospace; outline : none;"/></div>');
     $("body",outputframe.document).find("div#cin input").focus();
     $("body",outputframe.document).find("div#cin input").keydown(function(key){
         if (key.which == 13)
         {
             var newstdin = $("body",outputframe.document).find("div#cin input").val();
             $.ajax({
                type: "POST",
                url: contextPath+"/CPPConsole",
                data : { line : newstdin, mode : "add" },
                async: false
            });
             /*cppstdin += newstdin;
             if (cppworker != undefined) cppworker.postMessage({action : "updateStdin",params : cppstdin });*/
             /*var request = indexedDB.open('cppconsole');
             request.onsuccess = function(e)
             {
                var idb = e.target.result;
                var trans = idb.transaction('cpplines', IDBTransaction.READ_WRITE);
                var store = trans.objectStore('cpplines');

                // add
                var requestAdd = store.add({cppline: newstdin});
                idb.close();
             } */
             cout(newstdin+"\n");
             $("body",outputframe.document).find("div#cin input").val("");
         }
     });
}