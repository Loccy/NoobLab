//LAUNCH WORKER
Module["print"] = function(msg) { 
    var t = new Date().getTime(); while (new Date().getTime() < t + 2);
    cout(msg); //,"color:white; padding-left: 15px;"); 
};
Module["clear"] = function() { console.clear(); }; 
Module["printErr"] = function(msg) { 
	if(msg == "Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module[\"noExitRuntime\"] = true or build with -s NO_EXIT_RUNTIME=1")
	{
		self.postMessage({action:"end"});
		return;
	}
	cout(msg); 
};

if(typeof(self) != undefined)
{
    self.urlcontext = "";
    self.db = undefined;    
    
    var request = self.indexedDB.open('cppconsole');
    cout("Past DB line on PRE\n");
    request.onsuccess = function(e)
    {
        cout("DB OPEN SUCCESS ON PRE\n");
        self.db = e.target.result;

        self.postMessage({action:"ready"});

        //read messages
        self.addEventListener('message', function(e) {
                if(!Module['_main'])
                {
                        cout("No main function found","color: red");
                        return;
                }
                if( e.data.action == "callMain")
                {                    
                    coutclear();
                    self.urlcontext = e.data.urlcontext;
                    Module.callMain();           
                    self.postMessage({action:"end"});
                }

                if (e.data.action == "updateStdin")
                {
                    self.cppstdin = e.data.params;                                    
                }
                
                if (e.data.action == "setContext")
                {
                    self.urlcontext = e.data.urlcontext;
                    cout("set URL context");
                }                                
        }, false);
    }
     
}
//END *********