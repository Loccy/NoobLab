var $builtinmodule = function(name)
{
    var mod = {};
    var feedbacks = [];
    
    mod.alert = new Sk.builtin.func(function(text){
       alert(text.v); 
    });
    
    mod.getOutput = new Sk.builtin.func(function(){
       return Sk.builtin.str($("div#output-py").clone().children().remove().end().text().trim()); 
    });
    
    mod.getCode = new Sk.builtin.func(function(){
       return Sk.builtin.str(parent.editor.getValue()); 
    });
    
    mod.getOutputLines = new Sk.builtin.func(function(){
       return Sk.builtin.list($("div#output-py").clone().children().remove().end().text().trim().split(/\n/g)); 
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

