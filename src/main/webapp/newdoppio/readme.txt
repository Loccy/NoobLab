Doppio is a JVM implemented in Javascript by the PLASMA group at the
University of Massachusetts. Their Github is 

https://github.com/plasma-umass/doppio

In previous builds of NoobLab I've been using a (very old!) version of Doppio
that I had built in approximately 2012. I am a firm believer of "don't mess
with a running system", so there was little incentive to update. However,
when looking to introduce a new graphics subsystem into NoobLab I began to
run up against performance issues with the old version of Doppio. Later
versions of Doppio have dramatically improved performance, along with
support for Java 8 (we were stuck on 6). It was time to update.

Unfortunately, try as I might, I was unable to get the current (Dec 2017) builds
of Doppio (either their current Master branch or their latest release) to
build on ANY platform (tried Windows, Linux AND Mac!).

Thus, the contents of the newdoppio folder were scavenged from the Doppio
demo in December 2017. At the time they dated their build as "demo version
@36260b built 5/25/2016" and was found at

https://plasma-umass.github.io/doppio-demo/

Some mods/hacks have been introduced to adapt the (minified!) code into the
context of NoobLab:

* In app.js, the BrowserFS object is added to the global scope. To replicate
  in the vanilla minified version of app.js, search for the string "Checking
  browser cache". Add 

  window.fs = o;

  between the BFSRequire("fs"); and the s.text

* Also in app.js, we have removed the output of the motd. To replicate (this
  is a bit harder!) search for u.readFile(this._shellHistoryFile,function(n,r)
  and remove the e.stdout(t) that is nearby.

* Also in app.js, we have remove the "unknown command" response in the
  terminal. Search for "unknown command" and you can just make the output to
  stderr an empty string (probably easier than trying to get the syntax of
  the minified code right)
     - this is probably not needed any more as we disable the ability to
       enter commands in the shell outside of Javascript.

* Also also in app.js, we have removed the prompt. To replicate, look for
  this._terminal(write(this._ps()+"") and remove it. Be careful not to mess
  up the minified grammar/syntax!

* Also also also in app.js, we have made the shell publicly accessible. To
  replicate, look for var=25 and insert window.shell = this; just before.

* Also also also also in app.js, we have extended shell.loadingCompleted so
  that it calls newDoppioLoaded in shims.js. Look for 
  t.prototype.loadingCompleted and add a simple newDoppioLoaded() call at the
  beginning of the function.

* index.html and associated CSS has been butchered so that all is displayed
  is the console. Some aspects of the original demo's HTML are retained and
  set to display: none as it was easier to programmatically interact with
  the demo's UI components than to wade through the minified code and find
  a more elegant way to start things up.

* shims.js contains a few bits both to get past all the hackery and provide
  some small functions that are helpful in the NoobLab context.

Doppio (plus BrowserFS and xterm.js, which is included) is licenced under the 
MIT licence:

Doppio
Copyright (c) 2012, 2013, 2014, 2015 John Vilk, CJ Carey, Jez Ng, and 
Jonny Leahey.

BrowserFS
Copyright (c) 2013, 2014, 2015, 2016, 2017 John Vilk and other BrowserFS
contributors.

xterm.js 
Copyright (c) 2014-2016, SourceLair Private Company (https://www.sourcelair.com)
Copyright (c) 2012-2013, Christopher Jeffrey (https://github.com/chjj/)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

doppio_home.zip contains files from OpenJDK, the licencing of which is either
under GPLv2 or GPLv2 plus the Classpath exception.