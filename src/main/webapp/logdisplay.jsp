<%-- 
    Document   : logdisplay
    Created on : Dec 20, 2013, 10:51:24 AM
    Author     : paulneve
--%>

<%@page import="java.util.regex.Pattern"%>
<%@page import="java.util.regex.Matcher"%>
<%@page import="java.awt.List"%>
<%@page import="java.util.ArrayList"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Log Viewer</title>
        <style>
            table {
                border : 0px;
                border-collapse: collapse;
                table-layout : fixed;
                max-width: 100%;
                width: 100%;
            }
            td {
                padding : 0.5em;
                padding-top: 0px;
                padding-bottom : 0px;
                border : 1px solid black;
                white-space: nowrap;
                overflow : hidden;
                
            }
        </style>
        <%-- JQuery --%>
        <script src="${pageContext.request.contextPath}/jq.js"></script>        
    </head>
    <body>
        <a href="#" onclick="history.back(); return false;">Back to dir listing</a>
        <table>
            <c:forEach var="logline" items="${logdata}">
                <tr>
                    <td>${logline[0]}</td>
                    <td>${logline[1]}</td>
                    <td>${logline[2]}</td>
                    <td>${logline[3]}</td>
                    <td>${logline[4]}</td>
                    <td><c:if test="${logline[5] != ''}"><a href="#" onclick="$('tr.code').hide(); $(this).closest('tr').next().show(); return false;">Code</a></c:if></td>
                </tr>
                <tr style="display: none" class="code">
                    <td colspan="6" style="font-family: monospace">                        
                        <c:set var="codestart" value="${fn:replace(logline[5],'***TAB***$$','<hr/>Filename: ')}"></c:set>
                        <c:set var="codestart" value="${fn:replace(codestart,'***CODE***$$','<br/>')}"></c:set>
                        <c:set var="codestart" value="${fn:replace(codestart,'$$','<br/>')}"></c:set>  
                        <c:set var="codestart" value="${fn:replace(codestart,'Filename: Tab 1<br/><br/>','')}"></c:set>  
                        <c:set var="codestart" value="${fn:replace(codestart,'>','&gt;')}"></c:set>
			<c:set var="codestart" value="${fn:replace(codestart,'<','&lt;')}"></c:set>
			<c:set var="codestart" value="${fn:replace(codestart,'&lt;br/&gt;','<br/>')}"></c:set>
			<c:set var="codestart" value="${fn:replace(codestart,'&lt;hr/&gt;','<br/>')}"></c:set>
			<pre>${codestart}</pre>                        
                    </td>
                </tr>
            </c:forEach>
        </table>
        <script>
            $("td:nth-child(5)").click(function(){
                var code = $(this).html();
                var e = document.createElement('textarea');
                e.innerHTML = code;
                code = e.childNodes[0].nodeValue;
                code = code.replace(/<br>/g,"\n");
                code = code.replace("/","\n");
                alert(code);
            }).css("cursor","pointer");
        </script>
    </body>
</html>
