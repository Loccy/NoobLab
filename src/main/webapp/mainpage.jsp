<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>

<html>
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <title>NoobLab</title>

        <%-- put current ${pageContext.request.contextPath} into Javascript land --%>
        <script type="text/javascript">
            var contextPath = "${pageContext.request.contextPath}";            
        </script>

        <%-- JQuery --%>
        <script src="${pageContext.request.contextPath}/jq.js"></script>

        <%-- our own stuff --%>
        <script type="text/javascript" src="${pageContext.request.contextPath}/nooblab.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/actions.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/innerxhtml.js"></script>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/nooblab.css"/>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/lib/codemirror.css"/>

        <%-- codemirror --%>
        <script src="${pageContext.request.contextPath}/codemirror/lib/codemirror.js"></script>
        
        <%-- xml for codemirror, needed for HTMl apparently --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/xml/xml.js"></script>
        <%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/mode/xml/xml.css">  --%>               
        <%-- javascript highlighting for codemirror --%>                        
        <script src="${pageContext.request.contextPath}/codemirror/mode/javascript/javascript.js"></script>
        <%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/mode/javascript/javascript.css"/>        
        <%-- css/html for Codemirror --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/css/css.js"></script>
        <%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/mode/css/css.css"> --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/htmlmixed/htmlmixed.js"></script>                
        
        <%-- basic highlighting for codemirror --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/basic/basic.js"></script>
        <%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/mode/basic/basic.css"/> --%>
        <%-- java highlighting for codemirror --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/clike/clike.js"></script>
        <%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/codemirror/mode/clike/clike.css"/> --%>   
        <%-- and PHP --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/php/php.js"></script>
        <%-- and Python --%>
        <script src="${pageContext.request.contextPath}/codemirror/mode/python/python.js"></script>

        <%-- prettyprint --%>
        <script src="${pageContext.request.contextPath}/prettify.js"></script>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/prettify.css"/>
        
        <%-- javascript code tidy --%>
        <script src="${pageContext.request.contextPath}/jsbeautify.js"></script>

        <%-- appraise --%>
        <script src="${pageContext.request.contextPath}/apprise-1.5.min.js"></script>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/apprise.min.css"/>
        
        <%-- java runner --%>
        <script type="text/javascript" src="${pageContext.request.contextPath}/java.js"></script>
        
        <%-- pcode "compiler" --%>
        <script type="text/javascript" src="${pageContext.request.contextPath}/psuedocode.js"></script>
        
        <%-- C++ --%>
        <script type="text/javascript" src="${pageContext.request.contextPath}/cpp.js"></script>

        <%-- stratified Javascript --%>
        <script type="text/javascript" src="${pageContext.request.contextPath}/oni-apollo.js"></script>
        <script type="text/sjs">
            <%-- basic --%>
            var basic = require("${pageContext.request.contextPath}/basic");
            <%-- carol --%>
            var carol = require("${pageContext.request.contextPath}/carol");
            <%-- java on server side run path --%>
            var javaserver = require("${pageContext.request.contextPath}/javaserver");
        </script>
        
        <%-- gifpauserxtreme (for animated gifs) --%>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/gifpause/libgif.js"></script>                
        
        <%-- font awesome --%>
        <link href="//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>
        
        <%-- bring watermark client side --%>
        <script type="text/javascript">
            watermark = "${watermark}";
        </script>
        
        <%-- blockly --%>
        <%-- <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blockly_compressed.js"></script>

        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/colour.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/logic.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/math.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/text.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/loops.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/procedures.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/variables.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/blocks/carol.js"></script>  

        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/colour.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/logic.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/math.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/text.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/loops.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/procedures.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/variables.js"></script>  
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/generators/pcode/carol.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/blockly/msg/js/en.js"></script> --%>
        

    </head>
    <body><div id="content">
            <audio id="winsound">
                    <source src="${pageContext.request.contextPath}/images/win.ogg" type="audio/ogg"/>
                    <source src="${pageContext.request.contextPath}/images/win.mp3" type="audio/mpeg"/>
                </audio>
            <audio id="failsound">
                    <source src="${pageContext.request.contextPath}/images/ouch.ogg" type="audio/ogg"/>
                    <source src="${pageContext.request.contextPath}/images/ouch.mp3" type="audio/mpeg"/>
                </audio>
            <div id="content-inner">
                ${contentshtml}
            </div>
            <c:if test="${transfervar}">
            <script type="text/javascript">
                var varTransferredFromServerSide = ${transfervar};
            </script>
            </c:if>
            <img id="nooblabemo" src="${pageContext.request.contextPath}/images/emo5.png"/>
        </div>
        <div id="toolbar">
            <form id="runform" action="RunPage" method="post" target="outputframe" style="display: none">
                <textarea style="width: 0px; height: 0px; visibility: hidden;" cols="10" rows="10" id="codeinput" name="codeinput"></textarea>
                <textarea style="width: 0px; height: 0px; visibility: hidden;" cols="10" rows="10" id="codefortest" name="codefortest"></textarea>
                <input name="nohalt" id="nohalt" type="hidden"/>
                <input name="filename" id="filename"/>
                <input name="tabs" id="tabs"/>                
            </form>
            <div style="float: left"><input id="runbutton" type="button" value="Run" onclick="run();"/></div>
            <div style="float: left"><input id="stopbutton" type="button" value="Stop" onclick="stop();" disabled="true"/></div>
            <div style="float: left"><input id="loadbutton" type="button" value="Load file"/></div>
            <div style="float: left"><input id="savebutton" type="button" value="Save file" onclick ="save()"/></div>
            <div style="float: left"><input id="clearbutton" type="button" value="Clear editor" onclick ="clearEditor();"/></div>
            <div style="float: left"><input id="saveallbutton" style="display: none" type="button" value="Save all as zip" onclick ="save(true);"/></div>
            <div style="float: left"><input id="tidy" type="button" value="Tidy" onclick ="tidyCode();"/></div>
            <div style="float: right"><i class="fa fa-search-plus" style="position: relative; top: 4px; right: 14px; cursor: pointer" onclick="zoomIn()"></i><i style="position: relative; top: 4px; right: 14px; cursor: pointer" class="fa fa-search-minus" onclick="zoomOut()"></i><span class="maximisebutton fa fa-window-maximize" onclick="maxMinCode()" style="position: relative; top: 4px; right: 2px; cursor: hand; cursor: pointer;"></span></div>
            <div style="clear: both"></div>
        </div>
        <script type="text/javascript">
            var stoppit = false;
            var lastFilename = "";
            var openFile = $("#loadbutton").upload({
                    name: 'fileDetails',
                    action: '${pageContext.request.contextPath}/BounceFile',
                    enctype: 'multipart/form-data',
                    params: { wipedir : "true" },
                    autoSubmit: false,
                    onSubmit: function() {},
                    onComplete: function(response) {
                        setTimeout(function()
                        {
                            response = response.replace(/#RET#/g,"\n");                            
                            // if multitab response
                            if (response.indexOf("***TAB***") != -1 && $("div.parameter#multi").text().trim() == "true")
                            {
                                populateTabs(response);
                                lastcode = response; // levenshtein index code
                            }
                            else
                            {
                                // if multi-tab but single file response
                                if ($("div.parameter#multi").text().trim() == "true")
                                {
                                    // if we only have one tab and it's blank
                                    if ($("div.tab").not(".newtab").length == 1 && editor.getValue().trim().length == 0)
                                    {
                                        editor.setValue(response);
                                        lastcode = getTabBundleCode();
                                        $("div.tab.selected").text(lastFilename);
                                    }
                                    else // we load into a new tab rather than currently selected one...
                                    {
                                        $("div.newtab").click();
                                        editor.setValue(response);
                                        lastcode = getTabBundleCode();
                                        $("div.tab.selected").text(lastFilename);
                                    }
                                }
                                else // not multitab, just change editor contents
                                {
                                    // check watermarking
                                    var inboundWatermark = response.match(/\<noob\>(.*)\<\/noob\>/);
                                    if (inboundWatermark)
                                    {
                                        inboundWatermark = inboundWatermark[1];
                                        response = response.replace(/\<noob\>(.*)\<\/noob\>/,"");
                                        var sourceUID = getUID(inboundWatermark);
                                        if (sourceUID != getUID()) LOGcheat(sourceUID);
                                    }
                                    
                                    if ($("div.parameter#blockly").text().trim() == "true" && lastFilename.slice(-6) == ".bnoob")
                                    {
                                        // blockly file
                                        restoreBlockly(response);
                                    }
                                    else
                                    {
                                        // not blockly - hide/disable it
                                        $("div.parameter#blockly").remove();
                                        $("#code-blockly").hide();
                                        $("#code-blocklytoggle").hide();                                        
                                        editor.setValue(response);      
                                        lastcode = response;
                                    }
                                                                            
                                    
                                }
                            }
                            LOGload(response);
                        },200);
                    },
                    onSelect: function() {
                        lastFilename = openFile.filename().split(/\\|\//).pop();
                        if ($("div.parameter#multi").text().trim() != "true")
                        {
                            if (confirm("This will replace everything in the editor! Are you sure?")) openFile.submit();
                        } else openFile.submit();
                    }
            });
        </script>
        <div id="editor-wrapper">
            <div id="code-titlebar"><%--<div id="code-blocklytoggle" unselectable="on" onclick="toggleBlockly()">Hide visual editor</div>--%>[ Code ]</div>
            <iframe id="code-blockly" src="${pageContext.request.contextPath}/blockly.jsp?language=${requestScope.blocklylang}"></iframe>
            <div id="code-main"><!-- editor will go in here --></div>
        </div>
        <script type="text/javascript">            
            if ($("div.parameter#language").text().trim() == "basic")
            {
                editor = CodeMirror(document.getElementById("code-main"),{
                    value: "${codetext}",
                    mode:  "basic",                    
                    lineNumbers: false
                });
            }
            else if ($("div.parameter#language").text().trim().slice(0,4) == "java")
            {
                editor = CodeMirror(document.getElementById("code-main"),{
                    value: "${codetext}",                    
                    mode: "text/x-java",
                    //tabMode : "shift",                    
                    lineNumbers: true
                });
            }
            else if ($("div.parameter#language").text().trim() == "pcode" || $("div.parameter#language").text().trim() == "pcarol")
            {
                editor = CodeMirror(document.getElementById("code-main"),{
                    value: "${codetext}",
                    mode : "text/plain",
                    tabMode : "shift",
                    lineNumbers: true,                    
                    onKeyEvent : function(a,b){
                        if (stoppit) return;
                        if ($("div.parameter#blockly").text().trim() == "true")
                        {
                            stoppit = true;
                            apprise("Modifying the actual code will disable the visual editor for this workshop! Are you sure?",{verify:true},function(r){
                                if (r)
                                {
                                    // not blockly - hide/disable it
                                    $("div.parameter#blockly").remove();
                                    $("#code-blockly").hide();
                                    $("#code-blocklytoggle").hide(); 
                                    saveState();
                                }
                                stoppit = false;
                            });
                        }
                    }
                });
            }
            else
            {
                editor = CodeMirror(document.getElementById("code-main"),{
                    value: "${codetext}",
                    mode:  "javascript",                                        
                    lineNumbers: true
                });
            }
        </script>

        <div id="output-outer">
            <div id="output-titlebar">[Output]</div>
            <div id="output-inner">
                <div id="output-main"><iframe name="outputframe" id="outputframe" allowTransparency="true" frameborder="0"></iframe></div>
            </div>
        </div>
        <div style="clear: both"></div>
        <div id="usermenu">
            <div><a class="medallink" href="${pageContext.request.contextPath}/ScoreTable?type=mymedals">View my medals</a></div>
            <div><a class="medallink" href="${pageContext.request.contextPath}/ScoreTable?type=bigtable">View high score<br/>table for module</a></div>
            <!--<div onclick="setName()">Set my name</div>-->
            <div id="reallogout" onclick="logout()">Logout</div>
        </div>
        <div id="logoutitem" onclick="toggleOptions()">Options</a></div>
    </body>
</html>
