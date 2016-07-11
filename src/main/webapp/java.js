var javaruntimeerror = false;
var lastExitStatus = 0;
var javaSuccessfulRun = standardJavaSuccessfulRun;
var javaRuntimeError = standardJavaRuntimeError;
var numTestMon;

function getMainsPkgs(codeTabs)
{
    //var codeTabs = getTabBundleCode(true)[0];   
    var mainsPkgs = [];
    $.each(codeTabs,function(i,codeTab){
        var className = getClassName(codeTab);
        if (hasMain(codeTab)) mainsPkgs.push([ className,getPackageName(codeTab)]);        
    });    
    return mainsPkgs;
}

function runjava()
{
    // clear anything left over from tests
    javaSuccessfulRun = standardJavaSuccessfulRun;
    javaRuntimeError = standardJavaRuntimeError;
    if (numTestMon)
    {
        clearInterval(numTestMon);
        numTestMon = undefined;
    }
    
    // reset and show console
    $("div#console pre",outputframe.document).show();
    
    // JQuery console is as glitchy as hell. If at first you don't succeed...
    //$("div#main pre",outputframe.document).text("");
    outputframe.controller.reset();    
    outputframe.controller.reset();    
    outputframe.controller.reset();    
    
    var codeMess = getTabBundleCode();
    if (codeMess.match(/import\s*java.awt/) || codeMess.match(/import\s*javax.swing/))
    {
        apprise("This code tries to use graphical libraries that are not supported in NoobLab."+
                "You cannot run this code in this environment. If this message was unexpected, please speak to your tutor.");
        return;
    }
    
    var codeTabs = getTabBundleCode(true)[0];   

    if ($("div.parameter#multi").text().trim() != "true")
    {   
        var code = codeTabs[0];
        if (!code.match(/\s*class\s*/) && !code.match(/\s*void\s*main/))
        {
            // pigin Java :-) Wrap a class/main around it
            code = "import java.util.Scanner; public class Pigin { public static void main(String[] args) { "+code+"\n} }";
            codeTabs[0] = code;
        }   
    }

    var mainsPkgs = getMainsPkgs(codeTabs);
    if (mainsPkgs.length == 0)
    {
        apprise("None of the classes in the editor appear to have a <i>main</i> method. This code cannot be run without one.");
        return;
    }
    
    $.each(codeTabs,function(i,codeTab){
        $("div#code-titlebar div.tab").eq(i).contents().eq(0).replaceWith(getClassName(codeTab)+".java");        
    });    
    
    saveState();
    if (mainsPkgs.length == 1)
    {
        // easy... can use our one and only
        $("div.status",outputframe.window.document).remove();
        actuallyDoRunJava(codeTabs,mainsPkgs[0]);
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
            if (r)
            {
                $("div.status",outputframe.window.document).remove();
                actuallyDoRunJava(codeTabs,getClassName(currentCode));            
            }
        });
        return;
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

function actuallyDoRunJava(codeFiles,main,actuallyRun)
{
    if (main[1] != undefined)
    {
        main[1] += ".";
    }
    else
    {
        main[1] = "";
    }
    main = main[1]+main[0];
    main = main.replace(/\./g,"/");
    if (actuallyRun == undefined) actuallyRun = true;        
    
    LOGrun(getTabBundleCode());
    
    disableRun();    
    
    // remove any "files" already in Doppio
    //outputframe.doCommand("rm *");
    outputframe.doCommand("clear_cache");

    // The following ugly hack is dedicated to Bob Hambrook.
    // RIP mate. 5th November 2014.

    // inject "code" class for accessing the Java code from the Java code
    // my brain hurts
    // inject Code
    var codeIncludesClass = (function () {/*

package Java;

public class Code
{
  public static String getRaw()
  {
     String stuff = "SARRIESBOB";
     stuff = stuff.replaceAll("CAPTAINCLIMAX",System.getProperty("line.separator")+"***ENDOFCLASS***"+System.getProperty("line.separator"));
     stuff = stuff.replaceAll("FUCKTHEPANTOMINE",System.getProperty("line.separator"));
     stuff = stuff.replaceAll("BASEBALLCAP",""+'"');
     return stuff;
  }

  public static String[] getClasses()
  {
     return getRaw().split(System.getProperty("line.separator")+"...ENDOFCLASS..."+System.getProperty("line.separator"));
  }

}

*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    var bobbifiedCode = getTabBundleCode(true)[0].join("CAPTAINCLIMAX").replace(/\n/g,"FUCKTHEPANTOMINE").replace(/"/g,"BASEBALLCAP").replace(/\r/g,"");
    codeIncludesClass = codeIncludesClass.replace(/SARRIESBOB/,bobbifiedCode);
    codeFiles.push(codeIncludesClass);
    
    var noOfFiles = codeFiles.length;
    var filesBack = 0;
    
    // push code first
    status("Compiling...");
    
    $.ajax({
        data : {
            mode : "compile",
            code : codeFiles
           // main : main,
           // mainPkg : mainPkg
        },
        type : "POST",
        url : contextPath + "/JavaRunner",
        // code successfully pushed... now try and pull it back and push it into
        // the Doppio file system.
        success : function(data) {
            if (data.indexOf("**ERROR**") != -1)
            {
                var msg = data.split(":");
                msg.shift(); msg.shift();
                var className = msg.shift().split("/").pop();
                var lineno = parseInt(msg.shift());
                var details = data.split(/\.java:\d+:/)[1].replace(/<|>/ig,function(m){
                    return '&'+(m=='>'?'g':'l')+'t;';
                }).replace(/\n/g,"<br/>");
                status('Error on line '+lineno+' in class '+className+"<br/>"+details,"error");
                if (className != $("div.tab.selected").text().trim())
                {                    
                    // switch to the right tab for the error
                    $("div.tab").not(".newtab").contents()
                        .filter(function() {
                          return this.nodeType === 3 && $(this).text() == className; //Node.TEXT_NODE
                    }).parent().click();
                    // frell me, JQuery is bloody awesome
                }
                LOGsyntaxError("Error in line "+lineno+" of "+className+", "+details);
                editor.focus(); 
                editor.setCursor(parseInt(lineno)-1);
                editor.setLineClass(parseInt(lineno)-1,"error");
                enableRun();
            }
            else
            {            
                var classes = data.split(":");

                classes.pop(); // remove empty last
                $.each(classes,function(i,clas){

                    $.ajax({
                       data : { classfile : clas },
                       type : "POST",
                       url : contextPath + "/GetClass",
                       success : function(classBin) {                       
                           classBin = $.base64.decode(classBin);
                           var name = clas.replace(/\./g,"/");
                           //clas.split(".").pop();                
                            outputframe.node.fs.writeFileSync(name+".class", classBin,true);
                            filesBack++;                            
                            if (noOfFiles == filesBack && actuallyRun)
                            {
                                status("");
				try
				{
                                   outputframe.doCommand("java "+main);     
				}
				catch (e)
				{
				   status("Untrapped Doppio Error! :-( - usually this happens if you have a null pointer somewhere. The full error is in the browser console.","error");
				}  
                            }
                       }
                    });

                });
            }
      
        }
    });
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
        return code.match(/class\s*[a-z|A-Z|0-9]*/)[0].split(/\s/).pop();
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

function standardJavaSuccessfulRun()
{
    if (javaruntimeerror)
    {
        javaruntimeerror = false;
        return;
    } // otherwise
    LOGrunSuccess();
    status("Execution completed.","success");
    enableRun();
}

function standardJavaRuntimeError(errorText)
{
    if (errorText.indexOf("BREAKBREAKBREAK") != -1)
    {
        errorText = "User aborted execution with the 'stop' button.";
        LOGbreak();
    }
    else
    {    
        errorText = errorText
                        .replace(/\t/g,"  ")
                        .replace("at Pigin.main(Pigin.java from DynamicJavaSourceCodeObject","(while running your NoobLab code")
                        .replace("from DynamicJavaSourceCodeObject","");                        
        LOGerror(errorText);
    }
    status("<pre>"+errorText+"</pre>","error");
    enableRun();
    javaruntimeerror = false;
}

function status(msg,type)
{
    msg = msg.replace("in class Pigin.java","in program");
    if (type == undefined) type = "success";
    $("div#console",outputframe.document).find("div.status").remove();
    if (status == "") return;
    $("div#console",outputframe.document).append('<div class="status '+type+'">'+
                                                msg+"</div>");   
    $("div#main",outputframe.document).scrollTop($("div#main",outputframe.document)[0].scrollHeight);
}

var lasttestlink = 0;
function handleTestCasesJava()
{
    var testHarness = 
'import java.io.ByteArrayOutputStream;\n'+
'import java.io.ByteArrayInputStream;\n'+
'import java.io.PrintStream;\n'+
'import java.io.InputStream;\n'+
'import java.io.IOException;\n'+
'import java.lang.reflect.*;\n'+

'public class NoobLabTester\n'+
'{\n'+
'	static ByteArrayOutputStream baos = new ByteArrayOutputStream();\n'+
'	public static PrintStream oldSysOut = System.out;\n'+
'	public static InputStream oldSysIn = System.in;\n'+
'\n'+
'	public static void main(String[] args) throws IOException\n'+
'	{\n'+
'		int noOfTests = NUMBER_OF_TESTS;\n'+
'		int testsPassed = 0;\n'+
'               CODEINCLUDESOFFSET\n'+
'		/* Hook System.out */				\n'+
'		PrintStream ps = new PrintStream(baos);\n'+
'		System.setOut(ps);\n'+
'		/* test runs here */\n'+
                'NOOBLABTESTRUNSHERE\n'+
'		\n'+
'		/* restore System.out */\n'+
'		System.out.flush();\n'+
'		System.setOut(oldSysOut);\n'+
'		\n'+
'		System.out.println("NOOBLABTESTSTART:"+testsPassed+"/"+noOfTests+":NOOBLABTESTEND");		\n'+
'               MEDALHERE\n'+
'	}\n'+
'	\n'+
'	public static String consoleOutput()\n'+
'	{\n'+
'		return baos.toString();\n'+
'	}\n'+
'       public static String[] consoleOutputAsLines()\n'+
'	{\n'+

'		return consoleOutput().split("\\r\\n?|\\n");\n'+
'	}\n'+
'       public static void feedback(String f)\n'+
'       {\n'+
'               oldSysOut.println("FailTip:"+f);\n'+
'       }\n'+
'	\n'+
'NOOBLABTESTSGOHERE\n'+
'}';

        var singleTestMethod = 'public static boolean testNOOBLABTESTNUMBERHERE() throws IOException'+
'	{'+
'		oldSysOut.println(\"TESTCOUNT\");\n'+
'               String inputValues = "NOOBINPUTVALUES";\n'+
'               ByteArrayInputStream bais = new ByteArrayInputStream(inputValues.trim().getBytes());\n'+
'		/* Hook System.in */				\n'+
'		System.setIn(bais);\n'+
'		\n'+
'		NOOBLABCALLDEFAULTMAINHERE'+
'		NOOBLABSINGLETESTCODEHERE'+
'		/* and restore in */\n'+
'               bais.close();\n'+
'		System.setIn(oldSysIn);\n'+
'		return false;'+
'	}';

        var singleTestRunLine = 'if (testNOOBLABTESTNUMBERHERE()) testsPassed++;';              
    
    $(".testCase").each(function(){    
        
        var codeIncludes = $(this).find(".codeIncludes");
        
        var id = $(this)[0].id;
        if ($(this).find("div.id").length != 0)
        {
            id = $(this).find("div.id").text().trim();
        }
        if (id == undefined) id = "";
        
         // get medal details, if any
        var medal = undefined;
        if ($(this).find("div.medalType").length != 0)
        {
            medal = $(this).find("div.medalType").text().trim();
            if ($(this).find("div.medalDesc").length != 0)
            {
                medal += ":"+$(this).find("div.medalDesc").text().trim()+":"+id;
            }
            else
            {
                medal += ":"+id;
            }
        }         
        if (medal != undefined) $(this).attr("data-medal",medal);
        $(this).attr("data-id",id);
                        
        var test = testHarness;
        test = test.replace("NUMBER_OF_TESTS",$(this).find(".test").length);
        var testRuns = "";
        var testMethods = "";
        
        if (medal)
        {
            test = test.replace("MEDALHERE",'if (testsPassed == noOfTests) System.out.println("NOOBLABMEDALSTART:'+medal+':NOOBLABMEDALEND"); ');
        }
        else
        {
            test = test.replace("MEDALHERE","");
        }        
        
        // build test code        
        $(this).find(".test").each(function(i,individualTest){                        
            var inputValues = "";
            
            var testCode = ($(individualTest).hasClass("code")) ? 
                    $(individualTest).text().trim() : $(individualTest).find(".code").text().trim();
                    
            testCode = js_beautify(testCode);

	    var testRun = singleTestRunLine.replace("NOOBLABTESTNUMBERHERE",i);                       
            
            var testMethod = singleTestMethod.replace("NOOBLABSINGLETESTCODEHERE",testCode).replace("NOOBLABTESTNUMBERHERE",i); 
            
            if (!$(individualTest).hasClass("runmain") && $("div.parameter#multi").text().trim() == "true") testMethod = testMethod.replace("NOOBLABCALLDEFAULTMAINHERE","");
            
            $(individualTest).find(".inputTest").each(function(i,inputValue){
                inputValues += $(inputValue).text().trim()+"\\n";
            });
            
            testMethod = testMethod.replace("NOOBINPUTVALUES",inputValues+"\\nrandom\\nrandom\\nrandom\\nrandom");
            
            testRuns += testRun;
            testMethods += testMethod;            
        });
        
        
        
        test = test.replace("NOOBLABTESTRUNSHERE",testRuns);
        test = test.replace("NOOBLABTESTSGOHERE",testMethods);
        
        var linkText = ">>> Click here to test your code <<<"
        if (medal != undefined)
        {
            linkText = linkText.replace("code","code for a "+medal.split(":")[0]+" medal");
            linkText = linkText.replace("ribbon medal","ribbon");
        }        
        
        $(this).text(linkText);
        $(this).append('<br/><input type="password"/><button>Override</button><button>Hide</button>');
        $(this).find("input").click(function(e){
           e.stopPropagation(); 
        });
        $(this).find("button").eq(0).click(function(e){
            e.stopPropagation();
           var _0xfae9=["\x6D\x65\x65\x70\x34\x30\x37"]; var pw=_0xfae9[0];
            var inp = $(this).parent().find("input").val();
            if (inp == pw)
            {
                LOGtestStart(id,"",true,medal);
                javaSuccessfulTest("1/1", medal);
            } 
        });
        $(this).find("button").eq(1).click(function(e){
            e.stopPropagation();
            $(this).parent().find("button,br,input").hide();
        }).click();        
        
        $(this).css({
            border : "1px solid black",
            background : "white",
            cursor : "hand",
            cursor : "pointer",
            padding : "5px",
            fontWeight : "bold",
            textAlign : "center"
        });
        $(this).click(function(e){   
            
            lasttestlink = this;
                 
            var attempts = $(lasttestlink).attr("data-fails");
            if (isNaN(attempts)) attempts = 0;
            attempts++;
            $(lasttestlink).attr("data-fails",attempts);
            
            // remove any emotional stuff
            $(this).find("div.emotionselection").remove();
            
            // hidden override option
            if (e.shiftKey)
            {
                $(this).find("button,br,input").show();
                return;
            }            

	    if (numTestMon)
            {
                clearInterval(numTestMon);
                numTestMon = undefined;
            }
            
            var testCode = test;
            var numTests = parseInt(testCode.match(/int noOfTests = (.*);/)[1]);
            var codeFiles = getTabBundleCode(true)[0];
            
	    var code = editor.getValue();
 
            // do code includes
            var offset = "";            
           codeIncludes.each(function()
            {     
                var allcode = getTabBundleCode(false);
		var feedback = $(this).attr("data-feedback");
                numTests++;
                var mustInclude = $(this).text().trim();
                var notEqual = "false";
                if (mustInclude.charAt(0) == "!")
                {
                    mustInclude = mustInclude.substring(1);
                    notEqual = "true";
                }
                else if (mustInclude.charAt(0) == "#")
                {
                   mustInclude = mustInclude.substring(1);
                   notEqual = "regex";
                }
                if (notEqual == "true")
                {
                    if (allcode.indexOf(mustInclude) == -1)
                    {
                        offset += "noOfTests++; testsPassed++; oldSysOut.println(\"TESTCOUNT\");";
                    }
                    else
                    {
                        offset += "noOfTests++; System.out.println(\"TESTCOUNT\");";
			if (feedback) offset += 'feedback("'+feedback+'");';
                    }
                }
                else if (notEqual == "false")
                {
                    if (allcode.indexOf(mustInclude) != -1)
                    {
                        offset += "noOfTests++; testsPassed++; oldSysOut.println(\"TESTCOUNT\");";
                    }
                    else
                    {
                        offset += "noOfTests++; System.out.println(\"TESTCOUNT\");";
                    	if (feedback) offset += 'feedback("'+feedback+'");';
		    }
                }
                else if (notEqual == "regex")
                {
                    var mustInclude = new RegExp(mustInclude);
                    if (allcode.search(mustInclude) != -1)
                    {
                        offset += "noOfTests++; testsPassed++; oldSysOut.println(\"TESTCOUNT\");";
                    }
                    else
                    {
                        offset += "noOfTests++; System.out.println(\"TESTCOUNT\");";
                	if (feedback) offset += 'feedback("'+feedback+'");';
		    }
                }
            });
 
            status("Testing... test number 0 of "+numTests,"border");
            
            numTestMon = setInterval(function(){
                try
                {
                    var doneNum = $("div#console",outputframe.document).text().trim().match(/TESTCOUNT/g).length;
                    status("Testing... test number "+doneNum+" of "+numTests,"border");
                } catch (e) {}
            },500);
             
            testCode = testCode.replace("CODEINCLUDESOFFSET",offset);
            
            if ($("div.parameter#multi").text().trim() != "true")
            {   
                if (!code.match(/\s*class\s*/) && !code.match(/\s*void\s*main/))
                {
                    // pigin Java :-) Wrap a class/main around it
                    code = "import java.util.Scanner; public class Pigin { public static void main(String[] args) { "+code+"\n} }";
                    codeFiles[0] = code;
                }   
            }  
            //var classname = getClassName(code);
            //var packig = getPackageName(code); 
	    var mainsPkgs = getMainsPkgs(codeFiles);
            if (mainsPkgs.length == 0)
            {
                apprise("This code can't run. There doesn't appear to be a main method.");
                return;
            }
            if (mainsPkgs.length != 1)
            {
                apprise("This code can't be tested. It appears as if there's more than one main method.");
                return;
            }
            var classname = getMainsPkgs(codeFiles)[0][0];
            var packig = getMainsPkgs(codeFiles)[0][1];           
            if (packig) classname = packig+"."+classname;    
            testCode = testCode.replace(/NOOBLABCALLDEFAULTMAINHERE/g,classname+".main(new String[5]);  ");  
            codeFiles.push(testCode);
	    var testCodeAsLines = testCode.split("\n");
	    var fnar = "";
            try
		{
		 for (var lns = 0; lns < testCodeAsLines.length; lns++)
		 {
    		   fnar += (lns+1+": "+testCodeAsLines[lns])+"\n";
		 }
		} catch (e) {};
		console.log(fnar);
	    // try { console.log(testCode); } catch (e) {}
	    javaSuccessfulRun = javaSuccessfulTest; //standardJavaSuccessfulRun;
            javaRuntimeError = javaRuntimeDuringTest; //standardJavaRuntimeError;
            // hide the console                 
            LOGtestStart(id,getTabBundleCode(),undefined,medal);
            outputframe.controller.reset();
            if (!$(this).hasClass("nohide")) $("div#console pre",outputframe.document).hide();
            actuallyDoRunJava(codeFiles,["NoobLabTester",undefined],true);
        });               
    });    
}

// successful run cycle, rather than test itself being successful
function javaSuccessfulTest(mark,medal)
{
    clearInterval(numTestMon);
    numTestMon = undefined;
    enableRun();    
    // grab the final marks from the console.    
    if (medal== undefined)
    {
        medal = $("div#console",outputframe.document).text().trim().match(/NOOBLABMEDALSTART:(.*?):NOOBLABMEDALEND/);
        if (medal) medal = medal[1];
    }
    if (mark == undefined) 
    {
        mark = $("div#console",outputframe.document).text().trim().match(/NOOBLABTESTSTART:(.*?):NOOBLABTESTEND/);
        mark = (mark) ? mark = mark[1] : "0/1";
    }
    mark = mark.split("/");
    var max = parseInt(mark[1]);
    mark = parseInt(mark[0]);
    
    var msg = "";

    var failtips = $("div#console",outputframe.document).text().trim().match(/FailTip:(.*)/g);
    if (failtips)
    {
       $.each(failtips,function(){
          msg+='<p style="margin-top: 0px; color: black;">Feedback: '+this.replace("FailTip:","")+"</p>";
       });
    }

    var type = "error border";
    
    if (mark == max)
    {
       msg += "Well done! Your work successfully passed all the tests for this exercise!";
       type = "success border"; 
       LOGtestPassed(medal);
    }
    else
    {
        msg += "Sorry! Your work only passed "+mark+" out of "+max+" tests, and is not a correct solution to the "+
              "exercise.";
        LOGtestFailed(mark+"/"+max);
        
        /*
        var attempts = $(lasttestlink).attr("data-fails");
        if (isNaN(attempts)) attempts = 0;
        attempts++;
        $(lasttestlink).attr("data-fails",attempts);
            
        if (attempts == 5)
        {
            $(lasttestlink).attr("data-fails","0");
                howDoYouFeelAbout(lasttestlink,"You've been unsuccessful at this activity five in times in a row now...","repeatedFail");
        }
       */
        
    }
    
    if (medal)
    {
     var medalData = medal.split(":");
     var medalName = medalData[1];
     var medalTypeOnly = medalData[0];
     var medalType = (medalData[0] == "ribbon") ? medalTypeOnly : medalTypeOnly+" medal";
     msg += '<p style="text-align: center"><img src="../images/medal'+medalTypeOnly+'.png"/></p>Passing this test awards you a '+medalType+' for the "'+medalName+'" challenge!';
     LOGmedal(medal);
     howDoYouFeelAbout(lasttestlink,"Well done! Your code was good enough for a medal!",medalType);
    }
    
    status(msg,type);    
    
}

function javaRuntimeDuringTest(error)
{
    javaruntimeerror = false;
    enableRun();
    clearInterval(numTestMon);/*
    error = error
                        .replace(/\t/g,"  ")
                        .replace("at Pigin.main(Pigin.java from DynamicJavaSourceCodeObject","(while running your NoobLab code")
                        .replace("from DynamicJavaSourceCodeObject",""); */
    var msg = "Sorry! Your code threw a runtime error during the test (or you pressed 'Stop'). If this is an error, it might be because it has a runtime error somewhere in it,"
        msg+= " or it might just be doing something entirely unexpected with respect to the exercise at hand. Either way, it is not a correct solution to the exercise.";
        status (msg,"error border");
    LOGtestFailed("RuntimeError:"+error,"error border");
    javaRuntimeError = standardJavaRuntimeError;
}
