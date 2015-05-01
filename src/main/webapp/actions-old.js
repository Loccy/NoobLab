var lastcode = "";
var lastid = "";

function logActivity(activity,position, details, code, module)
{
    details = details+"";
    details = details.replace(/\s/g," ");
    
    var date = new Date();
    if (code == undefined) code = "";

    var dateString = ('0' + date.getHours()).slice(-2)+":"+
                     ('0' + date.getMinutes()).slice(-2)+":"+
                     ('0' + date.getSeconds()).slice(-2)+" "+
                     date.getFullYear()+"/"+
                     ('0' + (date.getMonth()+1)).slice(-2)+"/"+
                     ('0' + date.getDate()).slice(-2);
    $.ajax({
        data : {
            datetime : dateString,
            activity : activity,
            position : position,
            details : details,
            code : code,
            module : module
        },
        type : "POST",
        url : contextPath + "/LogActivity"
    });
    
    // update local stash
    lastLogEntries.push([dateString,"0.0.0.0",activity,position,details,code])
    if (lastLogEntries.length > 20)
    {
        // remove first - keep 20
        lastLogEntries.shift();
    }
}

function logEmotion(eventtype,emotion,source)
{
    var position = CLSstr()+":"+source;
    $.ajax({
        data : {
            eventtype : eventtype,
            position : position,
            emotion : emotion
        },
        type : "POST",
        url : contextPath + "/LogEmotion"
    });
}

function lastLogAsString()
{
    return lastLogEntries.toString().replace(/,(\d\d:)/g,"\n$1");
}


function CLstr() {
    // get courseno
    var courseno = $("#content div.parameter#courseNo").text().trim();
    // get lesson no
    var lessonNo = $("#content div.parameter#lessonNo").text().trim();

    return courseno+":"+lessonNo;
}

function CLSstr() {
    // get section number
    var sectionNo = parseInt($(".navitem.selected").text().trim().replace("Part ",""));
    return CLstr()+":"+sectionNo;
}

// not used - done server side
function LOGloggedIn(module)
{
    logActivity("Login","","","",module);
}


function LOGloggedOut()
{
    logActivity("Logout",CLSstr(),"");
}

function LOGcheat(source)
{
    logActivity("LoadCheat",CLSstr(),source,"");
}

function LOGload(code)
{
    logActivity("Load",CLSstr(),"",code);
}

function LOGsessionNav()
{   
    // log
    logActivity("Navigation",CLSstr(),"");
}

function LOGquizInteract(sourceDistractor)
{
    // get questionNo from original question title
    var qno = $(sourceDistractor).closest(".qqmain").find(".qno").text().trim();
    // get right or wrong from original distractor
    var dstatus = $(sourceDistractor)[0].className.replace("distractor ","");
    // get distractor text
    var dtext = $(sourceDistractor).contents().eq(0).text().trim();

    logActivity("QuizInteractMCQ",CLSstr()+":Q"+qno,dstatus+" ("+dtext+")");
}

function LOGquizInteractText(source,status,answer)
{
    // get questionNo from original question title
    var qno = $(source).closest(".qqinput").find(".qno").text().trim();

    logActivity("QuizInteractInput",CLSstr()+":Q"+qno,status+" ("+answer+")");
}

function LOGcodePaste(code,pasteType)
{
    lastcode = code;
    if (!pasteType) pasteType = "FromExemplar";
    logActivity("CodePaste"+pasteType,CLSstr(),"",code);
}

function LOGcodeClear()
{
    logActivity("CodeClear",CLSstr(),"");
}

function LOGhiddenRun(origId,code)
{
    if (origId != "") origId = ":ID-"+origId;
    logActivity("RunExemplarStart",CLSstr()+origId,"",code);
}

function LOGrun(code)
{
    var diff = getLevenshteinDistance(lastcode,code);
    lastcode = code;
    logActivity("RunStart",CLSstr(),diff,code);
}

function LOGerror(errorText)
{
    errorText = errorText.replace("<br/>","/");
    logActivity("RuntimeError",CLSstr(),errorText);
}

function LOGsyntaxError(errorText)
{
    errorText = errorText.replace("<br/>","/");
    logActivity("SyntaxError",CLSstr(),errorText);
}

function LOGbreak()
{
    logActivity("RunBreak",CLSstr(),"");
}

function LOGrunInput(inputVal)
{
    logActivity("RunUserInput",CLSstr(),inputVal);
}

function LOGrunSuccess()
{
    logActivity("RunSuccess",CLSstr(),"");
}

function LOGtestStart(id,code,fake)
{
    var diff = (fake) ? "test overridden" : getLevenshteinDistance(lastcode,code);
    lastcode = code;
    lastid = id;
    if (id != "") id = ":"+id;
    logActivity("TestStart",CLSstr()+id,diff,code);
}

function LOGcontentScroll(distance)
{
    logActivity("ContentScroll",CLSstr(),distance,"");
}

function LOGtestPassed()
{
    logActivity("TestPassed",CLSstr()+":"+lastid,"");
    lastid = "";
    // also need to update client-side record of medals/tests
    setTimeout(function(){
        updateTestCases();
    },3000); // 3 seconds should be enough for the AJAX update to get there
}

function LOGmedal(newMedal)
{
    logActivity("Medal",CLSstr(),newMedal,"");
    // also need to update client-side record of medals/test
    setTimeout(function(){
        updateTestCases();
    },3000); // 3 seconds should be enough for the AJAX update to get there
}

function LOGtestFailed(details)
{
    logActivity("TestFailed",CLSstr()+":"+lastid,details);
}

/* Stolen from http://jango.wordpress.com/2008/05/05/getlevenshteindistance-in-javascript/
 * No copyright or licence details, so assuming this is public domain.
 */
function getLevenshteinDistance(s,t) {
    if (s == null || t == null) {
        return -1;
    }
    var n = s.length; // length of s
    var m = t.length; // length of t        
    if (n == 0) {
        return m;
    } else if (m == 0) {
        return n;
    }
    
    if (n > 7000 || m > 7000) return "(code too long)";
    
    var p = new Array(n+1); //previous cost array, horizontally
    var d = new Array(n+1); // cost array, horizontally
    var _d; //placeholder to assist in swapping p and d
    // indexes into strings s and t
    var i; // iterates through s
    var j; // iterates through t
    var t_j; // jth character of t
    var cost; // cost
    for (i = 0; i<=n; i++) {
        p[i] = i;
    }
    for (j = 1; j<=m; j++) {
        t_j = t.charAt(j-1);
        d[0] = j;
        for (i=1; i<=n; i++) {
            cost = s.charAt(i-1)==t_j ? 0 : 1;
            // minimum of cell to the left+1, to the top+1, diagonally left and up +cost
            d[i] = Math.min(Math.min(d[i-1]+1, p[i]+1), p[i-1]+cost);
        }
        // copy current distance counts to �previous row� distance counts
        _d = p;
        p = d;
        d = _d;
    }
    // our last action in the above loop was to switch d and p, so p now
    // actually has the most recent cost counts
    return p[n];
}
