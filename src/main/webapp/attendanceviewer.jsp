<%--
    Document   : attendanceviewer
    Created on : 03-Oct-2017, 09:20:42
    Author     : paul
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <style>
            table {
                border : 0px;
                border-collapse: collapse;
            }
            table {
            	max-width: 100%;
            }
            td,th {
                padding : 0.5em;
                padding-top: 0px;
                padding-bottom : 0px;
                border : 1px solid black;
            }
            td.selected,th.selected {
                background-color : green;
                color : green;
            }
        </style>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
        <script src="${pageContext.request.contextPath}/jq.js"></script>
        <script type="text/javascript">

            var weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

            var data = ${json}
            var knums = Object.keys(data);
            // go through and get all the possible times
            var times = {};
            for (var kno in data)
            {
                var studentTimes = data[kno];
                for (var i = 0; i < studentTimes.length; i++)
                {
                    studentTime = studentTimes[i];
                    times[studentTime] = true;
                    studentTimes[i] = new Date(studentTimes[i]);
                }
            }

            function buildTable()
            {
                $("table").remove();
                var table = $("<table><thead><tr></tr></thead><tbody></tbody></table>");
                // build headers
                $(table).find("thead tr").append('<th class="kno">KNumber</th>');
                var day = $("div.time select.weekday").val();
                var start = $("div.time select.start").val();
                var end = $("div.time select.end").val();
                var matchingTimes = [];
                for (var time in times)
                {
                    time = new Date(time);
                    if (weekdays[time.getDay()] == day && time.getHours() >= start && time.getHours() <= end)
                    {
                        var datenotime = new Date(time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate());
                        if (matchingTimes.map(Number).indexOf(+datenotime) == -1)
                        {
                            matchingTimes.push(datenotime);
                        }
                        //$(table).find("thead").append("<th>"+(time.getDay()+1)+"/"+(time.getMonth()+1)+"</th>");
                    }
                }
                matchingTimes = matchingTimes.sort();

                for (var i = 0; i < matchingTimes.length; i++)
                {
                    var matchingTime = new Date(matchingTimes[i]);
                    $(table).find("thead tr").append("<th>"+matchingTime.getDate()+"/"+(matchingTime.getMonth()+1)+"</th>");
                };
                $(table).find("thead tr").append('<th class="kno">Total</th>');

                for (var i = 0; i < knums.length; i++)
                {
                    var currentStudent = knums[i];
                    var row = $("<tr></tr>");
                    $(row).append("<td>"+currentStudent+"</td>");

                    // go through all times at top of table
                    $(table).find("thead tr th").not("th.kno").each(function(index){
                        var currentDateText = $(this).text().split("/");
                        var currentDay = currentDateText[0];
                        var currentMonth = currentDateText[1];
                        var currentStudentTimes = data[currentStudent];
                        var studentHasTime = false;
                        for (var x = 0; x < currentStudentTimes.length; x++)
                        {
                            var currentStudentTime = currentStudentTimes[x];
                            if (currentStudentTime.getMonth()+1 == currentMonth && currentStudentTime.getDate() == currentDay && currentStudentTime.getHours() >= start && currentStudentTime.getHours() <= end)
                            {
                                studentHasTime = true;
                            }
                        }
                        var td = $("<td></td>");
                        if (studentHasTime)
                        {
                            $(td).addClass("selected");
                            $(td).text("X");
                        }
                        $(row).append(td);
                    });
                    $(table).find("tbody").append(row);
                    var total = $(row).find("td.selected").length;
                    $(row).append("<td>"+total+"</td>");
                }

                var finalrow = $("<tr><td>Total</td></tr>");
                var bigtotal = 0;
                for (var i = 1; i < $(table).find("thead tr th").length -1; i++)
                {
                  var total = $(table).find("tbody td:nth-child("+(i+1)+").selected").length;
                  $(finalrow).append("<td>"+total+"</td>");
                  bigtotal += total;
                }
                $(finalrow).append("<td>"+bigtotal+"</td>");
                $(table).find("tbody").append(finalrow);

                $("body").append(table);
            }


            $(document).ready(function(){
                buildTable();
            });
        </script>
    </head>
    <body>
        <a href="${pageContext.request.contextPath}?currentdir=${param.currentdir}">Back</a>
        
        <div class="time">
            Weekday <select class="weekday" onchange="buildTable()">
                <option value="Mon">Monday</option>
                <option value="Tue">Tuesday</option>
                <option value="Wed">Wednesday</option>
                <option value="Thu">Thursday</option>
                <option value="Fri">Friday</option>
                <option value="Sat">Saturday</option>
                <option value="Sun">Sunday</option>
            </select>

            Start Time: <select class="start" onchange="buildTable()">
                <option value="9">09:00</option>
                <option value="10">10:00</option>
                <option value="11">11:00</option>
                <option value="12">12:00</option>
                <option value="13">13:00</option>
                <option value="14">14:00</option>
                <option value="15">15:00</option>
                <option value="16">16:00</option>
                <option value="17">17:00</option>
                <option value="18">18:00</option>
                <option value="19">19:00</option>
            </select>

            End Time: <select class="end" onchange="buildTable()">
                <option value="10">10:00</option>
                <option value="11">11:00</option>
                <option value="12">12:00</option>
                <option value="13">13:00</option>
                <option value="14">14:00</option>
                <option value="15">15:00</option>
                <option value="16">16:00</option>
                <option value="17">17:00</option>
                <option value="18">18:00</option>
                <option value="19">19:00</option>
                <option value="20">20:00</option>
            </select>

            <!--<button onclick="addnew()">+</button>-->

            <br/>&nbsp;

        </div>
    </body>
</html>