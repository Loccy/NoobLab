The noobdata directory needs to be specified in the WEB-INF. This is where
NoobLab will store its data - user logs, any submissions, temporary user
data e.g. compiled files etc and any pages for "fullweb" exercises.

In most configurations this will not remain in the directory the expanded
WAR file leaves it. You will need to place it somewhere else on the file system
and make it web-accessible. Within noobdata a fuillweb directory is created
that stores all web content (HTML, CSS, PHP, any exercises that involve 
"programs" that are hosted by a web served) created by students.

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
http://www.nooblab.com/NoobLab. The noobdata directory is available in
/data/noobdata. Thus the web server has been configured so that
http://www.nooblab.com/noobdata maps to /data/noobdata on the filesystem.

If the prefixing slash was omitted, the assumption would be that the web
server had the noobdata directory mapped to appear as a subdirectory of the
based URL, i.e. http://www.nooblab/com/NoobLab/noobdata (which might be
preferable in some configurations). Alternatively a full absolute URL can be
used.

You will need to make sure that your web server/PHP configuration prepends
noobdata/php_error_handler.php to all PHP files served from noobdata and its
subdirectories. If you are using Apache, we suggest placing either an .htaccess
or a .user.ini in your noobdata directory. Which is required will depend on
your Apache configuration (you will do no harm by having both if you are not
sure which is necessary).