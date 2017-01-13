//BASIC OUTPUT FROM WORKER ************
if(typeof(self) != undefined)
{
	self.console = {
		clear: function()
		{
                    var t = new Date().getTime(); while (new Date().getTime() < t + 1); // add delay so messages can't saturate the main thread
                    self.postMessage({action:"eval", instance: "console", method:"clear"});
		},

		log: function(msg)
		{
                    var t = new Date().getTime(); while (new Date().getTime() < t + 1); // add delay so messages can't saturate the main thread
                    self.postMessage({action:"eval", instance: "console", method:"log", params: msg});
		},

		err: function(msg)
		{
                    var t = new Date().getTime(); while (new Date().getTime() < t + 1); // add delay so messages can't saturate the main thread
                    self.postMessage({action:"eval", instance: "console", method:"err", params: msg});
		}
	}
        
        self.coutclear = function()
        {
            self.postMessage({ action : "coutclear"});
        }

	self.cout = function(msg)
	{
            var t = new Date().getTime(); while (new Date().getTime() < t + 1); // add delay so messages can't saturate the main thread
            self.postMessage({action:"cout", params: msg });
	}
        
        self.lastline = null;
        
        var Module = {
            preRun: function() {     
                function stdin() {  
                  if (self.lastline == null)
                  {
                    do
                    {
                      var line = "**(empty)**";
                      var ajax = new XMLHttpRequest();
                      ajax.open('GET', self.urlcontext+'/CPPConsole?mode=get', false);
                      ajax.send(null);
                      line = ajax.responseText.trim();
                      var t = new Date().getTime(); while (new Date().getTime() < t + 1000);
                    } while (line == "**(empty)**");
                  }
                  if (self.lastline == null)
                  {
                      var ascii = line.charCodeAt(0)
                      self.lastline = line.slice(1)+"\n";
                      return ascii;
                  }
                  else if (self.lastline != "")
                  {
                      var ascii = lastline.charCodeAt(0);
                      self.lastline = self.lastline.slice(1);
                      return ascii;
                  }
                  else
                  {
                      self.lastline = null;
                      return null;
                  }                  
            }

            function stdout(asciiCode) {
                cout(String.fromCharCode(asciiCode));
                // Do something with the asciiCode
            }

            function stderr(asciiCode) {
                // Do something with the asciiCode
            }

            FS.init(stdin, stdout, stderr);
         }
      };
}
//END ************************************

