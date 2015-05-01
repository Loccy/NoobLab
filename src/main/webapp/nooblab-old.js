var lasttestlink = 0;

///// de-crap IE
String.prototype.trim = function() {
    return $.trim(this)
}

var editor;
var visibleFakeDoc;
var visibleFakeDocWrapper;

var lastBasicVariables;

//variables to confirm window height and width
var lastWindowHeight = $(window).height();
var lastWindowWidth = $(window).width();

// save state code
var lastSaveStateCode = "";
var lastSaveStateSectionNo = 0;

// medal object
var medals = {};

// last scroll pos
lastScroll = 0;

// last 20ish lines of the log file
lastLogEntries = [];

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function(c) {
    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
}

function getCode(e)
{
        var realElement = $(e)[0];
	var x;
        if (realElement.innerText)
        {
                x = realElement.innerText;
        }
        else
        {
                x = $(e).clone().text();
        }
	x = x.replace(/\xa0/g," ");
	return x;
}

function codePaste(e)
{
    apprise("Pasting this code into the editor will overwrite any existing code. Are you sure?",{verify:true},function(r){
        if (r)
        {
            var actualCode = getCode(e);
            editor.setValue(actualCode);
            LOGcodePaste(actualCode);
            lastcode = actualCode; // levenshtein index code
        }
    });
}

function resizeFakeDocs()
{
    $("iframe.fakedoc").each(function(){
        resizeIframe($(this)[0]);
    });
}

function resizeIframe(iframe)
{
    $(iframe).height(1);
    var height = $(iframe.contentWindow.document).height();
    $(iframe).css("height",height+"px");
}

function getCarolDiv()
{
    // if none in current section
    if ($("div.carol:visible").length == 0) return undefined;

    // get Carols that are visible and in viewport
    var foundCarol = $("div.carol:visible:in-viewport");

    // if no in-viewport Carols, return...
    if (foundCarol.length == 0) return undefined; // ..the first one.

    // if only found one, awesome. Return it
    if (foundCarol.length == 1) return foundCarol.eq(0);


    // otherwise, determine which has the most on screen
    var viewportHeight = $(window).height();
    var documentScrollTop = $(document).scrollTop();
    var minTop = documentScrollTop;
    var maxTop = documentScrollTop + viewportHeight;

    // otherwise...
    var biggestCarol = foundCarol.eq(0);
    var maxAmount = 0;
    foundCarol.each(function(){

        var verticalVisible = 0,
        elementOffset = $(this).offset(),
        elementHeight = $(this).height();

        if
            ((elementOffset.top > minTop && elementOffset.top < maxTop) ||
                (elementOffset.top + elementHeight > minTop && elementOffset.top +
                    elementHeight < maxTop))
           {
            //alert('some portion of the element is visible');
            if (elementOffset.top >= minTop && elementOffset.top + elementHeight
                <= maxTop) {
                verticalVisible = elementHeight;
            } else if (elementOffset.top < minTop) {
                verticalVisible = elementHeight - (minTop - elementOffset.top);
            } else {
                verticalVisible = maxTop - elementOffset.top;
            }
       }
       if (verticalVisible > maxAmount)
       {
           biggestCarol = $(this);
           maxAmount = verticalVisible;
       }
    });

    return biggestCarol;

    /*

    var foundCarol = $("div.carol:visible:in-viewport");

    if (foundCarol.length == 0) return undefined;

    $("div.carol").each(function(){
        if (foundCarol != undefined) return;
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(this).offset().top;
        var elemBottom = elemTop + $(this).height();

        if ((elemTop <= docViewBottom)
         &&  (elemTop >= docViewTop) && ($(this).is(":visible")))
        {
            foundCarol = this;
        }
    });

    return foundCarol; */
}

function buildCarolDiv(caroldiv)
{
    var carolsize = $(caroldiv).find("div.size").css("display","none")
                        .text().trim();
    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);
    var carolpercent = 1/carolsize*100;

    // depending on the screen size, let's live a little and give ourselves
    // a bit more breathing space
    if (screen.height > 900)
    {
        $(caroldiv).css({width : "480px", height : "480px"});
    }
    else if (screen.height > 799)
    {
        $(caroldiv).css({width : "440px", height : "440px"});
    }

    // kill any existing carol DOM... just in case
    $(caroldiv).find(".carolwrapper").remove();

    var obstacles = ";";
    // get obstacle positions
    $(caroldiv).find("div.obstacles").each(function(){
        obstacles += $(this).text().trim()+";"
    }).css("display","none"); // hide obstacles div when done

    var pickups = ";";
    // get pickup positions
    $(caroldiv).find("div.pickups").each(function(){
        pickups += $(this).text().trim()+";"
    }).css("display","none"); // hide pickups div when done

    // create any random obstacles
    $(caroldiv).find("div.randomObstacles").each(function(){
       var quantity = parseInt($(this).text().trim());
       for (var i = 0; i < quantity; i++)
       {
           var o;
           do
           {
            var x = Math.floor(Math.random()*15);
            var y = Math.floor(Math.random()*15);
            o = x+","+y+";";
           } while (pickups.indexOf(";"+o) != -1); // repeat if we've hit a pickup
           obstacles += o;
       }
    }).css("display","none");

    // create any random pickups
    $(caroldiv).find("div.randomPickups").each(function(){
       var quantity = parseInt($(this).text().trim());
       for (var i = 0; i < quantity; i++)
       {
           var p;
           do
           {
            var x = Math.floor(Math.random()*15);
            var y = Math.floor(Math.random()*15);
            p = x+","+y+";";
           } while (obstacles.indexOf(";"+p) != -1); // repeat if we've hit an obstacle
           pickups += p;
       }
    }).css("display","none");

    // get starting position
    var startX = 0;
    var startY = 0;

    // get starting position
    var startpos = $(caroldiv).find("div.startat").css("display","none").text().trim();
    if (startpos != "")
    {
        startX = startpos.split(",")[0];
        startY = startpos.split(",")[1];
    }


    var goalStr = $(caroldiv).find("div.goal").text();
    $(caroldiv).find("div.goal").css("display","none");
    var goalX = -1;
    var goalY = -1;
    if (goalStr != "")
    {
        goalX = parseInt(goalStr.split(",")[0]);
        goalY = parseInt(goalStr.split(",")[1]);
    }

    var surroundingDiv = $('<div class="carolwrapper" style="border: 1px solid gray; height: 100%; width: 100%"></div>');
    var pickupNo = 1;

    // set up the board.
    for (var y = 0; y < carolsize; y++)
    {
        for (var x = 0; x < carolsize; x++)
        {
            var square = $('<div class="carolsquare carolpos'+x+"-"+y+'"></div>');
            square.css("width",carolpercent+"%");
            square.css("height",carolpercent+"%");
            if (obstacles.indexOf(";"+x+","+y+";")!= -1) square.addClass("blocked");
            if (pickups.indexOf(";"+x+","+y+";")!= -1)
            {
                square.addClass("pickup");
                square.html(pickupNo);
                pickupNo++;
            }
            if (goalX == x && goalY == y) square.addClass("goal");
            $(surroundingDiv).append(square);
        }
    }

    $(surroundingDiv).find(".carolpos"+startX+"-"+startY).html('<img class="carol" src="http://fetlar.kingston.ac.uk/pp/carol/carol-right.png"/>');
    $(caroldiv).append(surroundingDiv);
}

function maxMinCode(outputheight,force)
{    
    if (outputheight == undefined) outputheight = "120px";
    var el = $("#editor-wrapper");
    // maximise
    if ($("#editor-wrapper[data-origBottom]").length == 0 || force)
    {
        el.attr("data-origBottom", el.css("bottom"));
        el.css("width","100%");
        el.css("bottom",outputheight);
        $("div#output-outer").css("height",outputheight);
        $("div#output-outer").css("width","100%");
        $("div#toolbar").css("width","100%");
        $("div#logoutitem").hide();
        $("div#navbar").hide();
        $("div#logoutitem").hide();
        $("body").css("overflow","hidden");
        $("span.maximisebutton").html("&#8744;");
        resize();
        editor.refresh();
    }
    else // minimise
    {
        var bottom = el.attr("data-origBottom");
        $("div#toolbar").css("width","");
        $("div#output-outer").css("width","");
        el.css("width","");
        el.css("bottom",bottom);
        $("div#output-outer").css("height",bottom);
        $("body").css("overflow","");
        $("div#logoutitem").show();
        $("div#navbar").show();
        $("div#logoutitem").show();
        el.removeAttr("data-origBottom");
        $("body").css("overflow","");   
        $("span.maximisebutton").html("&#8743;");
        resize();
        editor.refresh();
    }
}

function createEmos()
{
    if ($("div.emo").length == 0) return;
    $("div.emo").each(function(){
       $(this).css({
           "background-color" : "white",
           "border" : "1px solid black",
           "text-align" : "center",
           "padding-left" : "0.5em",
           "padding-right" : "0.5em",
           "box-sizing" : "border-box"
           
       });
       var emodesc = $(this).text().trim();
       $(this).text("");
       howDoYouFeelAbout(this,"<b>How do you feel about this workshop at the moment?</b>",emodesc,"...and click the icon that best matches your emotion right now:",true);
       $(this).find("div.emotionselection").addClass("fixed");
    });
}

function createFakeDocs() // and carols :-)
{
    var $fakedoc = $("div.fakedoc");
    if ($fakedoc.length == 0) return;

    // if we have a fakedoc,
    // we can resize the output and code windows seeing as how we won't be
    // using the former too much

    $("div#output-outer").css("height","120px");
    $("div#editor-wrapper").css("bottom","120px");

    //otherwise
    $fakedoc.each(function(){

        // if it's a Carol
        if ($(this).hasClass("carol"))
        {
            buildCarolDiv(this);
            // we can also resize the code window and the output window as
            // we know we won't be needing much of the latter
            return;
        }

        // otherwise
        var html = $(this).html();
        // TODO: Sanitize stuff out of IE - e.g. put quotes back round DIVs
        // Might want to use innerXHTML - google it
        $(this).html("");
        // add a "tab" at top of div
        $(this).wrap('<div class="fakedocwrapper"></div>');
        $(this).prepend('<iframe style="height: 1px" allowTransparency="true" frameborder="0" class="fakedoc"></iframe>').ready();
        var self = this;
        var iframe = $(this).find("iframe")[0];

        setTimeout(function(){
            $(iframe).height(1);
            $(iframe.contentWindow.document).find("body").html(html).css("background","transparent");            
            var height = $(iframe.contentWindow.document).height();
            $(iframe).css("height",height+"px");
        },1000);

        $(this).parent().prepend('<div><span class="fakedoctab selected render">Original</span><span class="fakedoctab source">HTML</span>');
        $(this).parent().append('<div class="htmleditor"><textarea>xxxx</textarea></div>');
        $(this).parent().find("textarea").val(html.trim());
        //; turn textarea into codemirror editor
        var editor = CodeMirror.fromTextArea($(this).parent().find("textarea")[0], {
            mode: 'text/html',
            tabMode: 'indent',
            onCursorActivity: function() {
                if (editor) {
                    $(iframe.contentWindow.document).find("body").html(editor.getValue());
                    resizeIframe(iframe);
                }
            }
          });
        $(this).parent().find(".source").click(function(){
            $(this).addClass("selected");
            $(this).parent().find(".render").removeClass("selected");
            $(this).parent().parent().find("div.htmleditor").show();
            $(this).parent().parent().find("div.fakedoc").hide();
            var bodyelement = $($(self).find("iframe")[0].contentWindow.document).find("body")[0];
            editor.setValue(styleHTML(innerXHTML(bodyelement)));
            editor.refresh();
        });
        $(this).parent().find(".render").click(function(){
            $(this).addClass("selected");
            $(this).parent().find(".source").removeClass("selected");
            $(this).parent().parent().find("div.htmleditor").hide();
            resizeIframe(iframe);
            $(this).parent().parent().find("div.fakedoc").show();
        });
        $(this).parent().find("div.htmleditor").hide();
    });

    setTimeout(function(){
        updateVisibleFakeDoc();
        highlightCarols();
    } ,3000);
    $(window).scroll(function(){
        updateVisibleFakeDoc();
    });
}

function highlightCarols()
{
    var whatToDo = function()
    {
        $("div.fakedoc.carol").css("border","1px solid black");
        $(getCarolDiv()).css("border","3px solid black");
    }
    if ($("div.fakedoc.carol").length != 0)
    {
        whatToDo();
        $(window).scroll(function(){
            whatToDo();
        });        
    }
}

function updateVisibleFakeDoc()
{    
    $("div.fakedocwrapper div.fakedoc").css("border","1px solid black");
    $("div.fakedocwrapper").removeClass("onscreen");
    $("div.fakedocwrapper").each(function(){
    	var that = this;
    	$(this).find("iframe")[0].contentWindow.document.body.onclick = function() {
    		$("div.fakedocwrapper div.fakedoc").css("border","1px solid black");
    		$("div.fakedocwrapper").removeClass("onscreen");
    		$(that).addClass("onscreen");
    		$("div.fakedocwrapper.onscreen").find("div.fakedoc").css("border","4px solid black");
    		visibleFakeDoc = $("div.fakedocwrapper.onscreen").find("iframe")[0].contentWindow.document;
	        visibleFakeDocWrapper = $("div.fakedocwrapper.onscreen");	
    	};
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(this).offset().top;
        var elemBottom = elemTop + $(this).height();

        if (/* (elemBottom >= docViewTop)  && */ (elemTop <= docViewBottom)
         /* && (elemBottom <= docViewBottom) */ &&  (elemTop >= docViewTop) && ($(this).is(":visible")))
        {            
            $(this).addClass("onscreen");
        }
    });
    
    if ($("div.fakedocwrapper.onscreen").size() == 1)
    {
    	$("div.fakedocwrapper.onscreen").find("div.fakedoc").css("border","4px solid black");
    	visibleFakeDoc = $("div.fakedocwrapper.onscreen").find("iframe")[0].contentWindow.document;
        visibleFakeDocWrapper = $("div.fakedocwrapper.onscreen");
    }
    else if ($("div.fakedocwrapper.onscreen").size() > 1)
    {
    	$("div.fakedocwrapper.onscreen").find("div.fakedoc").css("border","4px dotted red");
    }
}

function createQuickQuizzes()
{
    var qno = 0;
    $(".qqmain, .qqinput").each(function(){
        qno++;
       if($(this).hasClass("qqmain"))
       {
       $(this).prepend("<div style=\"padding: 4px; background-color: black; color: #EDF4F5; margin-bottom: 0.5em\">Quiz Question <span class=\"qno\">"+qno+"</span> (click your answer)</div>");
       $(this).find(".response").each(function()
        {
            $(this).css("display","none");
        });

       $(this).find(".distractor").each(function()
       {
           $(this).bind("click", function(){
               $(".qqmain .distractor").css("font-weight","normal");
               $(this).css("font-weight","bold");
               $(".qqmain .distractor .response").hide();
               $(this).find(".response").show();
               LOGquizInteract($(this));
           });
       });

       if (!$(this).hasClass("noshuffle"))
       {
           $(this).randomize("div.distractor");
       }
       }
       else
       {
          $(this).prepend("<div style=\"padding: 4px; background-color: black; color: #EDF4F5; margin-bottom: 0.5em\">Quiz Question <span class=\"qno\">"+qno+"</span> (enter your answer and press return)</div>");
           var answer = $(this).find(".correct").clone().children().remove().end().text().trim();

           // now we've got the answer, we can remove its textnode from the DOM
           var textnode = $(this).find(".correct").contents().eq(0);
           if (textnode[0].nodeType == 3) $(textnode).remove();

           $(this).find(".distractor").eq(0).before("<br/><input type=\"text\" onkeydown=\"if (event.keyCode == 13) handleQQInput(this,'"+answer+"')\"/>");

           $(this).find(".response").each(function()
            {
                $(this).css("display","none");
            });
       }
    });

//     $(".qqinput").each(function(){
//       $(this).prepend("<div style=\"padding: 4px; background-color: black; color: #EDF4F5; margin-bottom: 0.5em\">Quiz Question (enter your answer and press return)</div>");
//       var answer = $(this).find(".correct").clone().children().remove().end().text().trim();
//
//       // now we've got the answer, we can remove its textnode from the DOM
//       var textnode = $(this).find(".correct").contents().eq(0);
//       if (textnode[0].nodeType == 3) $(textnode).remove();
//
//       $(this).find(".distractor").eq(0).before("<br/><input type=\"text\" onkeydown=\"if (event.keyCode == 13) handleQQInput(this,'"+answer+"')\"/>");
//
//       $(this).find(".response").each(function()
//        {
//            $(this).css("display","none");
//        });
//     });

     // not a quick quiz, but hell, might as well go here
     // hide the "hidden code bits"
     $("div.hiddenRun").each(function(){
        var code = rot13($(this).text());
        var origId = $(this)[0].id;
        if (origId == undefined) origId = "";

        $("<div></div>").css({
            border : "1px solid black",
            background : "white",
            cursor : "hand",
            cursor : "pointer",
            padding : "5px",
            fontWeight : "bold",
            textAlign : "center"
        }).click(function(){
            var oldcode = code;
            code = code.replace(/document/g,"parent.visibleFakeDoc");
            hiddenRun(code);
            LOGhiddenRun(origId, oldcode);
            return false;
        }).text(">>> Click here to see an example of what your program should do <<<").insertBefore($(this));
        $(this).remove();
     });
     $("span.hiddenRun").each(function(){
        var code = rot13($(this).text());
        var text = $(this).attr("data-linktext");
        $(this).html('<a href="#">'+text+"</a>");
        $(this).click(function(){
           var oldcode = code;
           code = code.replace(/document/g,"parent.visibleFakeDoc");
           hiddenRun(code);
           LOGhiddenRun("span", oldcode);
           return false;
        });
     });
}

function handleTestCasesBasic()
{
    $(".testCase").each(function(){
        var id = $(this)[0].id;
        if (id == undefined) id = "";
        var tests = $(this).find(".test");
        //var inputTests = $(this).find(".inputTest");
        var func = function() {
            lasttestlink = this;
            // remove any emotional stuff
            $(this).find("div.emotionselection").remove();

            var numberOfTests = 0;
            var successfulTests = 0;

            var inputArray = [];

            tests.each(function(){

               var finalOutput = $(this).find(".testFinalOutput").text().trim();
               var finalOutputJS = $(this).find(".testFinalOutputJS").text().trim();
               var codeIncludes = $(this).find(".codeIncludes").text().trim();
               var repeat = $(this).attr("data-repeat");
               var initcond = $(this).attr("data-initcond");
               var endTestJS = $(this).find(".endTestJS").text().trim();

               // if we have an initial condition, execute it
               if (initcond) eval(initcond);

               var inputTests = $(this).find(".inputTest").each(function(){
                inputArray[inputArray.length] = $(this).text().trim();
               });

               var codeInEditor = editor.getValue();

               // replace any input statements with direct assignation from
               // inputArray

               // TODO: handle colons!
               // TODO: detect the word "input" in a string!

               var lines = codeInEditor.split(/\n/g);
               var newCode = "";
               var inputNo = 0;
               for (var i = 0; i < lines.length; i++)
               {
                   var line = lines[i].trim();
                   if (line.toLowerCase().indexOf("input") != -1)
                   {
                       // get the variable involved
                       line = line.replaceAll(/input/gi,"");
                       var lineX = line.split(/\s/);
                       var lineNo = lineX[0];
                       var lineVar = lineX[1];
                       // string variable
                       if (lineVar.indexOf('$') != -1)
                       {
                           line = lineNo+" let "+lineVar+' = "'+inputArray[inputNo]+'"';
                           inputNo++;
                       }
                       else
                       {
                           line = lineNo+" let "+lineVar+' = '+inputArray[inputNo];
                       }
                   }
                   line += '\n';
                   newCode += line;
               }
               codeInEditor = newCode;

               // handle repetition
               var repeatNo = 1;
               if (repeat)
               {
                   repeatNo = parseInt(repeat);
               }
               for (var repeatIteration = 0; repeatIteration < repeatNo; repeatIteration++)
               {
                   // run the code
                   basic.runbasic(codeInEditor,true); // true means no logging

                   var answerDocument = $("#outputframe")[0].contentWindow.document;
                   var answerText = answerDocument.getElementById("output-main").innerHTML.trim();
                   answerText = answerText.replace(/<br.*?>/gi,"\\n");

                   // are we dealing with a simple comparison or Javascript eval?
                   if (finalOutput != "")
                   {
                       numberOfTests++;
                        if (finalOutput.charAt(0) != "!")
                        {
                            if (answerText.indexOf(finalOutput) != -1) successfulTests++;
                        }
                        else
                        {
                            finalOutput = finalOutput.substr(1);
                            if (answerText.indexOf(finalOutput) == -1) successfulTests++;
                        }
                   }
                   else if (finalOutputJS != "")
                   {
                       var result = new Function("answerDocument","answerText",finalOutputJS)(answerDocument,answerText);
                       numberOfTests++;
                       if (result) successfulTests++;
                   }

                   // check for "code includes", i.e. the code itself has to contain XYZ
                   if (codeIncludes != "")
                   {
                       numberOfTests++;
                       if (codeIncludes.charAt(0) != "!")
                       {
                          if (codeInEditor.indexOf(codeIncludes) != -1) successfulTests++;
                       }
                       else
                       {
                          if (codeInEditor.indexOf(codeIncludes) == -1) successfulTests++;
                       }
                   }

                } // and loop :-)

                // if there's a final condition i.e. endTestJS
                if (endTestJS)
                {
                    var result = new Function(endTestJS)();
                    numberOfTests++;
                    if (result) successfulTests++;
                }

                // so...

                var doc = $("#outputframe")[0].contentWindow.document;
                var win = $("#outputframe")[0].contentWindow;

                if (numberOfTests == successfulTests)
                {
                    // great success!
                    var objDiv = doc.getElementById("output-main");
                    var htmlToAdd = objDiv.innerHTML+
                            '<div class="testpass" style="border: 2px solid black; padding: 5px; background: white; color: green; font-weight: bolder; margin-top: 1em;">'+
                            "Well done! Your program passed the test! Congratulations!</div>";
                       objDiv.innerHTML = htmlToAdd;
                       LOGtestPassed();
                       win.scrollTo(0,doc.body.scrollHeight);
                }
                else
                {
                    // epic fail
                    var objDiv = doc.getElementById("output-main");
                    var htmlToAdd = objDiv.innerHTML+
                            '<div class="testfail" style="border: 2px solid black; padding: 5px; background: white; color: red; font-weight: bolder; margin-top: 1em;">'+
                            "Sorry! Your program did not produce the expected output! It passed "+successfulTests+" out of "+numberOfTests+" test(s). Check your work and try again!</div>";
                       objDiv.innerHTML = htmlToAdd;
                       LOGtestFailed(successfulTests+"/"+numberOfTests);
                       win.scrollTo(0,doc.body.scrollHeight);
                }


            });
        };
        $(this).text(">>> Click here to test your code <<<");
        $(this).css({
            border : "1px solid black",
            background : "white",
            cursor : "hand",
            cursor : "pointer",
            padding : "5px",
            fontWeight : "bold",
            textAlign : "center"
        });
        $(this).click(func);
    });
}


function howDoYouFeelAbout(source,message,shortmsg,message2,recordThoughts)
{
    if (message2 == undefined) message2 = "How do you feel about that?";
    
    // if already asked, don't mess around with the how do you feel did...
    if ($(source).find("div.emotionselection div.message").text().trim() == message) return;
    
    // otherwise, blow away any existing how do you feels...
    $("div.emotionselection").not(".fixed").remove();
    var emotiondiv = $('<div class="emotionselection" style="margin-top: 0.8em"></div>');    
    
    emotiondiv.append('<div class="message" style="margin-bottom: 0.8em; margin-top: 0.8em">'+message+"</div>");
    
    if (recordThoughts)
    {
        emotiondiv.append("Type your thoughts below...");
        emotiondiv.append('<textarea class="emothoughts" style="width: 90%; height: 5em; font-family: sans-serif"></textarea>');
    }
    
    emotiondiv.append('<div class="message2">'+message2+'</div>');        
    
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Happy</div><img src="'+contextPath+'/images/happy.png"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Angry</div><img src="'+contextPath+'/images/angry.png"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Confused</div><img src="'+contextPath+'/images/confused.png"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Disappointed</div><img src="'+contextPath+'/images/disappointed.png"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Embarrassed</div><img src="'+contextPath+'/images/embarrassed.png"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Sad</div><img src="'+contextPath+'/images/sad.png"/></div>');        
    
    emotiondiv.find("img").css("border-radius",20);
    emotiondiv.find("img").css("padding","3px");
    emotiondiv.find("img").css("border","3px solid white");
    emotiondiv.find("img").css("border-color","transparent");
    emotiondiv.find("img").hover(
        function(){ // on mouse over
            $(this).css("border-color","black");
            $(this).closest("div").css("color","black");
        },function(){ // on mouse out
            $(this).css("border-color","transparent");
            $(this).closest("div").css("color","transparent");        
        });
    $(emotiondiv).find("img").click(function(e){
            var emotion = $(this).attr("src").split("/").pop().split(".")[0];
            var medalText = "";
            try { medalText = $(this).closest("div.testCase").attr("data-medal").split(":")[0]; } catch (e) {};
            var sourceId = $(this).closest("div.testCase").attr("data-id");
            if (sourceId == undefined) sourceId = ""; else sourceId = ":"+sourceId;
            if (medalText == "") medalText = "testOnly";                        
            if (recordThoughts)
            {
                emotion += ":"+$(this).closest("div.emotionselection").find("textarea.emothoughts").val();
                medalText = "endOfSection";
            }            
            sourceId = medalText+sourceId;
            logEmotion(shortmsg,emotion,sourceId);
            $(this).closest("div.emotionselection").find("img").not(this).css("opacity","0.3");
            $(this).closest("div.emotionselection").find("img").unbind();
            $(this).closest("div.testCase").attr("data-fails","0");        
            // ugly hack to make the message "different"
            $(source).find("div.emotionselection div.message").html("&nbsp;"+message+"&nbsp;");
            $(source).find("div.emotionselection div.message2").text("You said you felt");
            setTimeout(function(){
                $(source).find("div.emotionselection").hide(1000,function(){ $(source).find("div.emotionselection").remove(); });
            },3000)
            e.stopPropagation();
        });
    $(source).append(emotiondiv);
    emotiondiv.find("div.imgwrapper").each(function(){
       var textdiv = $(this).find("div").eq(0);
       var wrapperwidth = $(this).textWidth();
       var parentwidth = $(this).width();
       if (wrapperwidth > parentwidth)
        {
            var offset = parseInt((wrapperwidth - parentwidth) / 2);
            $(textdiv).css("left",-offset);
        }
    });
}

function greatSuccessHtml(medal,fb)
{
	if (!fb) fb = ""; else fb += "&nbsp;</br/>";
    var iframeDoc = document.getElementById("outputframe").contentDocument;

    $("body",iframeDoc).append('<div id="testresult" style="font-family: monospace; font-weight: bold; position: fixed; border: 2px solid black; background-color: white; top: 50%; margin-top: -100px; padding : 10px; width: 95%; box-sizing: border-box; color: green">'+fb+'Well done! Your work passed the test!</div>');

       if (medal)
       {
        var medalData = medal.split(":");
        var medalName = medalData[1];
        var medalTypeOnly = medalData[0];
        var medalType = (medalData[0] == "ribbon") ? medalTypeOnly : medalTypeOnly+" medal";
       }
       if (medal)
       {
        parent.$("#output-outer").css("height","");
        parent.$("#editor-wrapper").css("bottom","");
        parent.$("#editor-wrapper").css("height","");
        parent.resize();
        $("div#testresult",iframeDoc).append('<p style="text-align: center"><img src="'+parent.contextPath+'/images/medal'+medalTypeOnly+'.png"/></p>Passing this test awards you a '+medalType+' for the "'+medalName+'" challenge!</div>');
        $("div#testresult",iframeDoc).css("opacity",0.8);
       }
       parent.LOGtestPassed();
       if (medal) howDoYouFeelAbout(lasttestlink,"Well done! Your code was good enough for a medal!",medalType);
       if (medal) parent.LOGmedal(medal);
}

function epicFailHtml(SUCCESSFULTESTS,NUMBEROFTESTS,fb)
{
	if (!fb) fb = ""; else fb += "&nbsp;</br/>";
	if (fb.trim() != "")
	{
		parent.$("#output-outer").css("height","");
		parent.$("#editor-wrapper").css("bottom","");
		parent.$("#editor-wrapper").css("height","");
		parent.resize();
	}
    var iframeDoc = document.getElementById("outputframe").contentDocument;

    $("body",iframeDoc).append('<div id="testresult" style="font-family: monospace; font-weight: bold; position: fixed; border: 2px solid black; background-color: white; top: 50%; margin-top: -100px; padding : 10px; width: 95%; box-sizing: border-box; color: red">'+fb+'Sorry! Your work did not produce what we were looking for! It passed '+SUCCESSFULTESTS+' of '+NUMBEROFTESTS+' test(s).</div>');
    $("div#testresult",iframeDoc).css("opacity",0.8);

    parent.LOGtestFailed(SUCCESSFULTESTS+"/"+NUMBEROFTESTS);
    
    var attempts = $(lasttestlink).attr("data-fails");
    if (isNaN(attempts)) attempts = 0;
    attempts++;
    $(lasttestlink).attr("data-fails",attempts);

    if (attempts == 5)
    {
        $(lasttestlink).attr("data-fails","0");
            howDoYouFeelAbout(lasttestlink,"You've been unsuccessful at this activity five in times in a row now...","repeatedFail");
    }
}

// nabbed from http://stackoverflow.com/questions/324486/how-do-you-read-css-rule-values-with-javascript
function getStyle(className){
        var x, sheets,classes;
        for( sheets=document.styleSheets.length-1; sheets>=0; sheets-- ){
            classes = document.styleSheets[sheets].rules || document.styleSheets[sheets].cssRules;
            for(x=0;x<classes.length;x++) {
                if(classes[x].selectorText===className) {
                    return  (classes[x].cssText ? classes[x].cssText : classes[x].style.cssText);
                }
            }
        }
        return undefined;
    };

function handleTestCasesHtml()
{
    $(".testCase").each(function(){                
        var id = $(this)[0].id;
        if ($(this).find("div.id").length != 0)
        {
            id = $(this).find("div.id").text().trim();
        }
        if (id == undefined) id = "";
        
        // get medal details, if any
        var medal09876 = undefined;
        if ($(this).find("div.medalType").length != 0)
        {
            medal09876 = $(this).find("div.medalType").text().trim();
            if ($(this).find("div.medalDesc").length != 0)
            {
                medal09876 += ":"+$(this).find("div.medalDesc").text().trim()+":"+id;
            }
            else
            {
                medal09876 += ":"+id;
            }
        }
        if (medal09876 != undefined) $(this).attr("data-medal",medal09876);
        $(this).attr("data-id",id);        
        
        var tests = $(this).find(".test");
        //var inputTests = $(this).find(".inputTest");
        var func = function(e) {            
            lasttestlink = this;
            $(this).find("div.emotionselection").remove();
            // hidden override option
            if (e.shiftKey)
            {
                $(this).find("button,br,input").show();
                return;
            }
            
            // JQuery CDN
            var code = '<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>'+"\n";
            code += '<script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>'+"\n";
            
            // our own test code
            code += '<script type="text/javascript">'+"\n";
            
            // feedback
            code += 'var fb = ""; function feedback(newFb) { fb += "<p style=\\"margin-top: 0px\\">"+newFb+"</p>" }'; 
            
            // Hacky way of forcing getStyle into the scope of the iframe
            // yes, eval is evil, it burns, it burns
            code += 'eval(parent.getStyle.toString());\n';
            
            code += "NUMBEROFTESTS = 0; ";
            code += "SUCCESSFULTESTS = 0; \n\n";
            
            if (medal09876)
            {
                code += "medal09876 = '"+medal09876+"'; \n\n";
            }
            else
            {
                code += "medal09876 = undefined; \n\n";
            }

            tests.each(function(){

               var finalOutputJS = $(this).find(".testFinalOutputJS").text().trim();
               var codeIncludes = $(this).find(".codeIncludes").text().trim();
               var repeat = $(this).attr("data-repeat");
               var initcond = $(this).attr("data-initcond");
               var endTestJS = $(this).find(".endTestJS").text().trim();

               // if we have an initial condition, add it
               if (initcond) code += initcond+"\n";

               var oneCheck = "{\n";
               oneCheck += "// START OF TEST RUN\n\n";
               
               oneCheck += "NUMBEROFTESTS++;";

               if (repeat) // add a for loop on the beginning
               {
                oneCheck = "\nfor (var flibble1234567 = 0; flibble1234567 < "+repeat+"; flibble1234567++)\n"+oneCheck;
               }

               if (finalOutputJS != "")
               {
                   oneCheck +="\n"+'var testFunc = function() { '+finalOutputJS+ ' };';
                   oneCheck += "\n"+'if (testFunc()) SUCCESSFULTESTS++;'+"\n";
               }

               // if we have a check for the code needing to include a particular
               // aspect
               if (codeIncludes != "")
               {
                   // this is actually a discrete test so increment
                   oneCheck += "\nNUMBEROFTESTS++;\n";
                   if (codeIncludes.charAt(0) != "!")
                   {
                       if (codeIncludes.indexOf('"') == -1)
                       {
                            oneCheck += "\n"+'if (parent.editor.getValue().indexOf("'+codeIncludes+'") != -1) SUCCESSFULTESTS++;'+"\n";
                       }
                       else
                       {
                           oneCheck += "\n"+"if (parent.editor.getValue().indexOf('"+codeIncludes+"') != -1) SUCCESSFULTESTS++;\n";
                       }
                   }
                   else
                   {
                       codeIncludes = codeIncludes.substr(1);
                       if (codeIncludes.indexOf('"') == -1)
                       {
                            oneCheck += "\n"+'if (parent.editor.getValue().indexOf("'+codeIncludes+'") == -1) SUCCESSFULTESTS++;'+"\n";
                       }
                       else
                       {
                           oneCheck += "\n"+"if (parent.editor.getValue().indexOf('"+codeIncludes+"') == -1) SUCCESSFULTESTS++;\n";
                       }

                   }
               }

               // close the code block
               oneCheck += "}\n\n//END OF TEST RUN\n\n";

               // finally, if there's a final condition for this test
               if (endTestJS)
               {
                   oneCheck += "\n\n// FINAL CONDITION\n\n"
                   oneCheck += "\nNUMBEROFTESTS++;\n";
                   oneCheck += "var finalFunc = function () { "+endTestJS+" };\n";
                   oneCheck += "if (finalFunc()) SUCCESSFULTESTS++;";
               }

               // add the check code block to our main code
               code += "\n\n"+oneCheck;

            });

            code += "\n"+'if (SUCCESSFULTESTS == NUMBEROFTESTS) parent.greatSuccessHtml(medal09876,fb);';
            code += "\n"+'if (SUCCESSFULTESTS != NUMBEROFTESTS) parent.epicFailHtml(SUCCESSFULTESTS,NUMBEROFTESTS,fb);';
            code += "\n</script>";

            LOGtestStart(id,getTabBundleCode());
            runFullWeb(getTabBundleCode(undefined,code), getTabBundleCode());
        };
        
        var linkText = " >>> Click here to test your code <<<"
        if (medal09876 != undefined)
        {
            linkText = linkText.replace("code","code for a "+medal09876.split(":")[0]+" medal");
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
                LOGtestStart(id,editor.getValue());
                hiddenRun("");
                setTimeout(function(){
                    outputframe.greatSuccess(medal09876);
                },1000);                
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
        $(this).click(func);
    });
}

function handleTestCases()
{
    $(".testCase").each(function(){                
        var id = $(this)[0].id;
        if ($(this).find("div.id").length != 0)
        {
            id = $(this).find("div.id").text().trim();
        }
        if (id == undefined) id = "";
        
        // get medal details, if any
        var medal09876 = undefined;
        if ($(this).find("div.medalType").length != 0)
        {
            medal09876 = $(this).find("div.medalType").text().trim();
            if ($(this).find("div.medalDesc").length != 0)
            {
                medal09876 += ":"+$(this).find("div.medalDesc").text().trim()+":"+id;
            }
            else
            {
                medal09876 += ":"+id;
            }
        }
        if (medal09876 != undefined) $(this).attr("data-medal",medal09876);
        $(this).attr("data-id",id);        
        
        var tests = $(this).find(".test");
        //var inputTests = $(this).find(".inputTest");
        var func = function(e) {
            lasttestlink = this;
            $(this).find("div.emotionselection").remove();
            // hidden override option
            if (e.shiftKey)
            {
                $(this).find("button,br,input").show();
                return;
            }
            
            var code = "NUMBEROFTESTS = 0; ";
            code += "SUCCESSFULTESTS = 0; \n\n";
            code += "answerDocument = parent.visibleFakeDoc; \n\n";
            code += "qwerty09876 = \"\";\n\n\n";
            
            code += 'function liveOutput() { return (document.getElementById("output-main").innerHTML+"").trim().replace(/<br.*?>/gi,"\\n") }';
            
            code += "\n\n\n\n";
            
            code += 'function getCode() { return parent.editor.getValue(); }';
            
            code += "\n\n\n\n";
            
            if (medal09876)
            {
                code += "medal09876 = '"+medal09876+"'; \n\n";
            }
            else
            {
                code += "medal09876 = undefined; \n\n";
            }

            var inputArray = "INPUTARRAY = [";

            tests.each(function(){

               var finalOutput = $(this).find(".testFinalOutput").text().trim();
               var finalOutputJS = $(this).find(".testFinalOutputJS").text().trim();
               var codeIncludes = $(this).find(".codeIncludes").text().trim();
               var repeat = $(this).attr("data-repeat");
               var initcond = $(this).attr("data-initcond");
               var endTestJS = $(this).find(".endTestJS").text().trim();

               // if we have an initial condition, add it
               if (initcond) code += initcond+"\n";

               var inputTests = $(this).find(".inputTest");
               inputTests.each(function(){
                inputArray += "\""+$(this).text().trim()+"\",";
                //code = code.replace("input(\"","fakeInput(\""+$(this).text().trim()+"\",\"");
               });

               var oneCheck = "{\n";
               oneCheck += "// START OF TEST RUN\n\n";
               var codeInEditor = editor.getValue();
               
               if ($("div.parameter#language").text().trim() == "carol")
    		   {
			    	/* Ugly hack to prevent people using move(x) in actual code */
			    	//codeInEditor = code.replace(/move\(.+\)/g,"move(!)");
			   }
               
               codeInEditor += "\n\n";
               codeInEditor = codeInEditor.replace(/document/g,"parent.visibleFakeDoc");
               
               if($("div.parameter#language").text().trim() == "pcode")
               {
                   codeInEditor = pcodeToJs(codeInEditor);
               }
               
               oneCheck += codeInEditor+"\n";
               oneCheck += "NUMBEROFTESTS++;";

               if (repeat) // add a for loop on the beginning
               {
                oneCheck = "\nfor (var flibble1234567 = 0; flibble1234567 < "+repeat+"; flibble1234567++)\n"+oneCheck;
               }

               // add checks for successful test
               oneCheck += "\n"+'qwerty09876 = document.getElementById("output-main").innerHTML;';
               oneCheck += "\n"+'qwerty09876 = qwerty09876.trim();';
               oneCheck += "\n"+'qwerty09876 = qwerty09876.replace(/<br.*?>/gi,"\\n");';

               // are we dealing with a simple comparison or Javascript evaluation?
               if (finalOutput != "")
               {
                   if (finalOutput.charAt(0) != "!")
                   {
                        oneCheck += "\n"+'if (qwerty09876.indexOf("'+finalOutput+'") != -1) { SUCCESSFULTESTS++; }'+"\ncls();\n";
                   }
                   else
                   {
                       finalOutput = finalOutput.substr(1);
                        oneCheck += "\n"+'if (qwerty09876.indexOf("'+finalOutput+'") == -1) { SUCCESSFULTESTS++; }'+"\ncls();\n";
                   }
               }
               else if (finalOutputJS != "")
               {
                   oneCheck +="\n"+'var testFunc = function(finalOutput) { '+finalOutputJS+ ' };';
                   oneCheck += "\n"+'if (testFunc(qwerty09876)) SUCCESSFULTESTS++;'+"\ncls();\n\n";
               }

               // if we have a check for the code needing to include a particular
               // aspect
               if (codeIncludes != "")
               {
                   // this is actually a discrete test so increment
                   oneCheck += "\nNUMBEROFTESTS++;\n";
                   if (codeIncludes.charAt(0) != "!")
                   {
                       if (codeIncludes.indexOf('"') == -1)
                       {
                            oneCheck += "\n"+'if (parent.editor.getValue().toLowerCase().indexOf("'+codeIncludes.toLowerCase()+'") != -1) SUCCESSFULTESTS++;'+"\n";
                       }
                       else
                       {
                           oneCheck += "\n"+"if (parent.editor.getValue().toLowerCase().indexOf('"+codeIncludes.toLowerCase()+"') != -1) SUCCESSFULTESTS++;\n";
                       }
                   }
                   else
                   {
                       codeIncludes = codeIncludes.substr(1);
                       if (codeIncludes.indexOf('"') == -1)
                       {
                            oneCheck += "\n"+'if (parent.editor.getValue().toLowerCase().indexOf("'+codeIncludes.toLowerCase()+'") == -1) SUCCESSFULTESTS++;'+"\n";
                       }
                       else
                       {
                           oneCheck += "\n"+"if (parent.editor.getValue().toLowerCase().indexOf('"+codeIncludes.toLowerCase()+"') == -1) SUCCESSFULTESTS++;\n";
                       }

                   }
               }

               // close the code block
               oneCheck += "}\n\n//END OF TEST RUN\n\n";

               // finally, if there's a final condition for this test
               if (endTestJS)
               {
                   oneCheck += "\n\n// FINAL CONDITION\n\n"
                   oneCheck += "\nNUMBEROFTESTS++;\n";
                   oneCheck += "var finalFunc = function () { "+endTestJS+" };\n";
                   oneCheck += "if (finalFunc()) SUCCESSFULTESTS++;";
               }

               // add the check code block to our main code
               code += "\n\n"+oneCheck;

            });
            inputArray += "];";
            inputArray = inputArray.replace(",]","]");
            code = "INPUTNO = 0;\n"+inputArray+"\n"+code;
            code += "\n"+'if (SUCCESSFULTESTS == NUMBEROFTESTS) greatSuccess(medal09876);';
            code += "\n"+'if (SUCCESSFULTESTS != NUMBEROFTESTS) epicFail();';

            LOGtestStart(id,editor.getValue());

            code = code.replace(/input/g,"fakeInput");
            code = code.replace(/prompt/g,"fakeInput");

            if($("div.parameter#language").text().trim() != "pcode") 
            {
                hiddenRun(code,"true",editor.getValue());
            }
            else
            {
                hiddenRun(code,"true");
            }
        };
        
        var linkText = " >>> Click here to test your code <<<"
        if (medal09876 != undefined)
        {
            linkText = linkText.replace("code","code for a "+medal09876.split(":")[0]+" medal");
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
                LOGtestStart(id,editor.getValue());
                hiddenRun("");
                setTimeout(function(){
                    outputframe.greatSuccess(medal09876);
                },1000);                
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
        $(this).click(func);
    });
}

//
function updateTestCases()
{
    // populate medal object from backend
    $.ajax({
        type : "POST",
        url : contextPath + "/stats?type=testMedals",    
        dataType : "json",
        success : function(r) {       
            medals = r;
            $(".testCase").each(function(){        
                // get any emotional content
                var testId = $(this).attr("data-id");
                var targetMedal = $(this).attr("data-medal");
                if (targetMedal == undefined) targetMedal = "";

                // if we've passed a test with this ID before...        
                if (medals[testId] != undefined)
                {                              
                    var medal = medals[testId];
                    targetMedal = targetMedal.split(":")[0];
                    if (medal == targetMedal)
                    {
                        var html = '';
                        if (medal != "")
                        {
                            html = '<p style="margin: 0px; padding: 0px; text-align: center">You have already won ';
                            var extraHtml = "a "+medal;
                            if (medal != "ribbon") extraHtml += " medal";
                            extraHtml += " for this exercise."
                            html += extraHtml;
                            html = '<img src="'+contextPath+'/images/medal'+medal+'.png" style="float: left">'+html;
                            html += '<br/>&nbsp;<br/>&gt;&gt;&gt Click here to repeat the test for a '+targetMedal+' medal &lt;&lt;&lt</p><div style="clear: both"></div>';
                            html = html.replace("ribbon medal","ribbon"); // shouldn't ever happen, but hey
                        }
                        else 
                        {
                            html = '&gt;&gt;&gt You\'ve passed this already - click to repeat the test &lt;&lt;&lt';
                        }
                        $(this).contents().not("div.emotionselection").remove();
                        $(this).prepend(html);
                    }
                    else if (medal != "")
                    {  
                    	var greater = false;
                    	if (targetMedal == "bronze" && $.inArray(medal,["silver","gold"]) != -1) greater = true;
                    	if (targetMedal == "silver" && medal == "gold") greater = true;                              
						var msg = "You currently have a *MEDAL* medal for this exercise.";
						if (greater) msg = "You already have a better (*MEDAL*) medal for this exercise.";
						msg = msg.replace("*MEDAL*",medal);
                        html = '<p style="margin: 0px; padding: 0px; text-align: center;">'+msg;						
						if (greater) html = '<img src="'+contextPath+'/images/medal'+targetMedal+'.png" style="float: left">'+html;
						html += '<br/>&nbsp;<br/>&gt;&gt;&gt Click here to test for the '+targetMedal+' medal &lt;&lt;&lt</p><div style="clear: both"></div>';
						html = html.replace("ribbon medal","ribbon"); // shouldn't ever happen, but hey
                        $(this).contents().not("div.emotionselection").remove();
                        $(this).prepend(html);
                    }
                }
            });
        }
    });
    
}

function handleQQInput(source,answer)
{
    if (source.value.toLowerCase() == answer.toLowerCase())
    {
        $(source).parent().find(".wrong").css("display","none");
        $(source).parent().find(".wrong div.response").css("display","none");
        $(source).parent().find(".correct").css("display","block");
        $(source).parent().find(".correct div.response").css("display","block");
        LOGquizInteractText(source,"correct",source.value);
    }
    else
    {
        $(source).parent().find(".correct").css("display","none");
        $(source).parent().find(".correct div.response").css("display","none");
        $(source).parent().find(".wrong").css("display","block");
        $(source).parent().find(".wrong div.response").css("display","block");
        LOGquizInteractText(source,"wrong",source.value);
    }
}

function highlight(div)
{
    jQuery('<div></div>', {
        css : {
            opacity : 0.3,
            backgroundColor : "green",
            width : $(div).width(),
            height : $(div).height(),
            position : "absolute",
            top : 0,
            left : 0,
            zIndex : 20000
        }
    }).addClass("highlight").prependTo(div);
}

function lowlight(div)
{
    $(div).find(".highlight").remove();
}

function getCurrentSectionNo()
{
    var no = 0;
    var retVal = -1;
    $(".section").each(function(){
       if ($(this).hasClass("selected")) retVal = no;
       no++;
    });
    return retVal;
}

function getTabBundleCode(asArray,injectIntoIndex)
{
    if ($("div.parameter#multi").text().trim() != "true")
    {
        if (asArray)
        {
            return [[editor.getValue()],["Tab 1"]];
        }
        return "***TAB***\nTab 1\n***CODE***\n"+editor.getValue()+"\n";
    }
    var newcode = "";
    var newcodeAsArray = [];
    var tabNamesAsArray = [];
    $("#code-titlebar div.tab").not("div.newtab").each(function(i,tab){
       newcode += "***TAB***\n";
       var tabcode = editor.getValue();
       if (!$(tab).hasClass("selected"))          
       {
           tabcode = getCode($(tab).find("pre.code")[0]);
       }
       var tabname = $(tab).clone().children().remove().end().text().trim();
       if ((tabname == "index.htm" || tabname == "index.html") && injectIntoIndex)
       {
           if (tabcode.toLowerCase().indexOf("</html>") != -1)
           {
               tabcode = tabcode.replace(/<\/html>/i,injectIntoIndex+"\n</html>");
           }
           else
           {
               tabcode += "\n"+injectIntoIndex;
           }
       }
       newcode += tabname+"\n***CODE***\n"+tabcode+"\n";
       newcodeAsArray.push(tabcode);
       tabNamesAsArray.push(tabname)
    });
    if (asArray) return [newcodeAsArray,tabNamesAsArray];
    return newcode;
}

function saveState(s)
{
    var sectionNo = (s) ? s : getCurrentSectionNo();
    var code = editor.getValue();
    // tabs!
    if ($("#code-titlebar div.tab").length != 0) code = getTabBundleCode();
    
    
    var courseNo = $("#courseNo.parameter").text().trim();
    var lessonNo = $("#lessonNo.parameter").text().trim();

    if (sectionNo !== lastSaveStateSectionNo)
    {
        $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-lastnav", sectionNo, {expires: 365, path: '/'});
        lastSaveStateSectionNo = sectionNo;
    }

    if (code != lastSaveStateCode)
    {
        $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-code",code, {expires: 365, path: '/'});
        lastSaveStateCode = code;
    }
}

function contentNav(sectionNo,delay,nosave)
{
    var d = delay;
    if (delay == undefined) d = 500;
    $("#navbar div.navitem").removeClass("selected");
    $("#navbar div#navitem"+sectionNo).addClass("selected");    
    //console.log($("#navbar div#navitem"+sectionNo)[0].className);
    $("#content .section.selected").fadeOut(d,function(){
       $(this).removeClass("selected");
       $("#content .section").eq(sectionNo).fadeIn(d,function(){
           try
           {
              resizeFakeDocs();
              updateVisibleFakeDoc();
           } catch (e) {}
       });
       $("#content .section").eq(sectionNo).addClass("selected");
       resize();
       if (!nosave) saveState();
    });
    if (delay == 1)
    {
        try
        {
           resizeFakeDocs();
           updateVisibleFakeDoc();
        } catch (e) {}
    }
    LOGsessionNav();
    document.location.hash = "#"+(parseInt(sectionNo)+1);
}

function hiddenRun(code,test,codefortest)
{
    // fudge console.log to println
    code = code.replace(/console\.log/g,"println");
    // fudge prompt to input
    code = code.replace(/prompt/g,"input");
    if (codefortest != undefined) codefortest = codefortest.replace(/console\.log/g,"println");
    
    if ($("div.parameter#language").text().trim() == "carol")
    {
        var carolLanguage = [];

        for (var x in carol) carolLanguage[carolLanguage.length] = x;
        for (var i = 0; i < carolLanguage.length; i++)
        {
            /*
            if (carolLanguage[i].charAt(0) == "X")
            {
                var re = new RegExp(""+carolLanguage[i].substr(1)+"(.*)?;","g");
                code = code.replace(re,"if ((temp = carol.X"+carolLanguage[i].substr(1)+"$1) != undefined) throw new Error(temp); ");
            }
            else
            {
                var re = new RegExp("("+carolLanguage[i]+"(.*)?;)","g");
                code = code.replace(re,"carol.$1");
            } */

            var re = new RegExp("("+carolLanguage[i]+"(\\(.*?\\)))","g");
            code = code.replace(re,"func = function(a,b,c,d,e) { try { return carol.$1; } catch (e) { throw new Error(e.message); } }()  ");
        }
        code = "carol.initialiseCarol("+test+"); "+code;
    }

    if ($("div.parameter#codehalt").text().trim() == "false")
    {
        document.getElementById("nohalt").value = "true";
    }
    else
    {
        document.getElementById("nohalt").value = "false";
    }
    code += "\n\n\n";
    document.getElementById("codeinput").value = code;
    if (codefortest != undefined)
    {
        document.getElementById("codefortest").value = codefortest;
    }
    else
    {
        document.getElementById("codefortest").value = "";
    }
    document.forms[0].action = contextPath+"/RunPage";
    document.forms[0].submit();
    disableRun();
}

function run()
{    
    saveState();
    var code = editor.getValue();
    for (i = 0; i < editor.lineCount(); i++)
    {
        editor.setLineClass(i,null)
    }
    if ($("div.parameter#language").text().trim() == "basic")
    {
        basic.runbasic(code);
        // logging is done over in basic.sjs
    }
    // java from server side
    else if ($("div.parameter#language").text().trim() == "javaserver")
    {        
        javaserver.runjavaserver(code);
        // TODO: logging
    }
    else if ($("div.parameter#language").text().trim() == "java")
    {
        runjava();
    }
    // CAROL
    else if ($("div.parameter#language").text().trim() == "carol")
    {
    	/* Ugly hack to prevent people using move(x) in actual code */
    	code = code.replace(/move\(.+\)/g,"move(!)");
    	/* Should result in a syntax error on whatever line has move(x) */
    	
        $("div#output-outer").css("height","120px");
        $("div#editor-wrapper").css("bottom","120px");
        $("#editor-wrapper").css("height","");
        editor.refresh();
        resize();
        hiddenRun(code);
        LOGrun(code);
    }
    // pcode
    else if ($("div.parameter#language").text().trim() == "pcode")
    {                
        runpcode(code);
    }
    else if ($("div.parameter#language").text().trim() == "fullweb")
    {
        runFullWeb(getTabBundleCode());
    }
    else // plain ol' JS
    {
        var $fakedoc = $("div.fakedoc");
        if ($fakedoc.length != 0)
        {
            // if we have a fakedoc,
            // we can resize the output and code windows seeing as how we won't be
            // using the former too much
            $("div#output-outer").css("height","120px");
            $("div#editor-wrapper").css("bottom","120px");
            $("#editor-wrapper").css("height","");
            editor.refresh();
            resize();
            
            // but we should also check that they have the right fakeDocs on screen
            if ($("div.fakedocwrapper.onscreen").size() == 0 && code.indexOf("document") != -1)
            {
            	alert("You don't seem to have an HTML fragment on the screen to run your code against. Make sure you scroll the page so that the correct HTML fragment for your exercise is visible before running your code.");
            	return;
            }
            if ($("div.fakedocwrapper.onscreen").size() > 1 && code.indexOf("document") != -1)
            {
            	alert("You have two HTML fragments on the screen at once. Select which one you want to run your code against by clicking it before hitting the run button.");
            	return;
            }
            
        }
        var oldcode = code;
        code = code.replace(/document/g,"parent.visibleFakeDoc");
        // wrap try catches around onclicks to catch errors in event-prompted functions
        code = code.replace(/\.onclick\s*\=\s*(.*)\s*;/g,".onclick = function() { try { $1.call(this) } catch (e) { logError(e) } };");                
        
        hiddenRun(code);        
        LOGrun(oldcode);
    }    
}

function runFullWeb(code,logcode)
{
    if (!logcode) logcode = code;
    document.getElementById("codeinput").value = code;
    document.forms[0].action = contextPath+"/RunFullWeb";
    document.forms[0].submit();
    LOGrun(logcode);
}

function save(tabs)
{
    var code = editor.getValue();
    var language = $("div.parameter#language").text().trim();
    document.getElementById("codeinput").value = (tabs) ? getTabBundleCode() : code;
    
    if (language.slice(0,4) == "java" && !tabs)
    {
        saveState();
        filename = getClassName(code);
        if (filename)
        {
            filename += ".java";
            saveState();
            innerSave(filename);
            return;
        }        
    }
    // if not Java, or pigin Java, or can't figure out the class name...
    var msg;
    var extension;
    if (language.slice(0,4) == "java" && $("div.parameter#multi").text().trim() == "true" && !tabs)  
    {
        msg =    
        "Unable to determine the class name from your code - please a filename to save your file as.<br/>&nbsp;<br/>"+
        "Note that in Java, you MUST save the file with the same name as your class name. So, for example, "+
        "if your class is called or is going to be called <b>HelloWorld</b>, then you must save your file "+
        "as <b>HelloWorld.java</b>. <b>HELLOWORLD.JAVA</b>, <b>helloworld.java</b> or <b>flibble.java</b> "+
        "would not compile."
        extension = ".java";
    }
    else if (tabs)
    {
        msg = "Enter a filename to save your ZIP file as"
        extension = ".zip";
    }
    else
    {
        msg = "Enter a filename to save the file as";
        extension = ".noob";
        // add watermarking
        document.getElementById("codeinput").value = code+"<noob>"+watermark+"</noob>";
    }
    apprise(msg,{'input':true},function(r){
       var filename;
       if (r)
       {
           filename = r;
           if (filename.slice(-extension.length).toLowerCase() != extension)
           {
               filename = filename + extension;
           }
           saveState();
           innerSave(filename,tabs);
       }
    });
    
    function innerSave(filename,tabs)
    {
        document.getElementById("filename").value = filename;
        if (tabs)
        {
            document.getElementById("tabs").value = "true";
        }
        else
        {
            document.getElementById("tabs").value = "";
        }
        document.forms[0].action = contextPath+"/SaveAs";
        document.forms[0].submit();
    }
}

function clearEditor()
{
    apprise("Are you sure you want to clear the code pane? If you have not saved your work, you will lose any code currently entered.",
            {verify:true}, function(r){
                if (r) editor.setValue("");
                LOGcodeClear();
            });
}


function stop()
{
    if ($("div.parameter#language").text().trim() == "javaserver")
    {       
            $.ajax({
                type : "POST",
                url : contextPath + "/JavaRunner?mode=sendstop",
                success : function(r) {
                    enableRun();
                }
            });
    }
    else if ($("div.parameter#language").text().trim() == "java")
    {
        // send a rogue command to the console - should simulate pressing
        // return, just in case we're sitting waiting for input...
        try { outputframe.controller.commandHandle("fnar"); } catch (e) {};
        outputframe.stopRequested = true;
        enableRun();
    }
    else
    {
        outputframe.halt = true;
        enableRun();
    }    
}
function enableRun()
{
    document.getElementById("stopbutton").disabled = true;
    document.getElementById("runbutton").disabled = false;
}
function disableRun()
{
    document.getElementById("stopbutton").disabled = false;
    document.getElementById("runbutton").disabled = true;
}
function highlightLine(lineno)
{
    editor.focus(); 
    editor.setCursor(lineno);
    editor.setLineClass(lineno,"error");
}

function resize()
{
    var wrapperHeight = $("#output-inner").css("height");
    $("#outputframe").css("height",wrapperHeight);
    return;
    // old
   var posOfOutput = $("#output-outer").offset().top;
   var posOfEditor = $("#editor-wrapper").offset().top;
   var posOfEditorX = $("#editor-wrapper").offset().left;
   var heightOfTitleBar = $("#code-titlebar").height();
   var newHeight = posOfOutput - posOfEditor - heightOfTitleBar;
   var newBigHeight = posOfOutput - posOfEditor + heightOfTitleBar;
   $("#editor-wrapper").css("height",newHeight+"px");
   $("#outputframe").css("height",newBigHeight+"px");
   $("#output-main").css("height",newBigHeight+"px");
   $("#content").css("width",posOfEditorX+"px");
   resizeFakeDocs();
}

function handlePrettyPrintPlus()
{
   $("pre.codepaste").click(function(){
       codePaste($(this));
   });
   $("pre.codepaste").wrap("<div class=\"precodepaste\" style=\"position: relative\">");
   $("pre.nopaste").wrap("<div class=\"prenopaste\" style=\"position: relative\">");
   $("div.precodepaste").append("<span class=\"clickage\" style=\"position: absolute; right: 0px; top: 0px; font-size: 11px; padding: 3px; background-color: gray; color: white; z-index: -50;\">CLICK CODE TO PASTE &gt;&gt;&gt;</span>");
   $("pre.codepaste").css("cursor","hand");
   $("pre.codepaste").css("cursor","pointer");
   $("pre.codepaste,pre.nopaste").each(function(){
            var code = getCode(this).trim();
            var lines = (code.match(/\n/g) == null) ? 0 : code.match(/\n/g).length;
            var html = "";
            for (var i = 0; i < lines+1; i++)
            {
                    html += (i+1)+"<br/>";
            }
            $(this).parent().prepend("<div class=\"linenos\">"+html+"</div>");
   });   
   
   if ($("div.parameter#multi").text().trim() == "true")
    {
        $("div.codebundle").each(function(i,source){
           // hide any existing contents
           $(this).children().hide();
           $(this).css("position","relative");
           $(this).append('<img src="'+contextPath+'/images/bundle_icon.png" style="position: absolute; top: -10px; left: 5px"/>');
           $(this).append('<div style="margin-left: 75px">This is a code bundle.<br/><b>Click to paste the code into the editor &gt;&gt;&gt;</b></div>');
           $(this).css("cursor","pointer");
           $(this).click(function(){ pasteCodeBundle(source); })
        });
    }
}

function pasteCodeBundle(source)
{
    apprise("Pasting this code bundle into the editor will overwrite any existing code. Be sure to save ALL your work first! Use the <i>Save all as zip</i> if you're slightly unsure!<p>Are you sure you want to proceed?</p>",{verify:true},function(r){
        if (r)
        {
            // delete existing tabs
            $("div.tab").not(".newtab").remove();            
            $(source).find("pre.codefile").each(function(){
                var code = getCode(this);
                var tabname = $(this).attr("data-filename").trim();
                addNewTab(true);
                $("div.tab.selected").text(tabname);
                editor.setValue(code);
            });
            // select first tab
            $("div.tab").not(".newtab").eq(0).click();
            
            lastcode = getTabBundleCode(); // lev index
            LOGcodePaste(lastcode);
        }
    });
}

function selectEditorTab(source)
{
    // if already selected, return...
    if (!$(source).hasClass("selected"))
    {
        //otherwise...
        // put code in existing tab into a hidden pre.code
        var newpre = $('<pre class="code"/>');
        newpre.text(editor.getValue());
        $("#code-titlebar div.tab.selected").append(newpre);
        // put current cursor position into a hidden span.cursor - and killed selected while we're here...
        $("#code-titlebar div.tab.selected").removeClass("selected")
                .append('<span class="cursor">'+editor.getCursor().line+","+editor.getCursor().ch+"</span>")
        // pull code out of destination tab
        var code = "";
        var y = 0;
        var x = 0;
        if ($(source).find("pre.code").length != 0)
        {
            code = getCode($(source).find("pre.code")[0]);
            var spancursor = $(source).find("span.cursor").text().trim().split(",");
            y = spancursor[0];
            x = spancursor[1];        
        }
        editor.setValue(code);
        editor.setCursor(y,x);
        // select
        $(source).addClass("selected");
        // remove code in destination tab
        $(source).find("pre.code").remove();
        $(source).find("span.cursor").remove();
    }
    var name = $(source).text().trim();
    if (name.slice(-4) == ".htm" || name.slice(-5) == ".html")
    {
        editor.setOption("mode","text/html");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){validXHTML();});
        $("input#tidy").show();
        $("input#tidy").val("Validate");
    } 
    else if (name.slice(-4) == ".css")
    {
        editor.setOption("mode","text/css");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){tidyCode();});
        $("input#tidy").hide();
        $("input#tidy").val("Tidy");
    }
    else if ($("div.parameter#language").text().trim() == "fullweb")
    {
        editor.setOption("mode","javascript");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){tidyCode();});
        $("input#tidy").show();
        $("input#tidy").val("Tidy");
    }
}

function deleteSelectedEditorTab()
{
    if ($("#code-titlebar div.tab").not("newtab").length < 2) return; // can't delete final tab
    apprise("Do you really want to remove this tab and any code within it? If you have not saved it, any code will be lost!", {verify:true},function(r){
          if (r) {              
              // find nearest tab to the left... unless we're the first one, in which case to the right...
              var nearest = $("#code-titlebar div.tab.selected").prev("div.tab");
              if (nearest.length == 0) nearest = $("#code-titlebar div.tab.selected").next("div.tab");
              $("#code-titlebar div.tab.selected").remove();
              nearest.click();
          }
    });
}

function populateTabs(data)
{
    if (typeof data == "string")
    {
        // extract constituent bits out of oldcode
        var oldCode = data;
        var bits = oldCode.split("***TAB***");
        // drop first one - will always be empty
        bits.shift();

        data = [];
        $.each(bits,function(i,bit){
            var datum = bit.split("***CODE***");
            data.push(datum);                    
        });                               
    }
    
    // wipe out existing tabs
    $("#code-titlebar div.tab").not("div.newtab").remove();
    $.each(data,function(i,tab){
        var newtab = $('<div onclick="selectEditorTab(this)" class="tab">'+tab[0].trim()+'</div>');
        // put code in existing tab into a hidden pre.code
        var newpre = $('<pre class="code"/>');
        newpre.text(tab[1].trim());
        $(newtab).append(newpre);
        $(newtab).append('<span class="cursor">0,0</span>');
        $("#code-titlebar div.newtab").before(newtab);
    });
    // click on the first one
    $("#code-titlebar div.tab").eq(0).click();
}

function submitWork(source,oneOnly)
{
    $(source).text("Submitting your work...");
    setTimeout(function(){
        // get params from source
        var id = $(source).attr("data-box");

        var tabcodes = [];
        if ($("#code-titlebar div.tab").length == 0)
        {
            tabcodes.push([id,editor.getValue()]);
        }
        else
        {        
            $("#code-titlebar div.tab").not("div.newtab").each(function(i,tab){
                var onetab = editor.getValue();
                var title = $(tab).contents().eq(0).text();
                if (!$(tab).hasClass("selected"))          
                {
                    onetab = getCode($(tab).find("pre.code")[0]);                
                }
                tabcodes.push([title,onetab]);
            });
        }

            //    String code = request.getParameter("codeinput");
            // String dir = request.getParameter("submitid");
            // String tabname = request.getParameter("tabname");        

        var d = new Date();
        var dd = ("0"+d.getDate()).slice(-2);
        var mm = ("0"+d.getMonth()).slice(-2);
        var yy = ("0"+d.getYear()).slice(-2);
        var hh = ("0"+d.getHours()).slice(-2);
        var mins = ("0"+d.getMinutes()).slice(-2);
        var secs = ("0"+d.getSeconds()).slice(-2);
        var datestamp = hh+mins+secs+dd+mm+yy;

        // now, write code to disk
        $.each(tabcodes,function(i,tabcode){

            var data = {
                    code : tabcode[1],
                    dir : id+"-"+datestamp,
                    tabname : tabcode[0]                
                };

            $.ajax({
                data : data,
                async : false,
                type : "POST",
                url : contextPath + "/SubmitWork"
            });

        });

        if (oneOnly)
        {
            $(source).text("You have successfully submitted your work");
            $(source).prop("onclick", null);
            $(source).css("color","gray");
        }
        else
        {
            $(source).text(">>> You have already submitted this, but can submit it multiple times. Click here to submit again. <<<")
        }
    },1000);
   
}

function validXHTML()
{
    run();
    setTimeout(function(){
        var loc = encodeURIComponent($("iframe#outputframe")[0].contentWindow.location.href);
        $("iframe#outputframe")[0].src = "http://validator.w3.org/check?uri="+loc;
    },2000);
}

function toggleOptions()
{    
    $(document).unbind("mouseup");
    if ($("div#usermenu").is(":hidden"))
    {
        $("div#usermenu").show();
        $(document).mouseup(function (e)
        {
            var container = $("div#usermenu");

            if (container.has(e.target).length === 0 && e.target.id != "logoutitem")
            {                
                toggleOptions();
            }
        });
    }
    else
    {
        $("div#usermenu").hide();
        return false;
    }
    
}

function tidyCode()
{
    code = js_beautify(editor.getValue());
    editor.setValue(code);
}

function logout()
{
    LOGloggedOut();
    $("div#reallogout").html('<span style="color: gray">Logging out...</span>');    
    setInterval(function() { window.location = contextPath+"/Login?logout=true"; },2000);
}

function addNewTab(auto)
{
    if ($("div.parameter#language").text().trim() == "fullweb" && !auto)
    {
        var tabName = "";
        var msg = "What do you want to call the new tab? Include the file extension."+
                  "<p>Note that the name you give will indicate what kind of file it will be. If you "+
                  "want it to be an HTML file, give it an extension of <code>.html</code> or <code>.htm</code>. "+
                  "If you want it to be a Javascript file, use <code>.js</code> and if it's CSS, use "+
                  "<code>.css</code></p>"+
                  "<p>If you do not specify an extension, <code>.html</code> will be assumed.</p>";
        apprise(msg,{'input':true},function(r){            
            if (r)
            {
                tabName = r;
                var extension = tabName.split(".");
                extension = extension[extension.length-1];
                if (extension != "htm" && extension != "html" && extension != "css" && extension != "js")
                {
                    tabName += ".html";
                }
            }
            inner(tabName);
         });         
    } 
    else
    {
        var tabNos = 1;            
        while ($("#code-titlebar div:contains(Tab "+tabNos+")").length != 0)
        {
            tabNos ++;                
        }
        tabName = "Tab "+tabNos;
        inner(tabName);    
    }
    
    function inner(tabName)
    {
        var newtab = $('<div onclick="selectEditorTab(this)" class="tab">'+tabName+'</div>');
        $("#code-titlebar div.newtab").before(newtab);
        $(newtab).click();
    }
}

$(document).ready(function()
{           
   var title = $("div.parameter#lessonName").text().trim();
   if (title.length == 0) title = "NoobLab";
   window.document.title = title;
   ﻿$(outputframe.document.body).css("background","transparent");
   resize();
   
   prettyPrint();
   createQuickQuizzes();
   createEmos();

   // test cases
   if ($("div.parameter#language").text().trim() == "basic")
   {
       handleTestCasesBasic();
   }
   else if ($("div.parameter#language").text().trim() == "java")
   {
       handleTestCasesJava();
   }   
   else if ($("div.parameter#language").text().trim() == "fullweb")
   {
       handleTestCasesHtml();
   }
   else handleTestCases(); 
  
   if ($("div.parameter#language").text().trim() == "java")
   {
       $("iframe#outputframe").attr("src",contextPath+"/doppio");
       if ($.browser.msie)
       {
           alert("You are using Internet Explorer, in which this material will not function properly. You will "+
                   "need to use a standards-compliant browser, such as Chrome, Safari or Firefox.");
       }
   }
   
   if ($("div.parameter#language").text().trim() == "pcode" || $("div.parameter#language").text().trim() == "basic")
   {
       // hide the tidy button (cos it'll make no sense of either of these languages!
       $("input#tidy").hide();
       // and turn off code highlighting and autoindenting
       // as it makes equally no sense
       editor.setOption("mode","text/plain");
   }      

    if ($("div.parameter#multi").text().trim() == "true" ||  $("div.parameter#language").text().trim() == "fullweb")
    {
        // multi file editor
        // hide clear button
        $("input#clearbutton").hide();
        // show save all button
        $("input#saveallbutton").show()

        $("#code-titlebar").css("text-align","left");
        $("#code-titlebar").empty();
        $("#code-titlebar").append('<div onclick="deleteSelectedEditorTab()" class="tabdelete">X</div>');
        $("#code-titlebar").append('<div class="tab newtab" onclick="addNewTab()">+</div>');
        $("#code-titlebar").append('<div style="clear: both"></div>');
        addNewTab(true);
        $("#code-titlebar div.tab").eq(0).click();        
    } 
    // if no multitabs but using Java, add the skeleton class around the editor
    else if ($("div.parameter#language").text().trim() == "java")
    {
       $("div.CodeMirror").prepend('<pre class="javastatic">import java.util.Scanner;\n\npublic class SomeJavaCode\n{\n  public static void main(String[] args)\n  {</pre>');
       $("div.CodeMirror").append('<pre style="padding-bottom: 5px" class="javastatic">  } // end of main method\n} // end of class</pre>');
    }
    
    if ($("div.parameter#language").text().trim() == "fullweb")
    {
        // make default one index.html
        $("div.tab").eq(0).contents().eq(0).replaceWith("index.html");
    }
    
    if ($("div.parameter#lectureSlideUrl").length != 0)
    {
        // add an extra link into the nav bar
        $("div#navbar").append('<div id="navlecture" class="navitem"><a class="iframe" href="'+$("div.parameter#lectureSlideUrl").text().trim()+'">Lecture Slides</a></div>');
    }
    
     // make any offsite links display in colourbox iframe
   $("a.iframe").colorbox({iframe:true, width:"80%", height:"80%"});
   $("a.medallink").colorbox({width: "600px", maxWidth : "600px", maxHeight: "80%",
                                onComplete : function() { 
                                    //$(this).colorbox.resize(); 
                               }
                            });
   
   handlePrettyPrintPlus();
   createFakeDocs();   
   var courseNo = $("#courseNo.parameter").text().trim();
   var lessonNo = $("#lessonNo.parameter").text().trim();
   var lastSectionNo = $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-lastnav");
   var oldCode = $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-code");
   if (oldCode == null) oldCode = "";
   

   // reset check every 60 seconds to see if state needs saving
   saveInterval = setInterval(function() {saveState();},60000);
   
   var hash = document.location.hash;   
   if (hash != "") 
   {
       hash = parseInt(hash.slice(1));
       if (isNaN(hash)) { hash = 0; } else { hash--; }
   }
   else hash = 0;      
   contentNav(hash,0,true);
   
   if ((lastSectionNo != null && lastSectionNo != 0 && lastSectionNo.length != 0) || oldCode != "")
   {       
       if (isNaN(lastSectionNo) || lastSectionNo.length == 0) lastSectionNo = 0;
       clearInterval(saveInterval);
       var msg = "Do you want to resume from where you last left this lesson?";
       if (hash != 0) msg = "Do you want to restore the code you had when you were last on this lesson?";
       apprise(msg, {verify:true},function(r){
          if (r) {        
            //LOGcodePaste(oldCode,"FromPreviousSession");
            if ($("div.parameter#multi").text().trim() == "true")
            {                                                  
                populateTabs(oldCode);                                
            }
            else editor.setValue(oldCode);
            lastSaveStateCode = oldCode;
            lastcode = oldCode; // levenshtein index code
            if (hash == 0)
            {                
                contentNav(lastSectionNo,1,true);
                lastSaveStateSectionNo = lastSectionNo;
            }
            else lastSaveStateSectionNo = hash;
            
            // reset check every 60 seconds to see if state needs saving
            saveInterval = setInterval(function() {saveState();},60000);
          }
          else
          {
            // reset check every 60 econds to see if state needs saving
            saveInterval = setInterval(function() {saveState();},60000);
          }

          // kludge. Have no idea why this is needed.
          // Otherwise, the resize seems to get lost somewhere
          // in the bazillion callbacks that are going on.
          setTimeout(function() {resize()},100);
       });
   }

   // if IE, shrink all pres and codes by .1 em
   // GRRRRRRR.
   /*if ($.browser.msie)
   {
       $("pre,code,div.precodepaste div.linenos,.CodeMirror").each(function(){
          var currentPx = $(this).css("font-size");
          var currentEm = ($(parseInt(currentPx)).toEm(this));
          var newEm = parseInt(currentEm) - 0.1;
          $(this).css("font-size",newEm+"em");
       });
   }*/
   
   // update test case divs with "you've done this one already" messages
   // where appropriate
   updateTestCases();
   
   // update local stash of previous log entries
   $.getJSON(contextPath+"/stats?type=last20",function(result){
       lastLogEntries = result;
   });
   
   // install logging for copy and paste
   $("div.CodeMirror textarea").on('paste', function(e) {
       var currentCode = editor.getValue();
       setTimeout(function(){
            var newCode = editor.getValue();
            if (getLevenshteinDistance(currentCode, newCode) > 500)
            {
                LOGcodePaste(newCode,"Large");
            }
            
            lastcode = newCode; // levenshtein index code
       },500); // give it half a second so we can read what we've got
    });
    
    // install logging for scroll
    $(document).ready(function(){
        setTimeout(function(){
            setInterval(function(){
                var current = $(window).scrollTop();
                if (lastScroll != current)
                {
                    var distance = current-lastScroll;
                    lastScroll = current;
                    LOGcontentScroll(distance);
                }
            },10000);
        },3000);
      });
      
      // prevent copy/paste from content window.
      $("div#content").attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .css("-moz-user-select","none")
                 .on('selectstart', false);

   // disable right-click
   $(document).ready(function()
    {
       $(document).bind("contextmenu",function(e){
            return false;
          });
    });
    
    // change colour of background if slacker       
    $.get(contextPath+"/slackers.txt", function(data) {
  		var x = "";
  		for (var i = 32; i < watermark.length; i = i + 33) x+= watermark.charAt(i);
  		if (data.indexOf(x) != -1)
  		{
  			$("div#content").css("background-color","#FFCCCC");
  		}
	});

});


$(window).resize(function() {

        //confirm window was actually resized
        if($(window).height()!=lastWindowHeight || $(window).width()!=lastWindowWidth){

            //set this windows size
            lastWindowHeight = $(window).height();
            lastWindowWidth = $(window).width();

            //call my function
            resize();
        }


});
