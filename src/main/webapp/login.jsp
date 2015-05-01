<%-- 
    Document   : login
    Created on : Jan 23, 2012, 9:34:08 AM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
    <head>
        <title>NoobLab Login</title>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/nooblab.css">
         <%-- JQuery --%>
        <script src="${pageContext.request.contextPath}/jq.js"></script>
        <script src="${pageContext.request.contextPath}/aes.js"></script>
    </head>
    <body>
        <div id="content" style="width : 100%">
             <div class="loginBoxBigger">
                 <h3>NoobLab</h3>
                 <div style="text-align : left">
                     <span>Please log into the learning environment with your username and password:</span>    
                     <form onsubmit="encryptAndSubmitLogin(); return false;">
                    <div class="label">Username:</div><input name="visibleusername"/><br/>
                    <div class="label">Password:</div><input name="visiblepassword" type="password"/>
                    <input class="button" type="submit" value="Login" onclick="encryptAndSubmitLogin()"/>                        
                     </form>                    
                     <form style="display: none" action="${pageContext.request.contextPath}/Login" method="post">  
                         <input name="x1"/>
                         <input name="x2"/>                        
                         <input name="originalUrl" type="hidden" value="${originalUrl}"/>
                     </form>
                     <input id="hash" type="hidden" value="<%= session.getId().substring(0,16) %>"/>
                 </div>
                 <div id="error" class="error" style="text-align: left; font-weight: bold; font-size: 0.9em; display: none">The credentials you supplied were not valid. Please try again.</div>
                 <script type="text/javascript">
                     if ("${error}" != "") document.getElementById("error").style.display = "block";
                 </script>
            </div>
        </div>
    </body>
</html>
