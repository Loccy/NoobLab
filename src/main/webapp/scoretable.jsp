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
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>High Scores</title>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/scoretable.css">
    </head>
    <body>
        <c:if test="${fn:length(medalDetails) != 1}">    
            <h1>Your medals</h1>        
            <table class="medal">
                <tr><th>Activity</th><th>Award&nbsp;class</th><th>Points</th><th>Assists</th></tr>
                <c:forEach var="medal" items="${medalDetails}">
                    <tr>
                        <c:if test="${medal.key != 'finalscore'}">
                            <td>${medal.key}</td>
                            <td align="center">
                                <c:choose>
                                    <c:when test="${fn:endsWith(medal.key,'+assist)')}"><img height="55px" src="${pageContext.request.contextPath}/images/recass.png"/></c:when>
                                    <c:when test="${fn:endsWith(medal.key,'-assist)')}"><img height="55px" src="${pageContext.request.contextPath}/images/awass.png"/></c:when>
                                    <c:otherwise><img src="${pageContext.request.contextPath}/images/medal${medal.value}.png" height="55px" width="40px"/></c:otherwise>
                                </c:choose>
                            </td>
                            <c:choose>
                                <c:when test="${medal.value == 'gold'}"><td class="score">5</td></c:when>
                                <c:when test="${medal.value == 'silver'}"><td class="score">3</td></c:when>
                                <c:when test="${medal.value == 'bronze'}"><td class="score">2</td></c:when>
                                <c:otherwise><td class="score"></td></c:otherwise>
                            </c:choose>
                            <td class="score"><c:if test="${fn:endsWith(medal.key,'assist)')}">${medal.value}</c:if></td>
                        </c:if>
                    </tr>
                </c:forEach>                        
                <tr><td colspan="2">Total Points</td><td class="score" colspan="2">${medalDetails['finalscore']}</td></tr>
            </table>  
        </c:if>
        <c:if test="${fn:length(medalDetails) == 1}">
            <h1>You don't have any medals for this module yet. You should put that right straight away! :-)</h1>
        </c:if>
    </body>
</html>
