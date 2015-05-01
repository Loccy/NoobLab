<%-- 
    Document   : scoretable
    Created on : Oct 1, 2012, 12:48:02 PM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>High Scores</title>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/scoretable.css">
    </head>
    <body>
        <c:if test="${fn:length(bigtable) != 0}">    
            <h1>High score table for this module</h1>       
            <table class="highscore">
                <tr>                    
                    <th>User ID</th>
                    <th><img src="${pageContext.request.contextPath}/images/medalgold.png" height="55px" width="40px"/><br/>5&nbsp;points</th>
                    <th><img src="${pageContext.request.contextPath}/images/medalsilver.png" height="55px" width="40px"/><br/>3&nbsp;points</th>
                    <th><img src="${pageContext.request.contextPath}/images/medalbronze.png" height="55px" width="40px"/><br/>2&nbsp;points</th>
                    <th><img src="${pageContext.request.contextPath}/images/medalribbon.png" height="55px" width="40px"/><br/>ribbons</th>
                    <th><img src="${pageContext.request.contextPath}/images/recass.png" height="55px"/><br/>assist<br/>points</th>
                    <th>Total Score</th>
                </tr>             
                <c:forEach var="medal" items="${bigtable}">
                    <tr>                                      
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>><b>${medal.value[0]}</b></td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>>${medal.value[1]}</td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>>${medal.value[2]}</td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>>${medal.value[3]}</td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>>${medal.value[4]}</td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>>${medal.value[5]}</td>
                        <td <c:if test="${medal.value[0] == username}">style="background-color: #CCFF99"</c:if>><b style="font-size: 120%"><fmt:formatNumber type="percent"
            pattern="#####" value="${medal.key}" /></b></td>
                    </tr>
                </c:forEach>                                        
            </table>  
        </c:if>
        <c:if test="${fn:length(bigtable) == 0}">
            <h1>No-one's won any medals for this module yet!</h1>
        </c:if>
    </body>
</html>
