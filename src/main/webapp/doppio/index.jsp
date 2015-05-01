<%-- 
    Document   : index
    Created on : Oct 5, 2012, 10:22:53 AM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
  <title>DoppioVM: A JVM in Coffeescript</title>
  
  <link href="doppio.css" rel="stylesheet" type="text/css"/>
 
   <%-- NEW DOPPIO - 11th Jan 2012 --%>
  
 <script type="text/javascript" src="../jq.js"></script>
 <script type="text/javascript" src="vendor/_.js"></script> 
 <script type="text/javascript" src="vendor/gLong.js"></script>
  
  <%-- and this lot for ultra latest version of doppio, as pulled on Friday 11th Jan --%>
  <script type="text/javascript" src="browser/util.js"></script>
  <script type="text/javascript" src="browser/node.js"></script>
  <script type="text/javascript" src="src/logging.js"></script>
  <script type="text/javascript" src="src/exceptions.js"></script>
  <script type="text/javascript" src="src/util.js"></script>
  <script type="text/javascript" src="src/types.js"></script>
  <script type="text/javascript" src="src/java_object.js"></script>
  <script type="text/javascript" src="src/opcodes.js"></script>
  <script type="text/javascript" src="src/attributes.js"></script>
  <script type="text/javascript" src="src/ConstantPool.js"></script>
  <script type="text/javascript" src="src/disassembler.js"></script>
  <script type="text/javascript" src="src/natives.js"></script>
  <script type="text/javascript" src="src/methods.js"></script>
  <script type="text/javascript" src="src/ClassFile.js"></script>
  <script type="text/javascript" src="src/runtime.js"></script>
  <script type="text/javascript" src="src/jvm.js"></script>
  <script type="text/javascript" src="src/testing.js"></script>
  <script type="text/javascript" src="vendor/jquery.console.js"></script>
  <script type="text/javascript" src="browser/untar.js"></script>
  <script type="text/javascript" src="browser/frontend.js"></script>

  
  
</head>
<body>
    <%--
<div id='progress-container'>
  <div id='progress-box'>
    <div id='progress' class='progress progress-striped active' style='background:#ccc'>
      <div class='bar' style='width:0%'></div>
    </div>
    <div id='preloading-file'></div>
  </div>
</div>
<div id='overlay'>
</div> --%>

<div id='main'>
<form class='form-inline' style='display: none; margin: 8px 0 3px 0;float:right'>
  <label for='file' class='control-label'>Load file:</label>
  <input type="file" id="file"/>
</form>
  <div id='console'></div>
</div>

</body>
</html>
