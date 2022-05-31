var $builtinmodule = function(name)
{
    var mod = {};
    var feedbacks = [];
    
    mod.regexReplace = new Sk.builtin.func(function(str,regex,replacement){
       str = str.v;
       regex = regex.v;
       replacement = replacement.v;
       result = eval('str.replace('+regex+',replacement)');
       return Sk.builtin.str(result);
    });
    
    mod.alert = new Sk.builtin.func(function(text){
       alert(text.v); 
    });
    
    mod.setMaxCycles = new Sk.builtin.func(function(maxCycles){
        pythonmaxcycles = maxCycles;
    });
    
    mod.getMaxCycles = new Sk.builtin.func(function(){
        return pythonmaxcycles;
    });
    
    mod.getOutput = new Sk.builtin.func(function(){
       return Sk.builtin.str($("div#output-py").clone().children().remove().end().text().trim()); 
    });
    
    mod.getCode = new Sk.builtin.func(function(){
       return Sk.builtin.str(parent.editor.getValue()); 
    });
    
    mod.getOutputLines = new Sk.builtin.func(function(){
       var result = $("div#output-py").clone().children().remove().end().text().trim().split(/\n/g);
       for (var i = 0; i < result.length; i++)
       {
           result[i] = Sk.builtin.str(result[i]);
       }
       return Sk.builtin.list(result); 
    });
    
    mod.initialiseCarol = new Sk.builtin.func(function(){        
       parent.carol.initialiseCarol(); 
    });
    
    mod.feedback = new Sk.builtin.func(function(fb){
       feedbacks.push(fb.v); 
    });
    
    mod.getFeedbacks = new Sk.builtin.func(function(){
       return Sk.builtin.list(feedbacks); 
    });
    
    mod.jsEval = new Sk.builtin.func(function(code){
       code = code.v;
       var result = eval(code);
       if (typeof result == "string")
       {
            return Sk.builtin.str(result);
       }
       else return result;
    });
    
    mod.debug = new Sk.builtin.func(function(msg){        
        console.log(msg.v);
    });
    
    mod.cls = new Sk.builtin.func(function(){
       cls();
   });
   
   mod.greatSuccess = new Sk.builtin.func(function(id,medal,fb){  
       if (feedbacks.length == 0) feedbacks = undefined;
       var medal = medal.v;
       if (medal == "undefined") medal = undefined;       
       $("div#output-py").contents().remove();
       parent.medalGreatSuccess(medal,feedbacks);
    });
    
    mod.epicFail = new Sk.builtin.func(function(successful,target){        
       if (feedbacks.length == 0) feedbacks = undefined;
       $("div#output-py").contents().remove();       
       parent.medalEpicFail(successful.v,target.v,feedbacks)
       //alert("Epic fail at "+id.v+", "+medal.v);
       //console.log(id.v);
       //console.log(medal.v);
    });
    
    return mod;
}

