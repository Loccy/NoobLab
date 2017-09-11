<!DOCTYPE html>
<html>
    <head>
        <title>Python</title>
        <script src="${pageContext.request.contextPath}/jq.js"></script>
        <script type="text/javascript">
            var pythonmaxcycles = ${pythonmaxcycles};
        </script>
        <script src="${pageContext.request.contextPath}/skulpt/skulpt.min.js" type="text/javascript"></script>
        <script src="${pageContext.request.contextPath}/skulpt/skulpt-stdlib.js" type="text/javascript"></script>        
        <script src="${pageContext.request.contextPath}/python.js" type="text/javascript"></script>
        <style>
            span:empty {
                display : inline-block;
                min-width : 2px;
                min-height : 1em;
            }
        </style>
        <script type="text/javascript">
            var inputbuffer = ${inputbuffer};
        </script>
    </head>
    <body>
        <pre id="python-code" style="display: none">${pythoncode}</pre><div id="output-py" onclick="focusInput()" style="font-family: monospace; white-space: pre-wrap; width: 100%; height: 100%; overflow: auto"><span id="input" style="outline:none" contenteditable></span></div>
    </body>
    <script type="text/javascript">
        $("body").css("font-size",parent.editorfontsize+"px")        
    </script>
</html>
