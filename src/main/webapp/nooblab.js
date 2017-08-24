var lasttestlink = 0;

var linecount = 1;

var emolevel = 5;

var carolImage = "carol";

///// de-crap IE
String.prototype.trim = function() {
    return $.trim(this)
}

///// taken from https://stackoverflow.com/questions/10983066/use-full-width-excluding-overflow-scrollbar-with-position-absolute
// Adds scrollbar width to window

$(function() {
  var $container = $("<div>").css({ height: 1, overflow: "scroll" }).appendTo("body");
  var $child = $("<div>").css({ height: 2 }).appendTo($container);
  window.SCROLLBAR_WIDTH = $container.width() - $child.width();
  $container.remove();
});

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

// assists object
var assists = {};

// last scroll pos
lastScroll = 0;

// last 20ish lines of the log file
lastLogEntries = [];

// Blockly
Blockly = null;

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function(c) {
    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
}

function getCode(e)
{

    if ($(e).attr("data-preid"))
    {
        return originalTexts[$(e).attr("data-preid")];
    }
    
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
            javaPidjinCodeWrapper(true);
            LOGcodePaste(actualCode);
            lastcode = actualCode; // levenshtein index code
	    editor.setOption("readOnly");
            if (editor.getValue().indexOf("NOOBLAB READONLY") != -1) editor.setOption("readOnly","true");
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
    if (foundCarol.length == 0) return undefined;

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
    if ($("div.parameter#kinder").text().trim() != "true")
    {  
	$(caroldiv).click(function(){ buildCarolDiv(this)});
    }
    var st = $(window).scrollTop();

    var carolsize = $(caroldiv).find("div.size").css("display","none")
                        .text().trim();
    if (carolsize == "") carolsize = "16";
    carolsize = parseInt(carolsize);
    var carolpercent = 1/carolsize*100;       

    // kill any existing carol DOM... just in case
    $(caroldiv).find(".carolwrapper").remove();
    $(caroldiv).find(".programbar").remove();
    $(caroldiv).width("");

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

    // get highlights positions
    var hl = $(caroldiv).find("div.highlights").text().trim();
    var hl2 = hl.split(";");
    if (hl2[0] == "") hl2 = [];
    var highlights = {};
    $(caroldiv).find("div.highlights").css("display","none"); // hide pickups div when done
    for (var i = 0; i < hl2.length; i++)
    {
	var h = hl2[i].split(",");
        var colour = "#fbca51";
        if (h.length > 2) colour = h[2];
	highlights[h[0]+","+h[1]] = colour;
    }

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

    var carolwidth = $(window).height() * 0.6;
    if (carolwidth > $("div#content").width()) carolwidth = $("div#content").width()*0.8;
    carolwidth = parseInt(carolwidth);

    if ($(caroldiv).attr("data-size") != undefined) carolwidth = $(caroldiv).attr("data-size");

    // set up the board.
    for (var y = 0; y < carolsize; y++)
    {
        for (var x = 0; x < carolsize; x++)
        {
            var square = $('<div class="carolsquare carolpos'+x+"-"+y+'"></div>');
            square.css("width",carolpercent+"%");
            square.css("height",carolpercent+"%");
	    var fontheight = carolwidth/carolsize/5;
            square.css("font-size",fontheight+"px");
	    square.css("line-height",carolwidth/carolsize+"px");
            if (obstacles.indexOf(";"+x+","+y+";")!= -1) square.addClass("blocked");
            if (pickups.indexOf(";"+x+","+y+";")!= -1)
            {
                square.addClass("pickup");
                square.html(pickupNo);
                pickupNo++;
            }

	    if (highlights[x+","+y] != undefined)
	    {
		square.css("background-color",highlights[x+","+y]);
	    }


            if (goalX == x && goalY == y) square.addClass("goal");
            $(surroundingDiv).append(square);
        }
    }

    $(surroundingDiv).find(".carolpos"+startX+"-"+startY).html('<img class="carol" src="'+contextPath+'/images/'+carolImage+'-right.png"/>');
    $(caroldiv).append(surroundingDiv);

    $(caroldiv).find(".carolwrapper").css({width : carolwidth+"px", height : carolwidth+"px"});

    // if we're in kinder mode, add the kinder bar to the Carol
    if ($("div.parameter#kinder").text().trim() == "true")
    {
        var bar = $('<div class="kinderbuttons"></div>');
        bar.append('<img src="'+contextPath+'/images/arrow-up.png"/>');
        bar.append('<img src="'+contextPath+'/images/arrow-down.png"/>');
        bar.append('<img src="'+contextPath+'/images/arrow-left.png"/>');
        bar.append('<img src="'+contextPath+'/images/arrow-right.png"/>');

        if ($("div.parameter#kinderlevel").text().trim() != "" && $("div.parameter#kinderlevel").text() >=2)
        {
            bar.append('<img class="go" src="'+contextPath+'/images/go.png"/>');
        }

        var bits = bar.find("img").length;
        var imgwidth = 100/bits;
        bar.find("img").css({
                               "width":imgwidth+"%",
                               "box-sizing" : "border-box",
                               "padding": "5%",
                               "background-color" : "white",
                               "border" : "1px solid gray",
                               "margin-top" : "10px",
                               "cursor" : "pointer"
                            });
        bar.find("img").not(".go").click(function(){
                           kinderCarolCode(this); 
                        });
        bar.find("img.go").css("padding","3%");
        bar.find("img.go").click(function(){
            runCarolKinder();
        })
        $(caroldiv).find(".carolwrapper").append(bar);

        // and a code bar
        // will be the width of 1 arrow

        var caroldivWidth = $(caroldiv).outerWidth();
        var arrowWidth = $(caroldiv).find("div.kinderbuttons img").eq(0).outerWidth();
        var realWidth = $(caroldiv).find("div.kinderbuttons img").eq(0).width();
        caroldivWidth += arrowWidth;
        $(caroldiv).width(caroldivWidth);

        var programbar = $('<div style="position: relative" class="programbar">');
        programbar.css({
                               "width":arrowWidth+"px"                             
                       });

        $(caroldiv).prepend(programbar);
        $(caroldiv).append('<div style="clear: both"></div>');
    }
    
    $(caroldiv).attr("data-size",carolwidth);

    $(window).scrollTop(st);

}

function kinderGloriousWinTestCode()
{
    var win = "if (atGoal())                                                   \n\
    {                                                               \n\
        parent.$('audio#winsound')[0].play();                         \n\
        parent.$('img.carol').animateRotate(0,5000,10000);\n\
        hold(9000);  \n\
        if (parent.$('div.parameter#nextexercise').text() != '')    \n\
        {\n\
            var currentUrl = parent.window.location.href;\n\
            currentUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));                                                           \n\
            parent.window.location.href = currentUrl+'/'+parent.$('div.parameter#nextexercise').text().trim();\n\
        }\n\
    }\n";

    if ($("div.parameter#kinderlevel").text().trim() == "" || $("div.parameter#kinderlevel").text().trim() >= 2)
    {
        win += 'else { parent.unhappyBilly(); hold(1000); carol.updateCarol(true); }';
    }
    return win;
}

function kinderCarolCode(source)
{
    var direction = $(source).attr("src").split("-")[1].split(".")[0];
   updateCarolProgramBar(direction);

    if ($("div.parameter#kinderlevel").text().trim() == "" || $("div.parameter#kinderlevel").text().trim() < 2)
    {
        var code = "setDelay(200);";
        code += "try { DIRECTION(); } catch (e) { parent.unhappyBilly(); hold(1000); carol.updateCarol(true); parent.$('.programbar').empty(); }\n";
        code += kinderGloriousWinTestCode();
        
        var code = code.replace("DIRECTION",direction);
        editor.setValue(code);
        $("input#runbutton").click();
    }
}

function runCarolKinder()
{
    // generate a program from the current programbar
    var program = "setDelay(200);\n";
    var currentCarol = getCarolDiv();
    var programlines = $(currentCarol).find(".programline");
    programlines.each(function(){
        var direction = $(this).find("img").attr("data-direction");
        var quantity = $(this).find("div.quantity").text().trim();
        program += "for (var i = 0; i < "+quantity+"; i++)\n";
        program += "{\n";
        if ($("div.parameter#kinderlevel").text().trim() >= 3)
	{
		if (direction == "up") program += "move();\n";
		if (direction == "down") program += "backwards();\n";
		if (direction == "right") program += "niblick();\n";
		if (direction == "left") program += "turnLeft();\n";
	}
	else
	{
		program += direction+"();\n";
	}
        program += "}\n";
    });
    program += kinderGloriousWinTestCode();

    program = "try { \n"+program+"}\n"+
              "catch (e) { parent.unhappyBilly(); hold(1000); carol.updateCarol(true); }\n";

    program = program.replace();
    editor.setValue(program);
    $("input#runbutton").click();
}

function unhappyBilly()
{
    $('audio#failsound')[0].play();
}

function updateCarolProgramBar(direction)
{
    var currentCarol = getCarolDiv();
    
    // get lastEntry
    
    var lastEntry = $(currentCarol).find(".programline").last();
    var lastDir = $(lastEntry).find("img").attr("data-direction");
    
    if (lastDir == direction)
    {
        // only need to increase the previous number
        var lastNo = $(lastEntry).find(".quantity").text().trim();
        lastNo++;
        $(lastEntry).find(".quantity").text(lastNo);
        return;
    }
    // otherwise...

    var newEntry = $('<div style="white-space: nowrap" class="programline"></div>');
    newEntry.append('<img data-direction="'+direction+'" src="'+contextPath+'/images/arrow-'+direction+'.png"/>');
    newEntry.append('<div class="quantity" style="display: inline-block">1</div>');

    var barwidth = $(currentCarol).find(".programbar").width();

    newEntry.find("img").css("height",(barwidth / 2)+"px");
    newEntry.find("div.quantity").css({
        "font-size" : (barwidth / 2)+"px",
        "color" : "#999",
        "font-family" : '"Comic Sans MS", cursive, sans-serif'
    });


    $(currentCarol).find(".programbar").append(newEntry);
    if ($("div.parameter#kinderlevel").text().trim() != "" && $("div.parameter#kinderlevel").text().trim() >= 2)
    {
        //$(currentCarol).find(".programbar .killkinder").remove();
        var wipecode = $(' <span class="killkinder">&#10007;</span>');
        wipecode.css({
            "color" : "red",
            "font-size" : (barwidth / 3)+"px",
            "cursor" : "pointer"
        });
        $(newEntry).append(wipecode);
        wipecode.click(function(){
            $(this).parent().remove();
        })
    }

    $(currentCarol).find(".programbar").animate({"scrollTop":  $(currentCarol).find(".programbar")[0].scrollHeight}, "slow");
}

function maxMinCodeWeb(outputheight,force)
{
	var editorpane = $("#editor-wrapper");
	var outputpane = $("#output-outer");
	var outputtop = Math.round(parseFloat($("#toolbar").height()));
	if (!editorpane.hasClass("maxed"))
	{
		editorpane.css("left","0px");
		editorpane.css("width","50%");
		editorpane.css("bottom","0px");
		outputpane.css("position","fixed");
		outputpane.css("top",outputtop+"px");
		outputpane.css("height","calc(100% - "+outputtop+"px)");
		outputpane.css("width","50%");
                $("div#horizontaldrag").css("right","calc(50%)");                
		$("div#toolbar").css("width","100%");
		$("div#logoutitem").hide();
	        $("div#navbar").hide();
        	$("div#logoutitem").hide();
        	$("body").css("overflow","hidden");
                $("span.maximisebutton").removeClass("fa-window-maximize");
                $("span.maximisebutton").addClass("fa-window-restore");
                //$("div#horizontaldrag").hide();
        	//$("span.maximisebutton").html("&#8744;");
		resize();
		editor.refresh();
		editorpane.addClass("maxed");
	}
	else
	{
                var right = parseInt($("div#horizontaldrag").css("right"));
                var left = window.innerWidth-right;
	        editorpane.css("left","");
                editorpane.css("width","");
                editorpane.css("bottom","");
                outputpane.css("position","");
                outputpane.css("top","");
                outputpane.css("height","");
                outputpane.css("width","");
                $("div#toolbar").css("width","");
                $("div#logoutitem").show();
                $("div#navbar").show();
                $("div#logoutitem").show();
                $("body").css("overflow","");
                //$("span.maximisebutton").html("&#8743;");
                $("span.maximisebutton").removeClass("fa-window-restore");
                $("span.maximisebutton").addClass("fa-window-maximize");
                var tbwidth = parseInt($("div#toolbar").css("width"));                
                //$("div#horizontaldrag").css("left",window.innerWidth-tbwidth);
                //$("div#horizontaldrag").show();                
                
                if ($("div#horizontaldrag").hasClass("changed"))
                {                    
                     var width = parseInt($("div#content").css("width")); 
                     width = window.innerWidth - width - 5;
                     $("div#editor-wrapper").css("width",width+"px");
                     $("div#toolbar").css("width",width+"px");
                     $("div#output-outer").css("width",width+"px");                     
                     $("div#horizontaldrag").css("right",width+"px");
                }
                
                resize();
                editor.refresh();
		editorpane.removeClass("maxed");

	}
}

function maxMinCode(outputheight,force)
{    
     if ($("div.parameter#language").text().trim() == "fullweb")
     {
        maxMinCodeWeb(outputheight,force);
        return;
     }

    // otherwise....


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
       // $("span.maximisebutton").html("&#8744;");
       $("span.maximisebutton").removeClass("fa-window-maximize");
       $("span.maximisebutton").addClass("fa-window-restore");
       $("div#horizontaldrag").hide();
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
       // $("span.maximisebutton").html("&#8743;");
       $("span.maximisebutton").removeClass("fa-window-restore");
       $("span.maximisebutton").addClass("fa-window-maximize");    
       
       if ($("div#horizontaldrag").hasClass("changed"))
       {
            var width = parseInt($("div#horizontaldrag").css("right")); 
            $("div#editor-wrapper").css("width",width+"px");
            $("div#toolbar").css("width",width+"px");
            $("div#output-outer").css("width",width+"px");
            $("div#content").css("right",width+"px");
       }
       
       $("div#horizontaldrag").show();       
        resize();
        editor.refresh();
    }
    sizeTabs();
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

    $("div#output-outer").css("height","220px");
    $("div#editor-wrapper").css("bottom","220px");

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
                    setTimeout(function(){resizeIframe(iframe)},200);
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
            $(this).parent().parent().find("div.fakedoc").show();
            setTimeout(function(){resizeIframe(iframe)},200);
        });
        $(this).parent().find("div.htmleditor").hide();
    });

    setTimeout(function(){
        updateVisibleFakeDoc();
        highlightCarols();
    } ,3000);
    $("div#content").scroll(function(){
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
        $("div#content").scroll(function(){
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
    if (message2 == undefined) message2 = "Tell us how you feel about that:";
    
    // if already asked, don't mess around with the how do you feel did...
    if ($(source).find("div.emotionselection div.message").text().trim() == message) return;
    
    // otherwise, blow away any existing how do you feels...
    $("div.emotionselection").not(".fixed").remove();
    var emotiondiv = $('<div class="emotionselection" style="margin-top: 0.8em"></div>');    
    
    emotiondiv.append('<div class="message" style="margin-bottom: 0.8em; margin-top: 0.8em">'+message+"</div>");
    
    
    emotiondiv.append('<div class="message2">'+message2+'</div>');        
    
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Happy</div><img src="'+contextPath+'/images/happy.jpg"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Surprised</div><img src="'+contextPath+'/images/surprise.jpg"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Afraid</div><img src="'+contextPath+'/images/fear.jpg"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Disgust</div><img src="'+contextPath+'/images/disgust.jpg"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Angry</div><img src="'+contextPath+'/images/anger.jpg"/></div>');
    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Unhappy</div><img src="'+contextPath+'/images/unhappy.jpg"/></div>');        

    emotiondiv.append('<div class="imgwrapper" style="display: inline-block; width: 44px; font-size: 60%; color: transparent"><div style="position: relative;">Other</div><img src="'+contextPath+'/images/other.png"/></div>');
    
    emotiondiv.append("<div>Type any extra thoughts below...</div>");
    emotiondiv.append('<textarea class="emothoughts" style="width: 90%; height: 5em; font-family: sans-serif"></textarea>');   

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
	    var that = this;
	  if (emotion != "other") {
            doIt();
	  }
          else
          { 
          	apprise("Please enter a single word to describe how you feel.", {'input':true}, function(r)
    		{
        		if(r)
        		{
				emotion = "*"+r;
				doIt();
				$(that).css("border-color","black");
            			$(that).closest("div").css("color","black");
				$(that).closest("div").find("div").text(r);
			}
		});
		$("div.appriseOuter").css("top","50%");
          }
	  
          function doIt()
          {
            var medalText = "";
            try { medalText = $(that).closest("div.testCase").attr("data-medal").split(":")[0]; } catch (e) {};
            var sourceId = $(that).closest("div.testCase").attr("data-id");
            if (sourceId == undefined) sourceId = ""; else sourceId = ":"+sourceId;
            if (medalText == "") medalText = "testOnly";                        
            if (recordThoughts)
            {
                emotion += ":"+$(that).closest("div.emotionselection").find("textarea.emothoughts").val();
                medalText = "endOfSection";
            }            
            sourceId = medalText+sourceId;
            logEmotion(shortmsg,emotion,sourceId);
            $(that).closest("div.emotionselection").find("img").not(that).not(".notransparent").css("opacity","0.3");
            $(that).closest("div.emotionselection").find("img").unbind();
            $(that).closest("div.testCase").attr("data-fails","0");        
            // ugly hack to make the message "different"
            $(that).closest("div.emotionselection").find("div.message").html("&nbsp;"+message+"&nbsp;");
            $(that).closest("div.emotionselection").find("div.message2").text("You said you felt");
            setTimeout(function(){
                $(source).find("div.emotionselection").hide(1000,function(){ $(source).find("div.emotionselection").remove(); });
                $.colorbox.close();
            },1000)
            e.stopPropagation();
	  }         
        });
    if ($(source).hasClass("emo")) {
        $(source).append(emotiondiv);
    }
    else // it's something that's been popped up due to an event, e.g. medal win/fail
    {
        emotiondiv.css("font-family","Verdana,sans-serif");
        emotiondiv.css("text-align","center");
        emotiondiv.css("padding-left","30px");
        emotiondiv.css("padding-right","30px");

        if (shortmsg.indexOf("medal") != -1)
        {
	    $(source).attr("data-fails","0");
            // medal
            shortmsg = shortmsg.replace("medal","").trim();
            emotiondiv.prepend('<p style="font-size: 130%; font-weight: bolder"><img class="notransparent" style="vertical-align: middle; height: 70px" src="'+contextPath+'/images/medal'+shortmsg+'.png"/> You won a '+shortmsg+' medal!</p>');
        }
        if (shortmsg.indexOf("repeatedFail") != -1)
        {
            // repeated fail medal
            emotiondiv.prepend('<p style="font-size: 130%; font-weight: bolder"><img class="notransparent" style="vertical-align: middle; height: 70px" src="'+contextPath+'/images/failed.png"/> Repeated activity failure</p>');
        }
        //source,message,shortmsg,message2,recordThought

        $.colorbox({inline : true, overlayClose : false, escKey : false,  href : emotiondiv, width: "50%", maxWidth : 600, onComplete : function (){ $(this).colorbox.resize(); $("div#cboxClose").hide(); } });
    }

     emotiondiv.find("textarea.emothoughts").click(function(event){            
            event.stopPropagation();
        });
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
    // legacy
    medalGreatSuccess(medal,fb);        
}

function medalGreatSuccess(medal,fb)
{
    if (typeof fb === "object") // array of feedbacks
    {
        var fbstr = "";
        for (var i = 0; i < fb.length-1; i++)
        {
            fbstr = fbstr + '<div style="margin-bottom: 1em">'+fb[i]+'</div>';
        }
        fbstr = fbstr + '<div>'+fb[i]+'</div>';
        fb = fbstr;
    }
    if (!fb) fb = ""; else fb += "&nbsp;</br/>";
    var iframeDoc = document.getElementById("outputframe").contentDocument;

    $("body",iframeDoc).append('<div id="testresult" style="font-family: monospace; font-weight: bold; position: fixed; border: 2px solid black; background-color: white; top: 10px; padding : 10px; width: 95%; box-sizing: border-box; color: green">'+fb+'Well done! Your work passed the test!</div>');

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
       parent.LOGtestPassed(medal);
       if (medal) howDoYouFeelAbout(lasttestlink,"Well done! Your code was good enough for a medal!",medalType);
       if (medal) parent.LOGmedal(medal);
}

function epicFailHtml(SUCCESSFULTESTS,NUMBEROFTESTS,fb)
{
    // legacy
    medalEpicFail(SUCCESSFULTESTS,NUMBEROFTESTS,fb);
}

function medalEpicFail(SUCCESSFULTESTS,NUMBEROFTESTS,fb)
{
        if (typeof fb === "object") // array of feedbacks
        {
            var fbstr = "";
            for (var i = 0; i < fb.length-1; i++)
            {
                fbstr = fbstr + '<div style="margin-bottom: 1em">'+fb[i]+'</div>';
            }
            fbstr = fbstr + '<div>'+fb[i]+'</div>';
            fb = fbstr;
        }
	if (!fb) fb = ""; else fb += "&nbsp;</br/>";
	if (fb.trim() != "")
	{
		parent.$("#output-outer").css("height","");
		parent.$("#editor-wrapper").css("bottom","");
		parent.$("#editor-wrapper").css("height","");
		parent.resize();
	}
    var iframeDoc = document.getElementById("outputframe").contentDocument;

    $("body",iframeDoc).append('<div id="testresult" style="font-family: monospace; font-weight: bold; position: fixed; border: 2px solid black; background-color: white; top: 10px; padding : 10px; width: 95%; box-sizing: border-box; color: red">'+fb+'Sorry! Your work did not produce what we were looking for! It passed '+SUCCESSFULTESTS+' of '+NUMBEROFTESTS+' test(s).</div>');
    $("div#testresult",iframeDoc).css("opacity",0.8);

    parent.LOGtestFailed(SUCCESSFULTESTS+"/"+NUMBEROFTESTS);
    
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
            
            var attempts = $(lasttestlink).attr("data-fails");
            if (isNaN(attempts)) attempts = 0;
            attempts++;
            $(lasttestlink).attr("data-fails",attempts);

            
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
            code += 'var fb = ""; function feedback(newFb) { fb += "<p style=\\"margin-top: 0px\\">"+newFb+"</p>" };'; 
            
            // Hacky way of forcing getStyle into the scope of the iframe
            // yes, eval is evil, it burns, it burns
            code += 'eval(parent.getStyle.toString());\n';
            
            code += "NUMBEROFTESTS = 0; ";
            code += "SUCCESSFULTESTS = 0; \n\n";
            
            code += "/* PHPFEEDBACKHERE */\n\n";
            
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
               var finalOutputPHP = $(this).find(".testFinalOutputPHP").text().trim();
               var codeIncludes = $(this).find(".codeIncludes").text().trim();
               var repeat = $(this).attr("data-repeat");
               var initcond = $(this).attr("data-initcond");
               var initcondPHP = $(this).attr("data-initcondPHP");
               var endTestJS = $(this).find(".endTestJS").text().trim();
               var endTestPHP = $(this).find(".endTestPHP").text().trim();

               // if we have an initial condition, add it
               if (initcond) code += initcond+"\n";
               if (initcondPHP) code += "<?php "+initcondPHP+" ?>\n";

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
               
               if (finalOutputPHP)
               {
                   code = code.replace("/* PHPFEEDBACKHERE */",'<?php function feedback($newFb) { echo \'feedback("\'.$newFb.\'");\'; } ?>');
                   oneCheck += "\n"+'<?php function testFunc() {'+finalOutputPHP+ ' };';
                   oneCheck += "\n"+'if (testFunc()) echo "SUCCESSFULTESTS++; /* passed PHP test */";';
                   oneCheck += "\n"+"?>";
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
               
               if (endTestPHP)
               {
                   oneCheck += "\n\n// FINAL CONDITION\n\n"
                   oneCheck += "\nNUMBEROFTESTS++;\n";                   
                   oneCheck += "\n"+'<?php function finalFunc() { try { '+endTestPHP+ ' } catch (Exception e) {}  };';
                   oneCheck += "\n"+'if (finalFunc()) echo "SUCCESSFULTESTS++; /* passed final PHP test */";';
                   oneCheck += "\n"+"?>";
               }

               // add the check code block to our main code
               code += "\n\n"+oneCheck;

            });

            code += "\n"+'if (SUCCESSFULTESTS == NUMBEROFTESTS) parent.greatSuccessHtml(medal09876,fb);';
            code += "\n"+'if (SUCCESSFULTESTS != NUMBEROFTESTS) parent.epicFailHtml(SUCCESSFULTESTS,NUMBEROFTESTS,fb);';
            code += "\n</script>";                                   

            LOGtestStart(id,getTabBundleCode(),undefined,medal09876);
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
                LOGtestStart(id,editor.getValue(),undefined,medal09876);
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

function indent(code)
{
    return "  "+(code.replace(/\n/g,"\n  ").trim())
}

function genericHandleTestCases(func)
{
     $(".testCase").each(function(){         
        //$(this).children().hide();
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
        var pea = $(this).clone();        
        
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
                LOGtestStart(id,editor.getValue(),undefined,medal09876);                
                setTimeout(function(){
                    alert("test passed");
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
        $(this).click(function(e){            
            lasttestlink = this;
            
            var attempts = $(lasttestlink).attr("data-fails");
            if (isNaN(attempts)) attempts = 0;
            attempts++;
            $(lasttestlink).attr("data-fails",attempts);
            
            $(this).find("div.emotionselection").remove();
            // hidden override option
            if (e.shiftKey)
            {
                $(this).find("button,br,input").show();
                return;
            }
            lasttestlink = this;
            
            var attempts = $(lasttestlink).attr("data-fails");
            if (isNaN(attempts)) attempts = 0;
            attempts++;
            $(lasttestlink).attr("data-fails",attempts);
            
            $(this).find("div.emotionselection").remove();
            // hidden override option
            if (e.shiftKey)
            {
                $(this).find("button,br,input").show();
                return;
            }
            func(pea);
        });
    });        
}

function handleTestCases()
{
    handleTestCasesJS(); // legacy
}

function handleTestCasesPython()
{    
    genericHandleTestCases(function(source){        
       var code = 
'import noobtest\n\
noobdata = {\n\
  "numberOfTests" : 0,\n\
  "successfulTests" : 0,\n\
  "errorsDuringTest" : []\n\
}\n\
\n\
';             
               
        var tests = $(source).find(".test");        
        var medaldata = $(source).attr("data-medal");        
        var id = $(source).attr("data-id");        
        if (medaldata) medaldata = medaldata.replace(/"/g,"''");
        
        var inputTestList = [];
        
        tests.each(function(){                
               var finalOutput = $(this).find(".testFinalOutput").text().trim();
               var finalOutputCode = $(this).find(".testFinalOutputCode").text().trim();
               var codeIncludes = $(this).find(".codeIncludes").text().trim();
               var repeat = $(this).attr("data-repeat");               
               var initcond = $(this).attr("data-initcond");
               var endTestCode = $(this).find(".endTestCode").text().trim();                              
               
               // if we have an initial condition, add it
               if (initcond) code += initcond+"\n";
                              
               var inputTests = $(this).find(".inputTest");
               inputTests.each(function(){
                   console.log($(this).text().trim());
                inputTestList.push($(this).text().trim());
               });               
               
                var oneCheck = "# START OF TEST RUN\n\n";
               if ($("div.parameter#language").text().trim() == "pythoncarol")
               {
                   oneCheck += "import carol;carol.initialiseCarol()\n";
               }
               var codeInEditor = editor.getValue();
               codeInEditor += "\n\n";               
               codeInEditor = indent(codeInEditor);
               
               codeInEditor = "try:\n"+codeInEditor+"\nexcept Exception as e:\n";
               codeInEditor += "  noobtest.feedback('Your code caused an error during the test. If you do not get an error when you run your code, your code probably does something completely unexpected for this particular exercise.')\n";
               codeInEditor += "  noobtest.debug(str(e))\n";
               codeInEditor += "  noobdata['errorsDuringTest'].append(e)\n\n";
              
	       oneCheck += codeInEditor+"\n";
               oneCheck += "noobdata['numberOfTests'] = noobdata['numberOfTests'] + 1\n\n";                              
               
                // are we dealing with a simple output comparison or Python-based test code?
                
               if (finalOutput != "")
               {
                   if (finalOutput.charAt(0) != "!")
                   {
                        oneCheck += "\n"+'if "'+finalOutput+'" in noobtest.getCode():\n  noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\nnoobtest.cls()\n\n";
                   }
                   else
                   {
                       finalOutput = finalOutput.substr(1);
                       oneCheck += "\n"+'if "'+finalOutput+'" not in noobtest.getCode():\n  noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\nnoobtest.cls()\n\n";
                   }
               }
               else if (finalOutputCode != "")
               {
                   finalOutputCode = "try:\n"+indent(finalOutputCode)+"\nexcept Exception as e:\n"+indent("pass");                   
                   oneCheck +="\n"+'def noobTestRun():\n'+indent(finalOutputCode)+'\n\n';
                   oneCheck += "\n"+'if noobTestRun():\n  noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\nnoobtest.cls()\n\n";
               }
               
               // if we have a check for the code needing to include a particular
               // aspect
               if (codeIncludes != "")
               {                   
                   // this is actually a discrete test so increment
                   oneCheck += "\nnoobdata['numberOfTests'] = noobdata['numberOfTests'] + 1\n";
                   if (codeIncludes.charAt(0) != "!")
                   {
                       oneCheck += "\n"+'if "'+codeIncludes.toLowerCase()+'" in noobtest.getCode(): noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\n\n";
                   }
                   else
                   {
                       codeIncludes = codeIncludes.substr(1);
                       oneCheck += "\n"+'if "'+codeIncludes.toLowerCase()+'" not in noobtest.getCode(): noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\n\n";
                   }
               }
                              
               if (repeat)
               {
                   oneCheck = indent(oneCheck);
                   oneCheck = "for noobrepeat in range(0,"+repeat+"):\n"+oneCheck+"\n\n";
               }
               
               // add the check code block to our main code
               code += "\n\n"+oneCheck;

               // finally, if there's a final condition for this test
               if (endTestCode)
               {
                   code += "\n\n# FINAL CONDITION\n\n"
                   code += "\nnoobdata[['numberOfTests'] = noobdata['numberOfTests'] + 1\n";
                   
                   endTestCode = indent(endTestCode);                   
                   code +="\n"+'def noobTestRun():\n'+endTestCode+'\n\n';
                   code += "\n"+'if noobTestRun(): noobdata["successfulTests"] = noobdata["successfulTests"] + 1'+"\n";
               }
                                             
        });
        // now, determine whether we've passed all tests               
        code += "\n"+'if noobdata["successfulTests"] == noobdata["numberOfTests"]:\n'+
                     '  noobtest.greatSuccess("'+id+'","'+medaldata+'")\n'+
                     'else:\n'+
                     '  noobtest.epicFail(noobdata["successfulTests"],noobdata["numberOfTests"])\n';
        
        // we should be able to run this...!
        LOGtestStart(id,editor.getValue(),false,medaldata)
        if (inputTestList.length == 0) inputTestList = undefined;
        
        if ($("div.parameter#language").text().trim() == "pythoncarol") 
        {
            carol.initialiseCarol();            
        }
        setTimeout(function() { runPython("::istest::"+code,true,inputTestList); },1);        
    });
}

function handleTestCasesJS()
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
            
            var attempts = $(lasttestlink).attr("data-fails");
            if (isNaN(attempts)) attempts = 0;
            attempts++;
            $(lasttestlink).attr("data-fails",attempts);
            
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
	    code += "errorsDuringTest = [];\n\n";
            
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
               codeInEditor += "\n\n";
               codeInEditor = codeInEditor.replace(/document/g,"parent.visibleFakeDoc");
               
               if($("div.parameter#language").text().trim() == "pcode" || $("div.parameter#language").text().trim() == "pcarol")
               {
                   codeInEditor = pcodeToJs(codeInEditor);
               }

	       if($("div.parameter#language").text().trim() == "carol" || $("div.parameter#language").text().trim() == "pcarol")
               {
		   codeInEditor = "carol.initialiseCarol();\n"+codeInEditor;
		}

		codeInEditor = 'try { '+codeInEditor+' } catch (e) { feedback("Your code caused an error during the test: "+e.message); errorsDuringTest.push(e.message); }';
               
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

            LOGtestStart(id,editor.getValue(),undefined,medal09876);

            code = code.replace(/input/g,"fakeInput");
            code = code.replace(/prompt/g,"fakeInput");

            if($("div.parameter#language").text().trim() != "pcode" && $("div.parameter#language").text().trim() != "pcarol") 
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
                LOGtestStart(id,editor.getValue(),undefined,medal09876);
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
    $.get(contextPath + "/stats?type=testAssists",function(x){
        assists = x;

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

                if ($(this).next().hasClass("assist"))
		{
			$(this).next().remove();
			$(this).css("border-bottom","1px solid black");
		}

                // if we've passed a test with this ID before...        
                if (medals[testId] != undefined)
                {                              
                    $(this).addClass("completed");
                    var medal = medals[testId];
                    targetMedal = targetMedal.split(":")[0];
                    if (medal == targetMedal)
                    {
                        var html = '';
                        if (medal != "")
                        {
			    $(this).addClass("medalwon");
                            html = '<p style="margin: 0px; padding: 0px; text-align: center">You have already won ';
                            var extraHtml = "a "+medal;
                            if (medal != "ribbon") extraHtml += " medal";
                            extraHtml += " for this exercise."
                            html += extraHtml;
                            html = '<img src="'+contextPath+'/images/medal'+medal+'.png" style="float: left">'+html;
                            html += '<br/>&nbsp;<br/>&gt;&gt;&gt Click here to repeat the test for a '+targetMedal+' medal &lt;&lt;&lt</p><div style="clear: both"></div>';
                            html = html.replace("ribbon medal","ribbon"); // shouldn't ever happen, but hey

                            if (medal != "ribbon")
                            {
                                // add assist code
                                $(this).css("border-bottom","0px");
                                var ass = $("<div></div>");
                                ass.addClass("assist");
                                ass.css({
                                   "border" : "1px solid black",
                                   "border-top" : "0px",
                                   "background-color" : "white",
                                   "padding" : "5px",
                                   "font-size" : "90%",
                                   "text-align" : "center"
                                });
                                ass.html("(Did another student help you with this exercise? Click <span>here</span> to grant an assist)");
                                ass.find("span")
                                    .css({
                                        "cursor" : "pointer",
                                        "font-weight" : "bolder"
                                    })
                                    .hover(function(e){ $(this).css("background-color",e.type === "mouseenter"?"yellow":"transparent") })
                                    .click(function(){
                                        assist(testId,medal);
                                    });
                                $(this).after(ass); 

                                 // if we've granted an assist
                                 if (assists[testId+":awarded"] != undefined)
                                 {
                                     var points = assists[testId+":awarded"];
                                     $(ass).append('<div style="text-align: right">&nbsp;<br/>Existing assist(s) awarded; points deducted: '+points+"</div>");
                                 }
                            }
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
			if (greater) $(this).addClass("medalwon");
                    }
                }               
            });
            // update nav points
            $("div.section").each(function(index){
                var testcases = $(this).find(".testCase[data-medal]").size();
                if (testcases != 0)
                {
                    var completed = $(this).find(".testCase.completed[data-medal]").size();        
		    var wonmedals = $(this).find(".testCase.completed.medalwon[data-medal]").size();            
                    if (completed == 0) $(".navitem[id]").eq(index).find("a i").css("color","#B34947");
                    if (completed != 0) $(".navitem[id]").eq(index).find("a i").css("color","#E68332");
                    if (completed == testcases) $(".navitem[id]").eq(index).find("a").html('<i style="color: #777777" class="fa fa-check-circle"></i>');
		    if (wonmedals == testcases) $(".navitem[id]").eq(index).find("a").html('<i style="color: #7FA859" class="fa fa-check-circle"></i>');
                    
                }
            });
            
            // update number of attempts
            $.ajax({
                type : "POST",
                url : contextPath + "/stats?type=testAttempts",    
                dataType : "json",
                success : function(results) {
                    for (var key in results)
                    {
                        var targetMedal = undefined;
                        var result = results[key];
                        if (key.indexOf(":") != -1)
                        {
                            targetMedal = key.split(":").pop();
                            key = key.split(":").shift();
                        }
                        var targetSearch = '.testCase[data-id="'+key+'"]';
                        if (targetMedal)
                        {
                            targetSearch += '[data-medal^="'+targetMedal+'"]';
                        }
                        var target = $(targetSearch);
                        target.attr("data-globalattempts",result);
                        target.each(function(){
                            var maxattempts = $(this).attr("data-maxattempts");
                            if (isNaN(maxattempts) || result == -1) maxattempts = 0;
                            var maxdowngrade = $(this).attr("data-maxdowngrade");                            
                            if (result >= maxattempts && maxattempts != 0)
                            {
                                var medalNums = { "bronze" : 1, "silver" : 2, "gold" : 3};
                                var thismedal = $(this).attr("data-medal").split(":")[0].trim();
                                if (medalNums[thismedal] > medalNums[maxdowngrade])
                                {
                                    $(this).contents().eq(0).replaceWith('<span style="color: gray">You have exceeded the maximum number of attempts. You can now only win the '+maxdowngrade+' medal for this exercise.</span>');
                                    $(this).unbind('click');
                                }                                
                            }
                            else if (maxattempts > 0)
                            {
                                var origText = $(this).contents().eq(0).text();
                                origText = origText.replace(/\([0-9]+ of [0-9]+ attempts\)/,"");
                                origText = origText.replace("<<<"," ("+result+" of "+maxattempts+" attempts) <<<");
                                $(this).contents().eq(0).replaceWith(origText);
                            }
                        }); 
                    }
                }
            });                        
        }
    });

    }); // end of get at top of function
}

function assist(testId,medal)
{
    var msg = '<div style="font-family: Verdana, sans-serif; font-size: 90%"><h2 style="margin-top: 0px">Grant an assist</h2>';
    var maxpoints = 1;
    var previouslyawarded = 0;
    
    if (assists[testId+":awarded"] != undefined)
    {
        previouslyawarded = -assists[testId+":awarded"];
    }


    if (medal == "bronze")
    {
        msg += "<p>This is a bronze medal and worth <b>2 NoobLab points</b>.</p>";
        msg += "<p>You can grant only one assist for this medal and you<br/>will be awarding <b>1 of your 2 points</b> for the assist.";
    }

    if (medal == "silver")
    {
        maxpoints = 2;
        msg += "<p>This is a silver medal and worth <b>3 NoobLab points</b>.</p>";
        if (previouslyawarded != 0)
        {
            msg += "<p>You have already awarded a point for this activity<br/>"
            msg += "and can only award one more point.</p>"
        }
        else
        {
            msg += "<p>You can award one or two points to the person who<br/>";
            msg += "assisted you. The points will be deducted from<br/>";
            msg += "your total score.</p>"
            
            msg += '<input type="radio" name="assistpoints" value="1" checked> 1 point<br/>';
            msg += '<input type="radio" name="assistpoints" value="2"> 2 points<br/>';
        }        
    }

    if (medal == "gold")
    {
        maxpoints = 2;
        msg += "<p>This is a gold medal and worth <b>5 NoobLab points</b>.</p>";
        if (previouslyawarded == 2)
        {
            msg += "<p>You have already awarded two points for this activity<br/>"
            msg += "and can only award one more point.</p>"
        }
        else if (previouslyawarded == 1)
        {
            msg += "<p>You have already awarded one point for this activity.<br/>";
            msg += "You can choose to award one or two points to the new<br/>";
            msg += "person.</p>";

            msg += '<input type="radio" name="assistpoints" value="1" checked> 1 point<br/>';
            msg += '<input type="radio" name="assistpoints" value="2"> 2 points<br/>';
        }
        else
        {
            msg += "<p>You can award one, two or three points to the person<br/>";
            msg += "who assisted you. The points will be deducted from<br/>";
            msg += "your total score.</p>"

            msg += '<input type="radio" name="assistpoints" value="1" checked> 1 point<br/>';
            msg += '<input type="radio" name="assistpoints" value="2"> 2 points<br/>';
            msg += '<input type="radio" name="assistpoints" value="2"> 3 points<br/>';
        }
    }


    msg += "<p>Please type the K number of the person you want<br/>to grant the assist to below.</p>";
    msg += "<p><i>Be sure that you get the K number correct!<br/>You cannot undo this afterwards!</i></p>"

    if (previouslyawarded == maxpoints)
    {
        apprise("You have already given away all the assist points available for this exercise.");
        return;
    }

    apprise(msg, {'input':true}, function(r)
    {
        if(r)
        {
            var kno = r.toLowerCase();
            var assistpoints = $("input[name=assistpoints]:checked").val();
            if (assistpoints == undefined) assistpoints = 1;
            // validate
            if (kno.charAt(0) != "k")
            {
                alert("You must enter a K number that starts with the letter K.");
                return;
            }
            // otherwise
            LOGassist(testId,kno,assistpoints,medal);            
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
       if ((tabname.slice(-4) == ".htm" || tabname.slice(-5) == ".html") && injectIntoIndex && injectIntoIndex.indexOf("?php") == -1)
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
       if (tabname.slice(-4) == ".php" && injectIntoIndex)
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
    
    // if blockly, save that too
    if ($("div.parameter#blockly").text().trim() == "true")
    {
        var blocklyxml = getBlocklyXml();
        $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-codeblockly",blocklyxml, {expires: 365, path: '/'});
    }
    else
    {
        $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-codeblockly","", {expires: 365, path: '/'});
    }
}

function getBlocklyXml()
{
    return Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
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

function runPython(code,istest,input)
{
    // add an extra pass on the end - this fixes things if the last instruction is
    // an asynchronous Carol instruction
    code += "\npass\n";
    document.getElementById("codeinput").value = code;
    disableRun();
    if (!istest) LOGrun(code);
    var form = document.forms[0];
    document.forms[0].action = contextPath+"/RunPython";
    $(form).find("textarea[name=inputbuffer]").remove();
    if (input)
    {                        
        $(form).append('<textarea style="width:0px;height:0px;visibility:hidden" name="inputbuffer">'+JSON.stringify(input)+'</textarea>');
    }
    document.forms[0].submit();
}

function hiddenRun(code,test,codefortest)
{	
    // fudge console.log to println
    code = code.replace(/console\.log/g,"println");
    // fudge prompt to input
    code = code.replace(/prompt/g,"input");
    if (codefortest != undefined) codefortest = codefortest.replace(/console\.log/g,"println");
    
    if ($("div.parameter#language").text().trim() == "carol" || $("div.parameter#language").text().trim() == "pcarol")
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

            var re = new RegExp("(\\b"+carolLanguage[i]+"(\\(.*?\\)))","g");
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

function whiteSpaceify(code)
{
        // check current state of play
        var lev = cheatSourceLev(code);
        if (lev[0] == 0) return code; // current user is already on watermark
        if (lev[0] > 2) return code; // current user is already an out and out cheat
                
        // otherwise, if watermark not present or watermark likely to be
        // corrupted but likely still the actual user logged in
    	var firstline = code.split("\n")[0];
        // strip any existing watermark
        var firstlinetrimmed = firstline.replace(/\s+$/g, '');
        code = code.replace(firstline,firstlinetrimmed);
    
	// add whitespace watermark to first line
	var num = getKNo().replace(/[^0-9]/g,"");
	num = num.split("");	
	var wswm = "";
	for (var i = 0; i < num.length; i++)
	{
		for (var x = 0; x < num[i]; x++)
		{
			wswm += " ";
		}
		/* if (i != num.length-1) */ wswm+= "\t";
	}	
	code = code.replace(wswm,"");		
	code = code.replace(/\n/,wswm+"\n");
	return code;
}

function watermarkEditorCode()
{
	// get first line of the editor window
	var code = editor.getValue();
	
	// add whitespace watermark to first line of
	// current tab
	code = whiteSpaceify(code);
	var cursor = editor.getCursor();
	editor.setValue(code);
        javaPidjinCodeWrapper(true);
	editor.setCursor(cursor);
	// add whitespace watermark to first line of any
	// tabs
	$("div#code-titlebar pre.code").each(function(){
		var tabcode = $(this).text();
		tabcode = whiteSpaceify(tabcode);
		$(this).text(tabcode);
	});
}

function run()
{
    watermarkEditorCode();
    var code = editor.getValue();
    saveState();

    for (i = 0; i < editor.lineCount(); i++)
    {
        editor.removeLineClass(i,"background");
        //editor.setLineClass(i,null);
    }
    
    if ($("div.parameter#blockly").text().trim() == "true")
    {
        parent.$("#code-blockly").contents().find(".blocklyToolboxDiv").find("div").removeClass("error");
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
    else if ($("div.parameter#language").text().trim() == "pcode" || $("div.parameter#language").text().trim() == "pcarol")
    {                
        runpcode(code);
    }
    else if ($("div.parameter#language").text().trim() == "fullweb")
    {
        runFullWeb(getTabBundleCode());
    }
    else if ($("div.parameter#language").text().trim() == "cpp")
    {
        // give tabs C++ style names, if necessary
        $("div.tab").not(".newtab").contents().filter(function() {
            return this.nodeType === Node.TEXT_NODE;
        }).each(function(){
            var title = $(this).text();
            if (title.indexOf(".") == -1) $(this).replaceWith(title+".cpp");
            //if (title.slice(-4) != ".cpp") $(this).replaceWith(title+".cpp");
        })
        runCPP(getTabBundleCode(true));
    }
    else if ($("div.parameter#language").text().trim() == "python" || $("div.parameter#language").text().trim() == "pythoncarol")
    {
        if ($("div.parameter#language").text().trim() == "pythoncarol") 
        {
            try
            {
                if (code.toLowerCase().indexOf("carol.") !=-1 ) carol.initialiseCarol();            
            }
            catch (e)
            {
                apprise("You need to have a maze visible on the screen to run a Carol program. Scroll the screen so that a maze is visible and is selected with a thick black border around it, and try again.");
                //console.log(JSON.stringify(e));
            }
        }
        setTimeout(function() { runPython(code) },1); // not sure why the setTimout is needed for Carol following the initialise, but hey...
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
	// cover jquery
	code = code.replace(/\$\((.+?)\)/g,"$($1,parent.visibleFakeDoc)");
        // wrap try catches around onclicks to catch errors in event-prompted functions
        code = code.replace(/\.onclick\s*\=\s*(.*)\s*;/g,".onclick = function() { try { $1.call(this) } catch (e) { logError(e) } };");                
        
        hiddenRun(code);        
        LOGrun(oldcode);
    }    
}

function getTabNames()
{
    var tabnames = [];
    $(".tab").not(".newtab").each(function(){ 
        tabnames.push($(this).contents().eq(0).text()); 
    });
    return tabnames;
}

function runFullWeb(code,logcode)
{
    if (!logcode) logcode = code;
    var filename = $(".tab.selected").text();
    // do they have index.* selected?
    if (filename.slice(0,5) != "index")
    {
        // do they have an index even?
        var tabs = getTabNames();
        var hasIndex = false;
        for (var i = 0; i < tabs.length; i++)
        {
            if (tabs[i].slice(0,5) == "index") hasIndex = tabs[i];
        }
        if (hasIndex)
        {
            apprise("Do you want to start on the index page or the currently selected page?",
            {verify:true,textNo : "Use index page",textYes: "Use "+filename}, function(r){
                if (!r) filename = hasIndex;
                goForIt();
            });
        }
        else goForIt();
    } else goForIt();
    
    function goForIt()
    {   
	var codefiles = getTabBundleCode(true)[0];
	var names = getTabBundleCode(true)[1];
	for (var i = 0; i < codefiles.length; i++)
	{
	   var codefile = codefiles[i];
           var name = names[i];
	   var error = validateXML(codefile);
	   if (name.slice(-5) != ".html" && name.slice(-4) != ".htm" && name.slice(4) != ".php") error = false;
           if (error)
           {
		error = error.replace("XML Parsing Error: ","");
		error = error.replace(/Location.*/,"");
		error = error.replace(/:\n[\s\S]*\^/,"");
		// error = error.replace(/Location[\s\S]*/,"");
		// error = error.replace(/error on line [0-9]* at column [0-9]*:/,"");
		// error = error.replace(/line [0-9]* and .*/,"");
		$("body",outputframe.document).html("");
		$("body",outputframe.document).append('<code style="display: block; padding: 0.5em; background: white; border: 2px solid black; color: red"></code>');
		$("body code",outputframe.document).text("Invalid HTML - "+error);
		if (!$("#code-titlebar div.tab").eq(i).hasClass("selected")) $("#code-titlebar div.tab").eq(i).click();
		//$("div.tab").eq(i).click();
		return;
	   }

	}
        document.getElementById("codeinput").value = code;
        document.forms[0].action = contextPath+"/RunFullWeb";
        $("form#runform input#filename").val(filename);
        document.forms[0].submit();
        LOGrun(logcode);
        setTimeout(postRun,3000);
    }
}

function save(tabs)
{
    var code = editor.getValue();
    if ($("div.parameter#blockly").text().trim() == "true")
    {
        code = getBlocklyXml();
    }
    
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
    else if (language.slice(0,7) == "fullweb")
    {
        // assume that the extension for "fullweb" code is already there...
        saveState();
        var filename = $(".tab.selected").text().trim();
        innerSave(filename);
        return;
    }
    
    // if not Java, or fullweb, or pigin Java, or can't figure out the class name...
    var msg;
    var extension;
    if (language.slice(0,4) == "java" && $("div.parameter#multi").text().trim() == "true" && !tabs)  
    {
        msg =    
        "Unable to determine the class name from your code - please enter filename to save your file as.<br/>&nbsp;<br/>"+
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
        if ($("div.parameter#blockly").text().trim() == "true")
        {
            extension = ".bnoob";
        }
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
                if (r)
                {
                    editor.setValue("");
                    javaPidjinCodeWrapper(true);
                }
                if ($("div.parameter#blockly").text().trim() == "true") Blockly.mainWorkspace.clear();
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
    else if ($("div.parameter#language").text().trim() == "cpp")
    {
        if (cppcompiling == true)
        {
            cppcompiling = false;
            enableRun();
            cout("\nCompilation terminated with the 'STOP' button."," rgb(255,0,0)");
        }
        else
        {
            if (cppworker != undefined) cppworker.terminate();
            cppworker = undefined;
            enableRun();
            cout("\nProgram terminated with the 'STOP' button."," rgb(255,0,0)");
        }
    }
    else if ($("div.parameter#language").text().indexOf("python") != -1)
    {
        outputframe.Sk.halt("Program terminated by user");
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
    $(".kinderbuttons").unwrap();
    $(".disableoverlay").remove();
    $(".kinderbuttons img").unFreezeEvents();
    postRun();
}
function disableRun()
{
    document.getElementById("stopbutton").disabled = false;
    document.getElementById("runbutton").disabled = true;
    var disableoverlay = $('<div class="disableoverlay"></div>');
    disableoverlay.css("opacity","0.5");
    $(".kinderbuttons img").freezeEvents();
    $(".kinderbuttons").wrap(disableoverlay);
}

function postRun()
{
    if ($(".testCase[data-fails=5]").length != 0)
    {            
        var $lastfail = $(".testCase[data-fails=5]").eq(0);
        $lastfail.attr("data-fails","0");
        howDoYouFeelAbout($lastfail,"You've been unsuccessful at this activity five in times in a row now...","repeatedFail");    
    }
    setTimeout(function(){
        updateTestCases();
    },3000);
}

function highlightLine(lineno)
{
    editor.focus(); 
    editor.setCursor(lineno);
    //editor.setLineClass(lineno,"error");
    editor.addLineClass(lineno,"background","error");
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
                javaPidjinCodeWrapper(true);
            });
            // select first tab
            //$("div.tab").not(".newtab").eq(0).click();
            //if (!$("#code-titlebar div.tab").eq(0).hasClass("selected")) $("#code-titlebar div.tab").eq(0).click();
	    selectEditorTab($("div.tab").not(".newtab").eq(0),true);

            lastcode = getTabBundleCode(); // lev index
            LOGcodePaste(lastcode);
 		editor.setOption("readOnly");
            	if (editor.getValue().indexOf("NOOBLAB READONLY") != -1) editor.setOption("readOnly","true");
        }
    });
}

function selectEditorTab(source,norename)
{    
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
        javaPidjinCodeWrapper(true);
        // this next line doesn't seem to work...
        //editor.setCursor(y,x);
        // select
        $(source).addClass("selected");
        // remove code in destination tab
        $(source).find("pre.code").remove();
        $(source).find("span.cursor").remove();
	doTheRest();
    }
    else if ($("div.appriseOuter").length == 0)
    {
	apprise("What do you want to rename the tab to?",{'input' : true}, function(r){
		if (r)
		{
			if (r.split('.').pop() == r)
			{
				var existing = $(source).text().trim();
				r = r + "."+existing.split('.').pop();
			}
			$(source).html(r+'<i class="close fa fa-times" onclick="deleteSelectedEditorTab()"></i>');
			doTheRest();
		}
	});
    }
    function doTheRest(){        
    var name = $(source).text().trim();
    if (name.slice(-4) == ".cpp" || $("div.parameter#language").text().trim() == "cpp")
    {
        editor.setOption("mode","text/x-c++src");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){tidyCode();});
        $("input#tidy").hide();
        $("input#tidy").val("Tidy");
    }
    else if (name.slice(-4) == ".htm" || name.slice(-5) == ".html")
    {
        editor.setOption("mode","text/html");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){validXHTML();});
        $("input#tidy").show();
        $("input#tidy").val("Validate");
    } 
    else if (name.slice(-4) == ".php")
    {
        editor.setOption("mode","application/x-httpd-php");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){tidyCode();});
        $("input#tidy").hide();
        $("input#tidy").val("Tidy");
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
    else if (name.slice(-3) == ".js")
    {
        editor.setOption("mode","javascript");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){tidyCode();});
        $("input#tidy").show();
        $("input#tidy").val("Tidy"); 
    }
    else if ($("div.parameter#language").text().trim() == "fullweb")
    {
	editor.setOption("mode","text/html");
        $("input#tidy").prop("onclick", null);
        $("input#tidy").unbind("click");
        $("input#tidy").click(function(){validXHTML();});
        $("input#tidy").show();
        $("input#tidy").val("Validate");

    }
    editor.refresh(); editor.undo(); editor.redo();
    editor.setOption("readOnly");
    if (editor.getValue().indexOf("NOOBLAB READONLY") != -1) editor.setOption("readOnly","true");
    }
}

function deleteSelectedEditorTab()
{
    //if ($("#code-titlebar div.tab").not("newtab").length < 2) return; // can't delete final tab
    apprise("Do you really want to remove this tab and any code within it? If you have not saved it, any code will be lost!", {verify:true},function(r){
          if (r) {              
              if ($("#code-titlebar div.tab").not(".newtab").length < 2)
              {
		// last tab - so we delete its contents and we rename it
                editor.setValue("");
                javaPidjinCodeWrapper(true);
                if ($("div.parameter#language").text().trim() == "fullweb")
                {
		  $("div.tab.selected").html('index.html<i class="close fa fa-times" onclick="deleteSelectedEditorTab()"></i>');
                }
                else
        	{
		  $("div.tab.selected").text("Tab 1");
                }
		sizeTabs();
              }
              else
              {
		// find nearest tab to the left... unless we're the first one, in which case to the right...
                var nearest = $("#code-titlebar div.tab.selected").prev("div.tab");
                if (nearest.length == 0) nearest = $("#code-titlebar div.tab.selected").next("div.tab");
                $("#code-titlebar div.tab.selected").remove();
		sizeTabs();
                nearest.click();
              }
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
        var newtab = $('<div onclick="selectEditorTab(this)" class="tab">'+tab[0].trim()+'<i class="close fa fa-times" onclick="deleteSelectedEditorTab()"></i></div>');
        // put code in existing tab into a hidden pre.code
        var newpre = $('<pre class="code"/>');
        newpre.text(tab[1].trim());
        var source = cheatSource(tab[1].trim());
        if (source)
        {
           	LOGpcheat("k"+source);
        }
        $(newtab).append(newpre);
        $(newtab).append('<span class="cursor">0,0</span>');
        $("#code-titlebar div.newtab").before(newtab);
    });
    // click on the first one
    if (!$("#code-titlebar div.tab").eq(0).hasClass("selected")) $("#code-titlebar div.tab").eq(0).click();
	
    sizeTabs();
}

function sizeTabs()
{
   $(".tab").not(".newtab").css("max-width",($("#code-titlebar").width()/$(".tab").not(".newtab").length)+"px");
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
    code = code.replace(/ArrayList \< (.+) \>/g,"ArrayList<$1>");
    editor.setValue(code);
    javaPidjinCodeWrapper(true);
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
                  "If you want it to be a Javascript file, use <code>.js</code>, for PHP use <code>.php</code>, and if it's CSS you should use "+
                  "<code>.css</code></p>"+
                  "<p>If you do not specify an extension, <code>.html</code> will be assumed.</p>";
        apprise(msg,{'input':true},function(r){            
            if (r)
            {
                tabName = r;
                var extension = tabName.split(".");
                extension = extension[extension.length-1];
                if (extension != "htm" && extension != "html" && extension != "css" && extension != "js" && extension != "php")
                {
                    tabName += ".html";
                }
                inner(tabName);
            }            
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
        var newtab = $('<div onclick="selectEditorTab(this)" class="tab">'+tabName+'<i class="close fa fa-times" onclick="deleteSelectedEditorTab()"></i></div>');
        $("#code-titlebar div.newtab").before(newtab);
	sizeTabs();
        $(newtab).click();
    }
}

function cheatSource(code)
{
    code = code.trim();
    var lev = cheatSourceLev(code);
    if (lev[0] > 2 && lev[1] != 0) return lev[1];
    return false;
}

function cheatSourceLev(code)
{
        code = code.trim();
	// look for any whitespace in the first line
	var res = code.match(/(\s*)\n/);
	if (res != null) res = res[1];
	if (res)
	{
		// convert to kno
		var source = "";
		var num = 0;
		//console.log(res.length);
		for (var i = 0; i < res.length; i++)
		{
			if (res.charAt(i) == " ")
			{
				num++;
			}
			else
			{
				source += num;
				num = 0;
			}
		}		
		
                var currUser = getKNo().replace(/[^0-9]/g,"").trim();
                
                return [getLevenshteinDistance(currUser,source),source];                
	}
            
	return [-1,undefined];
}

function blocklyLoaded(blockly) 
{
    // Called once Blockly is fully loaded.
    window.Blockly = blockly;
    // append code preview pane in the sidebar
    $("#code-blockly").contents().find("body div.blocklyToolboxDiv").append('<div id="blocklyCodePreviewTitlebar">Code Preview</div>');
    $("#code-blockly").contents().find("body div.blocklyToolboxDiv").append('<div id="blocklyCodePreview"></div>');
}

function toggleBlockly()
{
    if ($("#code-blockly").is(":visible"))
    {
        $("#code-blockly").hide();
        $("#code-blocklytoggle").text("Show visual editor");
    }
    else
    {
        $("#code-blockly").show();
        $("#code-blocklytoggle").text("Hide visual editor");
    }
}

function blocklyCodeUpdate() {
    if ($("div.parameter#blockly").text().trim() != "true") return;
    var $blocklyCodePreview = $("#code-blockly").contents().find(".blocklyToolboxDiv #blocklyCodePreview");

    var originalCode = getCode($blocklyCodePreview).replace(/[0-9]+/,"").replace(/\n[0-9]+/g,"\n");
    
    var code;
    if ($("div.parameter#language").text().trim() == "python" || $("div.parameter#language").text().trim() == "pythoncarol")
    {
        code = Blockly.Python.workspaceToCode();
    }
    else
    {
        code = Blockly.Pseudocode.workspaceToCode();
    }
    //var code = Blockly.Pseudocode.workspaceToCode();
    editor.setValue(code);
    code = code.replace(/ /g,"&nbsp;");
    var splitted = code.split(/\n/);
    var bcp = "";
    for (var i = 0; i < splitted.length; i++)
    {
        if (splitted[i].trim()=="") splitted[i] = "&nbsp;";
        bcp += '<div id="bcp'+i+'" unselectable="on"><div class="cblineno">'+(i+1)+"</div>"+splitted[i]+"</div>\n";
    }
    $blocklyCodePreview.html(bcp);
    
    var newCode = getCode($blocklyCodePreview).replace(/[0-9]+/,"").replace(/\n[0-9]+/g,"\n");
    
    // TODO: Examine differences between originalCode and newCode
    // then bounce scrollbar to location. Maybe even some kind of
    // visual highlight
    
    // until then, just bounce to the bottom
   
    var height = $blocklyCodePreview.get(0).scrollHeight;
    $blocklyCodePreview.scrollTop(height);    
    
    
}

function restoreBlockly(oldBlockly)
{   
    if (Blockly == null) Blockly = $("iframe#code-blockly").get(0).contentWindow.Blockly;
    Blockly.mainWorkspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, Blockly.Xml.textToDom(oldBlockly));
    blocklyCodeUpdate();
}

function cheer(level)
{
    strop(-level);
}

function strop(level)
{    
    var newemolevel = emolevel - level;
    if (newemolevel > 7 || newemolevel < 1) return;
    // otherwise
    var emourl = $("img#nooblabemo").attr("src");
    emourl = emourl.replace(Math.floor(emolevel),Math.floor(newemolevel));
    $("img#nooblabemo").attr("src",emourl);
    emolevel = newemolevel;
}

function xgetMismatchedTags(xmlString) 
{
        xmlString.replace(/ /g,"");
        var starts = xmlString.match(/<[a-z|A-Z|0-9]*[^\/]*?>/g);
        var ends = xmlString.match(/<\/[a-z|A-Z|0-9]*?>/g);
        if (starts == null) starts = [];
        if (ends == null) ends = [];
        // otherwise, find the farged tag...
        var diff;
        var starterror = "";
        var enderror = "";
        for (var i = 0; i < starts.length; i++)
        {
                starts[i] = starts[i].split(" ")[0];
                if (starts[i].slice(-1) != ">") starts[i] += ">";

        }
        for (var i = 0; i < ends.length; i++)
        {
                ends[i] = ends[i].replace("/","");
        }
        var startdiff = starts.diff(ends);
        if (startdiff.length > 0)
        {
                enderror = "Missing start or end tags for: "+startdiff.join(" ");
                enderror = enderror.replace(/</g,"</");
        }
        return enderror;
}

var jpHeader = null;
var jpFooter;
function javaPidjinCodeWrapper()
{
    if ($("div.parameter#language").text().trim() != "java" || $("div.parameter#multi").text().trim() == "true") return;
    if (jpHeader != null) jpHeader.clear();
    if (jpFooter != null) jpFooter.clear();    
    jpHeader = editor.addLineWidget(0,$('<pre class="javastatic top">import java.util.Scanner;\n\npublic class SomeJavaCode\n{\n  public static void main(String[] args)\n  {</pre>').get(0),{above:true,coverGutter:true});
    jpFooter = editor.addLineWidget(editor.lineCount(),$('<pre class="javastatic bottom">  } // end of main method\n} // end of class</pre>').get(0),{coverGutter:true});
    editor.refresh();
}

function toggleBlocks()
{
    // do nothing if blocks not in play    
    if ($("div#usermenu div#toggleblocks").hasClass("disabled")) return;
    var cookieStatus = $.cookie("disableblocks");
    if (cookieStatus != "true")
    {
        var msg = "This will disable the blocks and enable the text-based code editor for all block-based exercises.<p>"
        msg +=    "You are advised to save any current work as any block-based programs may not be retained as text-based code.<p>";
        msg +=    "Are you sure you want to proceed?";
        apprise(msg, {verify:true},function(r)
        {
            if (r) {
              $.cookie("disableblocks","true", {expires: 365, path: '/'});
              setTimeout(function(){
                  location.reload();
              },1000);
            }   
        });        
    }
    else
    {
        var msg = "This will disable the text-based code editor and re-enable blocks for relevant exercises.<p>"
        msg +=    "You MUST save your work if you want to keep it. Your code WILL NOT be converted to blocks!<p>";
        msg +=    "Are you sure you want to proceed?";
        apprise(msg, {verify:true},function(r)
        {
            if (r) {
              $.cookie("disableblocks","false", {expires: 365, path: '/'});
              setTimeout(function(){
                  location.reload();
              },1000);
            }   
        });
    }
    
    //$.cookie('nlpp-'+courseNo+"-"+lessonNo+"-code",code, {expires: 365, path: '/'});
}

originalTexts = {};

//$(document).load(function()
window.onload = function()
{           
   var title = $("div.parameter#lessonName").text().trim();
   if (title.length == 0) title = "NoobLab";
   window.document.title = title;
   ﻿$(outputframe.document.body).css("background","transparent");
   resize();

	if (getKNo() == "k1406302" || getKNo() == "k1406809")
	{
		$("#content").css("background-color","#FFFF99");
		
	}

   $(".prettyprint").each(function(){
       var preid = "id" + Math.random().toString(16).slice(2);       
      originalTexts[preid] = getCode(this);
      $(this).attr("data-preid",preid);
   });
   
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
   else if ($("div.parameter#language").text().trim().indexOf("python") != -1)
   {
       handleTestCasesPython();
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
   
   if ($("div.parameter#language").text().trim() == "pcode" || $("div.parameter#language").text().trim() == "basic" || $("div.parameter#language").text().trim() == "pcarol")
   {
       // hide the tidy button (cos it'll make no sense of either of these languages!
       $("input#tidy").hide();
       // and turn off code highlighting and autoindenting
       // as it makes equally no sense
       editor.setOption("mode","text/plain");       
       //editor.setOption("indentUnit",4);
   }
   
   if ($("div.parameter#language").text().trim() == "python" || $("div.parameter#language").text().trim() == "pythoncarol")
   {
       editor.setOption("mode","python");
       // hide the tidy button (cos it'll make no sense in Python)
       $("input#tidy").hide();
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
        //$("#code-titlebar").append('<div onclick="deleteSelectedEditorTab()" class="tabdelete">X</div>');
        $("#code-titlebar").append('<div class="tab newtab" onclick="addNewTab()">+</div>');
        $("#code-titlebar").append('<div style="clear: both"></div>');
        addNewTab(true);
    	if (!$("#code-titlebar div.tab").eq(0).hasClass("selected")) $("#code-titlebar div.tab").eq(0).click();
    } 
    // if no multitabs but using Java, add the skeleton class around the editor
    else if ($("div.parameter#language").text().trim() == "java")
    {
        javaPidjinCodeWrapper(true);
//       $("div.CodeMirror div.CodeMirror-scroll").prepend('<pre class="javastatic top">import java.util.Scanner;\n\npublic class SomeJavaCode\n{\n  public static void main(String[] args)\n  {</pre>');
//       $("div.CodeMirror div.CodeMirror-scroll").append('<pre class="javastatic bottom" style="padding-bottom: 5px; position: relative; left: 0px; margin-top: 15px; z-index: 1000">  } // end of main method\n} // end of class</pre>');
        
    }
    
    if ($("div.parameter#language").text().trim() == "fullweb")
    {
        // make default one index.html
        $("div.tab").eq(0).contents().eq(0).replaceWith('index.html');
    }
    
    if ($("div.parameter#lectureSlideUrl").length != 0)
    {
        // add a link for the lecture slides
        $("body").append('<div id="navlecture"><i class="fa fa-graduation-cap"></i></div>');
        $("body").append('<div id="lectureslides"><iframe src="'+$("div.parameter#lectureSlideUrl").text().trim()+'"></iframe></div>');
        $("div#navlecture").click(function(){            
            $("div#lectureslides").visibilityToggle();
        });
    }
    
    if ($("div.parameter#kinder").text().trim() == "true")
    {
        // kinder mode.
        // hide the navbar - we assume that each exercise will be it's own discrete page
        $("#navbar").hide();
        // hide the emo - the bee is emo enough
        $("img#nooblabemo").hide();
        // hide the code pane components
        $("#toolbar").hide();
        $("#editor-wrapper").hide();
        $("#output-outer").hide();
        // streetch content to fit whole browser window
        $("#content").css("right","0px");
        $("#logoutitem").css("right","3px");
        // carol becomes a bee
        carolImage = "bee";
        // goal gets a beehive background
        $.stylesheet("div.carol .carolwrapper .goal").css(
            {
                    "background":"url('"+contextPath+"/images/beehive.png');",
                    "background-size":"contain"
            });
        // obstacle gets a spider background
         $.stylesheet("div.carol .carolwrapper .blocked").css(
            {
                    "background":"gray url('"+contextPath+"/images/spider.png');",
                    "background-size":"contain"
            });
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
   var oldBlockly = $.cookie('nlpp-'+courseNo+"-"+lessonNo+"-codeblockly");
   if (oldCode == null) oldCode = ""; 
   if (oldBlockly == null) oldCode = ""; 

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
   
   if ($("div.parameter#kinder").text().trim() != "true")
   {
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
                 else
                 {
                     editor.setValue(oldCode);
                     javaPidjinCodeWrapper(true);
                 }

                 if($("div.parameter#blockly").text().trim() == "true" && oldBlockly != "")
                 {
                     restoreBlockly(oldBlockly);
                 }

/*                 if($("div.parameter#blockly").text().trim() == "true" && oldBlockly == "")
                 {
                     // not blockly - hide/disable it
                     $("div.parameter#blockly").remove();
                     $("#code-blockly").hide();
                     $("#code-blocklytoggle").hide(); 
                 } */

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
            
            var source = cheatSource(newCode);
            if (source)
            {
            	LOGpcheat("k"+source);
            }
            
            lastcode = newCode; // levenshtein index code
       },500); // give it half a second so we can read what we've got
    });
    
    // prevent clicking within the watermark whitespace
    editor.on("cursorActivity",function(){
       if (editor.getCursor().line == 0)
       {
            var max = editor.getLine(0).trim().length;
            if (editor.getCursor().ch > max+1) editor.setCursor(0,max+1);
       } 
    });
    
    // update footer in java pidgin mode
    editor.on("change",function(){
       if (editor.lineCount() != linecount)
       {
           linecount = editor.lineCount();
           javaPidjinCodeWrapper();
       }
    });
    
    // remap tabs to spaces
    editor.setOption("extraKeys", {
        Tab: function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
          cm.replaceSelection(spaces);
        }
      });
      
    editor.setOption("indentUnit",2);
    
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

    if ($("div.parameter#blockly").text().trim() == "true" && $.cookie("disableblocks") == "true")
    {
        $("div.parameter#blockly").text("disabled");
        $("div#usermenu div#toggleblocks").text("Enable blocks");
        $("div#usermenu div#toggleblocks").removeClass("disabled");
        $("div#code-titlebar").html('[ Code <i onclick="toggleBlocks()" class="fa fa-cube" style="cursor:pointer; color: red;" aria-hidden="true"></i> ]');
    }
    
    // enable blockly if material calls for it
    if ($("div.parameter#blockly").text().trim() == "true")
    {
        $("#code-blockly").show();
        $("#code-blocklytoggle").show();
	// we can make the code window a bit bigger too...
	$("div#output-outer").css("height","220px");
    	$("div#editor-wrapper").css("bottom","220px");
	// and hide the code pane
	if ($("div.parameter#kinder").text().trim() != "true") $("div#code-main").hide();
        // and enable the "disable blocks" option
        $("div#usermenu div#toggleblocks").removeClass("disabled");
        $("div#code-titlebar").html('[ Code <i onclick="toggleBlocks()" class="fa fa-cube" style="cursor: pointer; color: green;" aria-hidden="true"></i> ]');
    }
    else // hide blockly's zoom in/out buttons
    {
	$("div#toolbar i.fa").hide();
    }
    
    // check for testCases with 5 attempts and update
    /*
    setInterval(function(){
        if ($(".testCase[data-fails=5]").length != 0 && $("input#runbutton").attr("disabled") != "disabled")
        {
            var $lastfail = $(".testCase[data-fails=5]").eq(0);
            $lastfail.attr("data-fails","0");
            howDoYouFeelAbout($lastfail,"You've been unsuccessful at this activity five in times in a row now...","repeatedFail");    
        }
    },1000); */
        
    // add play/pause controls to any animated gifs         
        $("img[src$=gif]").each(function(){            
           var sg = new SuperGif({gif: this});
           sg.load(function(){
               var div = $(sg.get_canvas()).parent();
               $(div).append('<div class="pntoolbar" style="position: absolute; right: 3px; bottom : 3px;"><button style="height: 30px; width: 30px; padding: 0px; line-height: 30px; border-radius: 15px; cursor: pointer; text-align: center; outline: 0px"><i class="fa fa-pause"></i></button>');                                             
    
                $(div).find("button").click(function(){
                if (sg.get_playing())
                {
                    // pause
                    $(div).find("button i").removeClass("fa-pause");
                    $(div).find("button i").addClass("fa-play");
                    sg.pause();
                }
                else
                {
                    // pause
                    $(div).find("button i").removeClass("fa-play");
                    $(div).find("button i").addClass("fa-pause");
                    sg.play();
                }                
            });   
           });
        });    
        
     // correct position of options box and navlecture to accommodate scrollbar
     var r = parseInt($("div#logoutitem").css("right"));
     $("div#usermenu,div#logoutitem").css("right",(r+window.SCROLLBAR_WIDTH+10)+"px");
     if ($("div.parameter#lectureSlideUrl").length != 0)
     {
         var w = parseInt($("div#logoutitem").css("width"));
         $("div#navlecture").css("right",(r+window.SCROLLBAR_WIDTH+20+w)+"px");
     }
        
     // hook mouse events for window resize/drag
     var dragY = null;
     var dragX = null;
     $("div#output-titlebar").mousedown(function(){
         // if we're in web move and maximised, do nothing
         if ($("div.parameter#language").text().trim() == "fullweb" && $("div#editor-wrapper").hasClass("maxed")) return;
         // otherwise...
         // create a big div over the top of everything
         $("body").append('<div id="resizeoverlay" style="position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 20000;"></div>');
         //$("body").children().last().css("background","rgba(123,245,76,0.7)");
         $("div#output-titlebar").css("z-index",20001);
         dragY = setInterval(function(){            
            $("div#output-outer").css("height",window.innerHeight-globalMouseY+"px");
       	    $("div#editor-wrapper").css("bottom",window.innerHeight-globalMouseY+"px");
            $("#outputframe").css("height",window.innerHeight-globalMouseY+"px");
            editor.refresh();
         },10);
     });
     $("div#horizontaldrag").mousedown(function(){
         // create a big div over the top of everything
         $("body").append('<div id="resizeoverlay" style="position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 20000;"></div>');
         //$("body").children().last().css("background","rgba(123,245,76,0.7)");
         $("div#horizontaldrag").css("z-index",20001);
         $("div#horizontaldrag").addClass("changed");
         dragX = setInterval(function(){
            var width = window.innerWidth-globalMouseX;
            if (width < 450 || globalMouseX < 450) return;
            if ($("div.parameter#language").text().trim() == "fullweb" && $("div#editor-wrapper").hasClass("maxed"))
            {                
                $("div#horizontaldrag").css("right",width+"px");
                $("div#editor-wrapper").css("width",globalMouseX+"px");
                $("div#output-outer").css("width",width+"px");               
            }
            else
            {
                $("div#horizontaldrag").css("right",width+"px");
                $("div#editor-wrapper").css("width",width+"px");
                $("div#toolbar").css("width",width+"px");
                $("div#output-outer").css("width",width+"px");
                $("div#content").css("right",(width+5)+"px");
                $("div#lectureslides").css("right",(width+5)+"px");                
                $("div#usermenu,div#logoutitem").css("right",(width+window.SCROLLBAR_WIDTH+10)+"px");
                if ($("div.parameter#lectureSlideUrl").length != 0)
                {
                    var w = parseInt($("div#logoutitem").css("width"));
                    $("div#navlecture").css("right",(width+window.SCROLLBAR_WIDTH+20+w)+"px");
                }
            }
         },10);
     })
     onmouseup = function()
     {
         if (dragY != null)
         {
             clearInterval(dragY);
             dragY = null;
             $("div#resizeoverlay").remove();             
         }
         if (dragX != null)
         {
             clearInterval(dragX);
             dragX = null;
             $("div#resizeoverlay").remove();
         }
     }         
     
     var globalMouseX;
     var globalMouseY;
     onmousemove = function(e){
         globalMouseX = e.clientX;
         globalMouseY = e.clientY;
     }
}
//});

function getKNo()
{
	var x = "";
  	for (var i = 32; i < watermark.length; i = i + 33) x+= watermark.charAt(i);
  	return x;
}

function zoomIn()
{
	if ($("iframe#code-blockly").attr("data-zoom") == undefined)
	{
		$("iframe#code-blockly").attr("data-zoom","1");
	}
	var zoom = parseFloat($("iframe#code-blockly").attr("data-zoom"));
	zoom = zoom + 0.05;
	$("iframe#code-blockly").css("transform","scale("+zoom+")");
	$("iframe#code-blockly").css("transform-origin","0 0");
	$("iframe#code-blockly").height((100*1/zoom)+"%");
	$("iframe#code-blockly").width((100*1/zoom)+"%");
	$("iframe#code-blockly").attr("data-zoom",zoom);
}

function zoomOut()
{
        if ($("iframe#code-blockly").attr("data-zoom") == undefined)
        {
                $("iframe#code-blockly").attr("data-zoom","1");
        }
        var zoom = parseFloat($("iframe#code-blockly").attr("data-zoom"));
        zoom = zoom - 0.05;
        $("iframe#code-blockly").css("transform","scale("+zoom+")");
	$("iframe#code-blockly").css("transform-origin","0 0");
        $("iframe#code-blockly").height((100*1/zoom)+"%");
        $("iframe#code-blockly").width((100*1/zoom)+"%");
	$("iframe#code-blockly").attr("data-zoom",zoom);
}

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
