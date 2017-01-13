<%-- 
    Document   : runcpp
    Created on : 07-Sep-2016, 16:43:31
    Author     : Paul
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
    <head>
        <title>Run CPP wrapper</title>
        <script type="text/javascript" src="${pageContext.request.contextPath}/oni-apollo.js"></script>
        <script src="${pageContext.request.contextPath}/jq.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/runcpp.js"></script>
        <link rel="stylesheet" href="${pageContext.request.contextPath}/runcpp.css"/>
    </head>
    <body>
        <div id="output"></div>
    </body>
    <script type="text/sjs">
        ${result[1]}
    </script>
</html>
