function runjava()
{
    var mainsPkgs = [];
    var codeTabs = getTabBundleCode(true)[0];
    $.each(codeTabs,function(i,codeTab){
        var className = getClassName(codeTab);
        if (hasMain(codeTab)) mainsPkgs.push([ className,getPackageName(codeTab)]);
        $("div#code-titlebar div.tab").eq(i).contents().eq(0).replaceWith(className+".java");        
    });
    saveState();
    if (mainsPkgs.length == 0)
    {
        apprise("None of the classes in the editor appear to have a <i>main</i> method. This code cannot be run without one.");
        return;
    }
    if (mainsPkgs.length == 1)
    {
        // easy... can use our one and only
        actuallyDoRunJava(codeTabs,mainsPkgs[0][0],mainsPkgs[0][1]);
        return;
    }
    // otherwise, it's ambiguous
    // so does the currently selected tab have a main?
    var currentCode = editor.getValue();
    if (hasMain(currentCode))
    {
        apprise("You have several main methods across different classes in your project. Do you want to run the main method in "+
            "the class currently selected in the editor (<i>"+getClassName(currentCode)+"</i>)?",
            {verify:true}, function(r)
        {
            actuallyDoRunJava(codeTabs,getClassName(currentCode),getPackageName(currentCode));
            return;
        });
    }
    // otherwise, ambiguous, and you don't have a main selected
    var mainList = "";
    $.each(mainsPkgs,function(i,mainPkg){
        mainList += mainPkg[0]+"<br/>";
    });
    apprise("You have several main methods across different classes in your project:<br/>"+
            mainList+"<br/>"+
            "Select one of these classes in the editor in order to indicate which main method you wish to run."
            );    
}
    
function actuallyDoRunJava(codeFiles,main,mainPkg)
{
    // setup output iframe
    var outputframeWindow = $("#outputframe")[0].contentWindow;
    var outputframeDocument = outputframeWindow.document;
    $("#output-main",outputframeDocument).remove();
    $(outputframeDocument).find("body").append('<code id="output-main" style="word-wrap: break-word"></code>');
    

    disableRun();
    // push code first - this should start off a process on server side.
    $.ajax({
        data : {
            mode : "compilerun",
            code : codeFiles,
            main : main,
            mainPkg : mainPkg
        },
        type : "POST",
        url : contextPath + "/JavaRunner",
        success : function(data) {
            if (data.indexOf("**ERROR**") == -1) 
            {
                javaRuntimeMonitor();
            }
            else
            {                
                var msg = data.split(":");
                msg.shift(); msg.shift();
                var className = msg.shift().split("/").pop();
                var lineno = parseInt(msg.shift());
                var details = data.split(/\.java:\d+:/)[1].replace(/<|>/ig,function(m){
                    return '&'+(m=='>'?'g':'l')+'t;';
                }).replace(/\n/g,"<br/>");
                $("#output-main",outputframeDocument).append('<p style="color: red">Error on line '+lineno+' in class '+className+'<br/>'+
                    details+
                    '<p>');
                editor.focus(); 
                editor.setCursor(parseInt(lineno)-1);
                editor.setLineClass(parseInt(lineno)-1,"error");
            }
        }
    });
}


function javaRuntimeMonitor()
{
    // setup output iframe
    var outputframeWindow = $("#outputframe")[0].contentWindow;
    var outputframeDocument = outputframeWindow.document;    
    
    // now monitor console
    var finished = false;
    while (!finished)
    {
        $.ajax({
            data : {
                mode : "consolemonitor"
            },
            url : contextPath + "/JavaRunner",
            success : function(data) {
                if (data != "noop")
                {
                    $("#output-main",outputframeDocument).append(data);
                    outputframeWindow.scrollTo(0,outputframeDocument.body.scrollHeight);
                }
                $.ajax({
                    data : {
                        mode : "commandmonitor"
                    },
                    url : contextPath + "/JavaRunner",
                    success : function(data) {
                        if (data == "stop")
                        {
                            $("#output-main",outputframeDocument).append('<p style="color: green">Run ended<p>');
                            enableRun();
                            outputframeWindow.scrollTo(0,outputframeDocument.body.scrollHeight);
                            finished = true;
                        }
                    }
                });
            }
        });        
        hold(1000);
    }
}

function hasMain(code)
{
    // is there a main in the currently selected class?
    if (code.match(/static\s*void\s*main\s*\(\s*String/)) return true;
    // otherwise
    return false;
}

function getClassName(code)
{
    try
    {
        return code.match(/class\s*[a-z|A-Z]*/)[0].split(/\s/).pop();
    }
    catch (e) { return undefined; }
}

function getPackageName(code)
{
    try
    {
        return code.match(/package\s*[a-z|A-Z|\.]*/)[0].split(/\s/).pop();
    }
    catch (e) { return undefined; }
}

exports.runjavaserver = function (x) {     
    runjava(x)
};