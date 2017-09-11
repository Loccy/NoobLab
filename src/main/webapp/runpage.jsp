<%-- 
    Document   : runpage
    Created on : May 14, 2011, 1:59:49 PM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<%-- Much of this page was written before I learnt JQuery - hence the old school
approach to DOM manipulation. --%>

<html>
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
        <meta http-equiv="Content-Type" content="text/html"/>
        <script type="text/javascript" src="oni-apollo.js"></script>
        <script src="${pageContext.request.contextPath}/jq.js"></script>
        <script src="${pageContext.request.contextPath}/innerxhtml.js"></script>
        <script type="text/javascript">
        // de-crap IE
        String.prototype.trim = function() {return $.trim(this)} 
        
        $(document).ready(function()
        {
            $(document).bind("contextmenu",function(e){
                return false;
            });
        });
        
        </script>
        <title>Output</title>
        <style type="text/css">
            body { font-family: monospace;}
            input {
                font-family: monospace; font-size: inherit;
                font-weight: bolder;
            }
        </style>
    </head>
    <body>
        <div id="output-main">
            <%-- Javascript failed server-side parsing --%>
            <c:if test="${error != null}">
                <span style="color:red; font-weight: bolder">
                    Error detected: ${error}
                </span>
                <script type="text/javascript">
                    parent.editor.focus(); parent.editor.setCursor(${linenumber-1}); parent.editor.addLineClass(${linenumber},"background","error");
                    
                    if (parent.$("div.parameter#blockly").text().trim() == "true")
                    {
                        parent.$("#code-blockly").contents().find(".blocklyToolboxDiv").find("#bcp"+linenumber).addClass("error");
                    }
                    
                    parent.LOGsyntaxError("${error}");
                    parent.enableRun();
                    parent.editor.refresh();                                                            
                </script>
            </c:if>

        </div>
        <script type="text/sjs">
            var carol = require("${pageContext.request.contextPath}/carol");            

            var halt = false; var haltmessage = undefined;
            var runCycle = false; var fb = "";

            <c:if test="${error == null}">
            function runCode()
            {
                runCycle = true;
                try
                {
                   ${filteredcode}
                   var objDiv = document.getElementById("output-main");
                   if ($(objDiv).find(".testfail, .testpass").length == 0)
                   {
                       var htmlToAdd = objDiv.innerHTML+
                        '<span style="color: green; font-weight: bolder">'+
                        "<br/>Program successfully completed its initial run.<br/></span>";
                        objDiv.innerHTML = htmlToAdd;
                        parent.LOGrunSuccess();
                   }
                   window.scrollTo(0,document.body.scrollHeight);
                   parent.enableRun();
                }
                catch (error) { runCycle = false; logError(error); }
            }
            runCode();
            // refresh code view if needed
            if (parent.visibleFakeDoc != undefined)
            {
                var nearestSourceTab = $(parent.visibleFakeDocWrapper).find("span.source");
                if ($(nearestSourceTab).hasClass("selected"))
                {
                    // TODO: I have no idea why this isn't working on Chrome.
                    // It even works on IE!
                    $(nearestSourceTab).trigger("click");
                }
            }
            </c:if>

			function feedback(newFb) 
			{ 
				fb += '<p style="margin-top: 0px">'+newFb+"</p>" 
			}

            function print(printString)
            {
		if (typeof printString == "function")  
                {
			stopRun("Incorrect syntax for calling a function");
			return;
		}
		var objDiv = document.getElementById("output-main");
                var txtNode = document.createTextNode(printString);
                objDiv.appendChild(txtNode);
                window.scrollTo(0,document.body.scrollHeight);
            }

            function println(printString)
            {
                print(printString);
                var objDiv = document.getElementById("output-main");
                var brNode = document.createElement("br");
                objDiv.appendChild(brNode);
                window.scrollTo(0,document.body.scrollHeight);
            }

            function cls()
            {
                document.getElementById("output-main").innerHTML = "";
            }

            function input(promptString)
            {
                if (promptString == undefined) promptString = "";
                var objectDiv = document.getElementById("output-main");
                var input = document.createElement("input");
                var txtNode = document.createTextNode(promptString+" ");
                input.id = "inputbox";
                input.size = "1";

                objectDiv.appendChild(txtNode);
                objectDiv.appendChild(input);
                input.focus();

                var dom = require("dom");
                dom.waitforEvent("inputbox","keydown",waitForReturn);
                var inputVal = document.getElementById("inputbox").value;
                objectDiv.removeChild(input);
                txtNode = document.createTextNode(inputVal);
                objectDiv.appendChild(txtNode);
                var br = document.createElement("br");
                objectDiv.appendChild(br);
                parent.LOGrunInput(inputVal);
                if (!isNaN(inputVal)) return parseInt(inputVal);
                return inputVal;
            }
            
            function fakeInput(promptString)
            {                
                var input = INPUTARRAY[INPUTNO];
                // println(promptString+" "+input);
                INPUTNO++;
		if (!isNaN(input)) return parseInt(input);
                return input;
            }
            
            function greatSuccess(medal)
            {
                var objDiv = document.getElementById("output-main");
                
                var htmlToAdd = objDiv.innerHTML+
                        '<div class="testpass" style="border: 2px solid black; padding: 5px; background: white; color: green; font-weight: bolder; margin-top: 1em;">'+
                        fb+
                        "Well done! Your program passed the test! Congratulations!</div>";
                   if (medal)
                   {
                    medalData = medal.split(":");
                    medalName = medalData[1];
                    medalTypeOnly = medalData[0];
                    medalType = (medalData[0] == "ribbon") ? medalTypeOnly : medalTypeOnly+" medal";
                   }
                   if (medal)
                   {
                        //parent.$("#output-outer").css("height","220px");
                    	//parent.$("#editor-wrapper").css("bottom","220px");
                    	//parent.$("#editor-wrapper").css("height","220px");
                    	parent.resize();
                    htmlToAdd = htmlToAdd.replace('</div>','<p style="text-align: center"><img src="images/medal'+medalTypeOnly+'.png"/></p>Passing this test awards you a '+medalType+' for the "'+medalName+'" challenge!</div>');
                   }
                   objDiv.innerHTML = htmlToAdd;
                   parent.LOGtestPassed(medal);
                   if (medal) parent.howDoYouFeelAbout(parent.lasttestlink,"Well done! Your code was good enough for a medal!",medalType);
                   if (medal) parent.LOGmedal(medal);
                   window.scrollTo(0,document.body.scrollHeight);
            }
            
            function epicFail()
            {
            	if (fb.trim() != "")
            	{
	        //    	parent.$("#output-outer").css("height","");
                //    parent.$("#editor-wrapper").css("bottom","");
                //    parent.$("#editor-wrapper").css("height","");
                    parent.resize();
            	}
                var objDiv = document.getElementById("output-main");
                var htmlToAdd = objDiv.innerHTML+
                        '<div class="testfail" style="border: 2px solid black; padding: 5px; background: white; color: red; font-weight: bolder; margin-top: 1em;">'+
                        fb+
                        "Sorry! Your program did not produce the expected output! It passed "+SUCCESSFULTESTS+" out of "+NUMBEROFTESTS+" test(s). Check your work and try again!</div>";
                   objDiv.innerHTML = htmlToAdd;
		   var testFailedDetails = SUCCESSFULTESTS+"/"+NUMBEROFTESTS;
		   if (errorsDuringTest.length != 0) testFailedDetails += " (runtime error(s): "+errorsDuringTest.join("/")+")";
                   parent.LOGtestFailed(testFailedDetails);
                   
                   /*
                   var attempts = $(parent.lasttestlink).attr("data-fails");
                   
                    if (isNaN(attempts)) attempts = 0;
                    attempts++;
                    $(parent.lasttestlink).attr("data-fails",attempts);

                    if (attempts == 5)
                    {
                        $(parent.lasttestlink).attr("data-fails","attempts","0");
                            parent.howDoYouFeelAbout(parent.lasttestlink,"You've been unsuccessful at this activity five in times in a row now...","repeatedFail");
                    }
                    
                    */
                   window.scrollTo(0,document.body.scrollHeight);
            }

            function waitForReturn(event)
            {
                var currentText = document.getElementById("inputbox").value;
                document.getElementById("inputbox").size = currentText.length + 1;
                if (event.keyCode == 13)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            function logError(error)
            {
                var objDiv = document.getElementById("output-main");
                var message = ""+error.message;
		if (haltmessage)
                {
                        message = haltmessage;
                        haltmessage = undefined;
                }
                if (message.trim() == "") message = "E:"+error;
                 var errorLine = error.lineNumber;
                 if (isNaN(errorLine)) errorLine = 0;
                 errorLine -= 12;
                 if (navigator.userAgent.indexOf("MSIE") != -1)
                 {
                    var x = message.split(' (in');
                    message = x[0];
                 }
		 message = message.replace(/infinite_loopxyzabc is not defined/,"You have created an infinite loop (have you forgotten to add a condition to a repeat/until block?)");
                message = message.replace(/waste_of_timexyzabc is not defined/,"You have a while block without a condition.");
		message = message.replace(/waste_of_if_timexyzabc is not defined/,"You have an if block without a condition."); 
		// Detect states that get thrown as errors but are considered a valid run
                 if (message.indexOf("NOTERROR") != -1)
                 {
                    message = message.replace("NOTERROR","");
                    var errorLineText = ".";
                    if (errorLine > 0) errorLineText = " at or around line "+errorLine;
                    var htmlToAdd = objDiv.innerHTML+
                        '<span style="color: green; font-weight: bolder">'+
                        "<br/>Program run has been stopped"+errorLineText+"<br/>"+message+"</span>";
                        objDiv.innerHTML = htmlToAdd;
                        if (errorLine > 0)
                        {
                            parent.editor.focus(); 
                            parent.editor.setCursor(errorLine-1);
                            //parent.editor.setLineClass(errorLine-1,"error");                            
                            parent.editor.addLineClass(errorLine-1,"background","error");                            
                            if (parent.$("div.parameter#blockly").text().trim() == "true")
                            {
                                console.log(parent.$("#code-blockly").contents().text()); //find(".blocklyToolboxDiv").find("#bcp"+errorLine-1).text());                                
                                parent.$("#code-blockly").contents().find(".blocklyToolboxDiv").find("#bcp"+(errorLine-1)).addClass("error");
                            }
                        }
                        parent.LOGrunSuccess();
                 }
                 else
                 {
                     var errorText = "Error detected during event: "+message;
                     if (!runCycle) errorText = errorText.replace("event","initial run");
                     if (errorLine > parent.editor.lineCount())
                     {
                        errorText += "<br/>&nbsp;</br/>If you were running a test, run your program normally to determine where the error might be.";
                        errorLine = 0;
                     }
                     else if (errorLine > 0) errorText += "<br/>Error at or around line number "+errorLine;
                     var htmlToAdd = objDiv.innerHTML+
                        '<span style="color: red; font-weight: bolder">'+errorText+"<br/></span>";

                     objDiv.innerHTML = htmlToAdd;
                     
                     if (errorLine <= 0)
                     {
                        // can we manage to figure out errorLine from the message text?
                        var ematch = message.match(/at line (\d*)/);
                        if (ematch)
                        {
                            errorLine = parseInt(ematch[1]);
                        }
                     }

                     if (errorLine > 0) {
                            parent.editor.focus(); 
                            parent.editor.setCursor(errorLine-1);
                            //parent.editor.setLineClass(errorLine-1,"error");
                            parent.editor.addLineClass(errorLine-1,"background","error");
                            if (parent.$("div.parameter#blockly").text().trim() == "true")
                            {                                
                                parent.$("#code-blockly").contents().find(".blocklyToolboxDiv").find("#bcp"+(errorLine-1)).addClass("error");
                            }
                        }
                     parent.LOGerror(errorText);
                 }
                 parent.enableRun();
                 parent.editor.refresh();

            }

            function stopRun(haltmsg)
            {
                halt = true;
		haltmessage = haltmsg;
            }            
            
            function currentOutputArray()
            {
                return $("div#output-main").textNodes();
            }
            
            function currentOutput()
            {
                var result = "";
                $.each($("div#output-main").textNodes(),function(){
                    result = result + this+"\n";
                });
                return result;
            }
        </script>
        <script type="text/javascript">
            $("body").css("font-size",parent.editorfontsize+"px")        
        </script>
    </body>
</html>
