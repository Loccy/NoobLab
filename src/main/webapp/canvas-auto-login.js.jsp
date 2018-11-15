window.addEventListener("load",function(){
  window.addEventListener('message', function(event) {      
    var data = JSON.parse(event.data);
    var canvasid = data.quicklaunch.user_id;
    // get ID from canvasid
    var canvastoken = "${initParam.canvastoken}";
    //var host = new URL(document.referrer).host;
    // suck my cheesy one, Internet Explorer...
    var host = document.createElement("a"); host.href = document.referrer; host = host.hostname;

    $.get("${pageContext.request.contextPath}/ajaxproxy?_url=https://"+host+"/api/v1/users/"+canvasid+"/profile?access_token="+canvastoken,function(result){        
        console.log(result);
        var loginid = result.login_id.split("@")[0].toLowerCase();        
        if (canvasid != undefined) location.href = "//"+location.host+location.pathname+"?embedmedal="+loginid;
    });    
  });
  if (document.referrer.indexOf("${initParam.emsources}") != -1 && document.referrer != "") parent.postMessage('{ "quicklaunch" : true }',"*");  
});

/*
$(document).ready(function(){
    if (document.referrer.indexOf("${initParam.emsources}") != -1 && document.referrer != "")
    {
        // Figure out Canvas API link from referrer
        var host = new URL(document.referrer).host;
        $.get("//"+host+"/api/v1/users/self/profile",function(result){
            var loginid = result.login_id;
            if (loginid != undefined) loginid = loginid.split("@")[0];
            loginid = loginid.toLowerCase();
            location.href = "//"+location.host+location.pathname+"?embedmedal="+loginid;
        });
    }
});
*/