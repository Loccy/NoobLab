The noobdata directory needs to be specified in the WEB-INF. This is where
NoobLab will store its data - user logs, any submissions, temporary user
data e.g. compiled files etc and any pages for "fullweb" exercises.

In most configurations this will not remain in the directory the expanded
WAR file leaves it. You will need to place it somewhere else on the file system
and make it web-accessible. Within noobdata a fuillweb directory is created
that stores all web content (HTML, CSS, PHP, any exercises that involve 
"programs" that are hosted by a web server) created by students.

The assumption is that a standard web server (e.g. plain Apache rather than
a servlet container) will be used to host these files. The "output" window
in NoobLab for such exercises is basically an iframe that points to this
secondary web server.

You will need to configure the following parts of WEB-INF:

<context-param>
    <description>Data dir</description>
    <param-name>datadir</param-name>
    <param-value>/data/noobdata</param-value>
</context-param>
<context-param>
    <description>Fullweb URL</description>
    <param-name>fullweburl</param-name>
    <param-value>/noobdata</param-value>
</context-param>

The Data dir parameter is the explicit file system path at which the noobdata
directory can be found. The directory also needs to be web accessible. The
Fullweb URL parameter is the URL at which the base noobdata URL can be found
on the web. You will need to configure your web server accordingly. This can
take the form of a relative or absolute URL.

In the example above, the application is available at 
https://www.nooblab.com/NoobLab. The noobdata directory is available in
/data/noobdata. Thus the web server has been configured so that
https://www.nooblab.com/noobdata maps to /data/noobdata on the filesystem.

If the prefixing slash was omitted, the assumption would be that the web
server had the noobdata directory mapped to appear as a subdirectory of the
based URL, i.e. http://www.nooblab/com/NoobLab/noobdata (which might be
preferable in some configurations). Alternatively a full absolute URL can be
used.

Do be aware of your http v https! If NoobLab is running on an SSL-enabled
server (it should be!) and your student's authored pages are served up from
plain HTTP you may run into browser issues regarding mixed content. I've also 
never tested a situation where the two servers would break the same origin
policy. I can't imagine it would end well, though...

To ensure that students see user friendly error messages in the NoobLab UI
(rather than deep within the bowels of the error.log that Apache generates),
you will need to make sure that your web server/PHP configuration prepends
noobdata/php_error_handler.php to all PHP files served from noobdata and its
subdirectories. If you are using Apache, we suggest placing either an .htaccess
or a .user.ini in your noobdata directory to achieve this. Examples for Apache
are included in the same directory as this readme file. Other servers are left
as an exercise for the so-inclined (we'll award you a gold medal if you make
it work! :-)

In Apache, if you are using the prefork MPM, then PHP is most likely running as
an Apache module and you will need to use the .htaccess. If you are using
FPM/fastcgi (almost certain if your MPM is worker or event), then use the
.user.ini. If you're not sure, try both at the same time. Having both there 
shouldn't break anything, although you are adding a (small) overhead if you're
on FPM/fastcgi. If you know for certain that you're on FPM/fastcgi then ideally
you should use the .user.ini only.

The .htaccess is configured so that it will kick in if it detects mod_php5,
mod_php6 (shouldn't ever happen), mod_php7 or mod_php8 (greetings from the
future!). Again, if you know the specifics of your configuration, and you
know for a fact that you're using mod_php of some flavour, you can delete
all the IfModules and IfDefines and just have a single line .htaccess with
the php_value directive.