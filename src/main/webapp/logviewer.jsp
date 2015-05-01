<%-- 
    Document   : logviewer
    Created on : Dec 20, 2013, 9:57:44 AM
    Author     : paulneve
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Log Viewer</title>
        <style>
            table,td,tr,th {
                border : 0px;
            }
            table {
            	max-width: 100%;
            	table-layout : fixed;
            }
            td {
                padding : 0.5em;
                padding-top: 0px;
                padding-bottom : 0px;
                white-space: nowrap;
                overflow : scroll;
            }
        </style>
    </head>
    <body>
        <table>
            <c:forEach var="direntry" items="${dirlisting}">
                <tr>
                    <c:choose>
                        <c:when test="${direntry.type == 'dir'}">
                            <td><a href="?currentdir=${direntry.dir}">${direntry.shortname}</a></td>
                            <td>${direntry.type}</td>
                        </c:when>
                        <c:when test="${direntry.type != 'dir'}">
                            <td>
                                <c:if test="${direntry.shortname == 'main.csv'}"><a href="?mode=viewlog&currentdir=${direntry.dir}"></c:if>
                                ${direntry.shortname}
                                <c:if test="${direntry.shortname == 'main.csv'}"></a></c:if>
                            </td>
                            <td>${direntry.type}</td>
                        </c:when>
                    </c:choose>
                </tr>
            </c:forEach>
        </table>
    </body>
</html>
