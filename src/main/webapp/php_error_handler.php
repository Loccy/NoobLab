<?php

/* This page MUST go in the top level of the noobdata directory. Assuming noobdata isn't in your
 * servlet container area, you will need to copy it over to your alternate web server for
 * web-based exercises.
 */

$php_errors = Array();

set_error_handler("errorHandler");
register_shutdown_function("shutdownHandler");

function errorHandler($error_level, $error_message, $error_file, $error_line, $error_context)
{ 
$error = "lvl: " . $error_level . " | msg:" . $error_message . " | file:" . $error_file . " | ln:" . $error_line;
switch ($error_level) {
    case E_ERROR:
    case E_CORE_ERROR:
    case E_COMPILE_ERROR:
    case E_PARSE:
        relog($error, "fatal");
        break;
    case E_USER_ERROR:
    case E_RECOVERABLE_ERROR:
        relog($error, "error");
        break;
    case E_WARNING:
    case E_CORE_WARNING:
    case E_COMPILE_WARNING:
    case E_USER_WARNING:
        relog($error, "warn");
        break;
    case E_NOTICE:
    case E_USER_NOTICE:
        relog($error, "info");
        break;
    case E_STRICT:
        relog($error, "debug");
        break;
    default:
        relog($error, "warn");
}
}

function shutdownHandler() //will be called when php script ends.
{
	global $php_errors;
	$lasterror = error_get_last();
	switch ($lasterror['type'])
	{
    		case E_ERROR:
    		case E_CORE_ERROR:
    		case E_COMPILE_ERROR:
    		case E_USER_ERROR:
	    	case E_RECOVERABLE_ERROR:
	    	case E_CORE_WARNING:
    		case E_COMPILE_WARNING:
    		case E_PARSE:

		// inject the error dialogue Javascript back in,
		// seeing as how PHP gives us a delightful empty
		// page when there's a show-stopping error
?>
<script type="text/javascript">
var errordialog=function(msg, url, linenumber,lang){if (lang == undefined) lang = 'Javascript';var dialog=document.createElement("div");dialog.className='errordialog';dialog.style.position='fixed';dialog.style.border='2px solid black';dialog.style.margin='3px';dialog.style.padding='3px';dialog.style.fontFamily='monospace';dialog.style.backgroundColor='white';dialog.style.top='0px';dialog.style.left='0px';url = url.split('/').pop();dialog.innerHTML='<b style="color:red">'+lang+' Error: </b>' + msg +' at line number ' + linenumber +' of '+url;var siLoop = setInterval(function(){if (document.readyState == 'interactive' || document.readyState == 'complete') {clearInterval(siLoop);parent.$(document.body).append(dialog);parent.$(dialog).fadeTo(1,75);parent.$('div.tab').each(function(){if (parent.$(this).contents().eq(0).text() == url) {if (!parent.$(this).hasClass('selected')) {parent.$(this).click();}parent.editor.focus();parent.editor.setLineClass(linenumber-1,'error');parent.editor.setCursor(linenumber-1);};});};},1000);return true;};
</script>
<?php
        	$error = "[SHUTDOWN] lvl:" . $lasterror['type'] . " | msg:" . $lasterror['message'] . " | file:" . $lasterror['file'] . " | ln:" . $lasterror['line'];
        	relog($error,"fatal");
	}
	
	if (!empty($php_errors))
	{ 
	$js = '<script type="text/javascript">';
	$js = $js.'var errors = '.json_encode($php_errors).";";
	$js = $js.'var errorDetails = errors[0].split("|");';
	$js = $js.'var category = errorDetails[0].trim();';
	$js = $js.'var msg = errorDetails[2].replace("msg:","").trim();';
	$js = $js.'if (msg.indexOf("unexpected") != -1) msg += \'<span style="color: gray"> (maybe you have a missing ; or curly bracket in the line above...?)</span>\';';
	$js = $js.'var file = errorDetails[3].split("/").pop().trim();';
	$js = $js.'var lineno = errorDetails[4].split(":").pop().trim();';
	$js = $js.'errordialog(category+": "+msg,file,lineno,"PHP");';
	$js = $js. "</script>";
	echo $js;
	}
}

function relog($error, $errlvl)
{
	global $php_errors;
	$error_text = $errlvl." |  ".$error;
	$php_errors[] = $error_text;
} 
?> 
