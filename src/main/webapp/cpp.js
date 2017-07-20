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
            filenames : filenames,
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
			//console.log(err);
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
        data = data.replace(/Uncaught Error:/g,"");
        if (colour == "red") // errr-oooorrrrr (points at screen)
        {            
            try
            {
                var filename = data.match(/in&nbsp;(.+?)&nbsp;at&nbsp;/)[1];                
                var lineno = data.match(/at&nbsp;line&nbsp;([0-9]+),/)[1];
                var colno = data.match(/column&nbsp;([0-9]+):/)[1];
                filename = filename.replace(/&nbsp;/g," ");                
                // select offending editor tab
                var targetTab = $("div.tab").filter(function() {
                    return $(this).clone().children().remove().end().text().trim() === filename.trim();
                });
                
                if (!$(targetTab).hasClass("selected")) selectEditorTab($(targetTab));                
                highlightLine(parseInt(lineno-1));
            }
            catch (e)
            {}              
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
     $("body",outputframe.document).append('<div id="cin" contenteditable style="display: inline-block; min-width: 1em; outline: 0px solid transparent"></div>');
     $("body",outputframe.document).find("div#cin").focus();
     $("body",outputframe.document).click(function(){ $("body",outputframe.document).find("div#cin").focus() });
     $("body",outputframe.document).find("div#cin").keyup(function(key){
         if (key.which == 13)
         {
             var newstdin = $("body",outputframe.document).find("div#cin").text();             
             $.ajax({
                type: "POST",
                url: contextPath+"/CPPConsole",
                data : { line : newstdin, mode : "add" },
                async: false
            }); 
             if (cppworker != undefined) cppworker.postMessage({action : "updateStdin",params : newstdin });
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
             $("body",outputframe.document).find("div#cin").text("");
         }
     });
}