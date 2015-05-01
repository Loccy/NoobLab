<%@page contentType="application/json" pageEncoding="UTF-8"%>
{
<%

for (int i = 1; i < 6;i++)
{
	int randno = 10 + (int)(Math.random() * ((64 - 10) + 1));
%>
   "pic<%=i%>" : {
     "thumb" : "http://paulneve.com/demopics/diagram-<%=randno%>-small.png",
     "big" : "http://paulneve.com/demopics/diagram-<%=randno%>.png"   
   }<% if (i != 5) out.print(","); %>
<%  } %>
}
