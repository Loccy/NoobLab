/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;


import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.WildcardFileFilter;
import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTimeComparator;
import org.joda.time.LocalTime;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import uk.ac.kingston.nooblab.stats.StudentStatuses;

/**
 *
 * @author paulneve
 */
public class Main extends HttpServlet
{

    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        // set request parameter to de-crap IE on KU network
        response.addHeader("X-UA-Compatible", "IE=Edge");
        
        boolean httpsOnImages = "true".equalsIgnoreCase(getServletContext().getInitParameter("httpsOnImages"));
        
        String contentsrc = request.getParameter("contentsrc");        
        if (contentsrc == null)
        {
            // do we have it courtesy of a RESTful URL?
            String pathInfo = request.getPathInfo();
            if (pathInfo != null)
            {
                pathInfo = pathInfo.substring(1);
                contentsrc = pathInfo;
            }
        }
        Document doc = null;
        if (contentsrc != null)
        {
            // get learning content from t'interwebs
            doc = Jsoup.connect("http://"+contentsrc).get();
        }
        
        // are we logged in?                
        if (request.getSession().getAttribute("username") == null)
        {
            // if not, grab original URL and bounce to login page
            String originalUrl = request.getRequestURL().toString();
            if (request.getQueryString() != null) originalUrl += "?"+request.getQueryString().toString();
            request.setAttribute("originalUrl",originalUrl);
            
            try
            {
                if (doc.select("div.parameter#open").text().trim().equals("true"))
                {
                    request.setAttribute("registerAvailable","true");
                }
            }
            catch (Exception e)
            {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "No content specified in NoobLab URL.");
                return;
            }
            
            RequestDispatcher rd = request.getRequestDispatcher("/login.jsp");
            rd.forward(request, response);
            return;
        }
        
        String username = request.getSession().getAttribute("username").toString();                  
                //request.getSession().getServletContext().getInitParameter("datadir")+"/"+username+"/";
        String freshlogin = (String)request.getSession().getAttribute("freshlogin");

        // do we have a url parameter?
        String urlstr = request.getParameter("url");                

        String data = "";
        if (urlstr != null) data = shiteWget(urlstr);
        data = data.replace("\"","\\\"");
        request.setAttribute("codetext", data);
        
        if (contentsrc != null)
        {
            // handle alternates            
            String alt = doc.select("div.parameter[id=defaultAlternate]").text().trim();
            if (!alt.equals(""))
            {                
                // if we have a default alternate...
                // check which alternate we're after
                String suppliedalt = request.getParameter("alt");
                if (suppliedalt != null && !suppliedalt.trim().equals(""))
                {
                    alt = suppliedalt.trim();
                }
                
                // remove all divs of class alternate that don't have a data-alt matching
                doc.select("div.alternate").not("[data-alt="+alt+"]").remove();
            }                        
            
            String adminExceptions = getServletContext().getInitParameter("adminExceptions");
            if (adminExceptions.equals("")) adminExceptions = "noOneWillEverHaveThisUserNameSoTheMatchWillNeverActuallyHappen:-D";
            
            // is this a restricted piece of content?
            String ipRestricts = doc.select("div.parameter[id=ipRestrict]").text().trim();                        
            if (!ipRestricts.equals("") && !username.matches(adminExceptions))
            {                
                boolean valid = false;
                for (String ipRestrict : ipRestricts.split(","))
                {
                    if (!request.getRemoteAddr().contains(ipRestrict)) valid = true;
                    if (request.getRemoteAddr().contains("127.0.0.1")) valid = true; // if from localhost
                }
                if (!valid)
                {
                    String originalCNo = doc.select("div.parameter[id=courseNo]").text();
                    doc.select("div.parameter[id=courseNo]").html("BLOCKED-"+originalCNo);
                    // remove all sections
                    doc.select("div.section").remove();
                    // add a "you naught boy" section
                    doc.body().append("<div class=\"section\" id=\"blocked\">"+
                        "<h2 class=\"title\">Content blocked - invalid location</h2>"+
                        "<b>This particular content may only be accessed from a particular location - probably within the University.</b>"+
                        "<p>Contact your tutor for further information, or if you have received this message in error.</p></div>");
                }
            }
            
            String originalCNo = doc.select("div.parameter[id=courseNo]").text();
            String originalLNo = doc.select("div.parameter[id=lessonNo]").text();
            
            if (originalCNo != null)
            {
                request.getSession().setAttribute("module", originalCNo);                
            }
            String basedir = MiscUtils.getDataDir(request)+"/"+username+"/";       
            
            String language = doc.select("div.parameter[id=language]").text();
            if ("python".equals(language) || "pythoncarol".equals(language))
            {
                request.setAttribute("blocklylang","python");                
            }
            else
            {                
                request.setAttribute("blocklylang","pcode");
            }
            
             // is this a restricted piece of content that needs to be unlocked at
            // a particular place and/or time?
            ipRestricts = doc.select("div.parameter[id=lockPlace]").text().trim();            
            if (!ipRestricts.equals("") && !username.matches(adminExceptions))
            {                
                // get their current unlock file
                String unlockstr = "";
                try {
                    unlockstr = FileUtils.readFileToString(new File(basedir+"/unlocked.txt"));
                } catch (Exception e) {};
                // if not already unlcoked
                if (!unlockstr.contains(originalCNo+"-"+originalLNo))
                {
                    boolean validTime = false;
                    boolean validPlace = false;
                    // do we have a lockTimeDay?
                    // Should be in format Mon 09:00-11:00
                    String lockTimeDay = doc.select("div.parameter[id=lockTimeDay]").text().trim();
                    if (lockTimeDay.equals(""))
                    {
                        validTime = true;
                    }
                    else
                    {
                        // check whether it's a valid time
                        String[] x = lockTimeDay.split(" ");
                        String day = x[0];
                        x = x[1].split("-");
                        LocalTime startime = new LocalTime(x[0]);
                        startime = startime.minusMinutes(10);
                        LocalTime endtime = new LocalTime(x[1]);
                        endtime = endtime.plusMinutes(10);
                        String currentDay = StringUtils.left(new SimpleDateFormat("EEEE", Locale.ENGLISH).format(System.currentTimeMillis()),3);
                        LocalTime currentTime = new LocalTime();
                        DateTimeComparator compare = DateTimeComparator.getTimeOnlyInstance();
                        
                        if (currentDay.equalsIgnoreCase(day) && currentTime.isAfter(startime) && currentTime.isBefore(endtime))
                        {
                            validTime = true;
                        }
                    }
                    for (String ipRestrict : ipRestricts.split(","))
                    {
                        if (!request.getRemoteAddr().contains(ipRestrict)) validPlace = true;
                        if (request.getRemoteAddr().contains("127.0.0.1")) validPlace = true; // if from localhost
                    }
                    if (!validTime || !validPlace)
                    {
                        doc.select("div.parameter[id=courseNo]").html("BLOCKED-"+originalCNo);
                        // remove all sections
                        doc.select("div.section").remove();
                        // add a "you naught boy" section
                        doc.body().append("<div class=\"section\" id=\"blocked\">"+
                        "<h2 class=\"title\">Content requires unlocking</h2>"+
                        "<b>This particular content must be unlocked by logging into it at/during a scheduled workshop session.</b>"+
                        "<p>Your tutor will give you the details as to when and where you need to unlock this content.</p>"+
                        "<p>Once you have unlocked this page, you will be able to work on it remotely on any computer and at any time you like.</p>"+
                        "<p>Contact your tutor for further information, or if you feel you have received this message in error.</p></div>");
                    }
                    else
                    {
                        // need to update the unlock file
                        if (!unlockstr.equals("")) unlockstr += ",";
                        unlockstr += originalCNo+"-"+originalLNo;
                        FileUtils.writeStringToFile(new File(basedir+"/unlocked.txt"),unlockstr);
                    }
                }
            }
            
             // is this a restricted piece of content based on top level parameter#testRestrict?
            Elements globalTestRestrict = doc.select("div.parameter[id=testRestrict]");
            if (!globalTestRestrict.isEmpty())
            {      
                boolean pass = true;
                String detailsHtml = globalTestRestrict.select("div.details").html();
                // get prereq test IDs and locations
                Elements prereqtestsEs = globalTestRestrict.select("div.prereqtest");
                Elements prereqlocsEs = globalTestRestrict.select("div.prereqloc");
                Elements prereqdescsEs = globalTestRestrict.select("div.prereqdesc");
                ArrayList<String> prereqtests = new ArrayList<String>();
                ArrayList<String> prereqlocs = new ArrayList<String>();
                ArrayList<String> prereqdescs = new ArrayList<String>();
                for (int i = 0; i < prereqtestsEs.size(); i++)
                {
                    prereqtests.add(prereqtestsEs.get(i).text());
                    prereqlocs.add(prereqlocsEs.get(i).text());
                    prereqdescs.add(prereqdescsEs.get(i).text());
                }
                try
                {
                    pass = StudentStatuses.hasPassedTest(prereqtests,basedir+"tests.csv");    
                } catch (Exception e) { e.printStackTrace();};
                if (!pass)
                {                                         
                    doc.select("div.parameter[id=courseNo]").html("BLOCKED-"+originalCNo);
                    // remove all sections
                    doc.select("div.section").remove();
                    // add a "you naught boy" section
                    doc.body().append("<div class=\"section\" id=\"blocked\">"+
                        "<h2 class=\"title\">You can't view this lesson... yet!</h2>"+
                        "<b>This particular lesson can only be unlocked if you've completed the appropriate work that leads up to it.</b>");
                    if (!detailsHtml.equals(""))
                    {
                        doc.body().append(detailsHtml);
                    }
                    if (!prereqlocs.isEmpty())
                    {
                        String html = "<p>You can find the previous work you need to do at these links:</p><ul>";
                        for (String prereqloc : prereqlocs)
                        {
                            String prereqdesc = prereqdescs.remove(0);
                            html += "<li><a class=\"nlinternal\" href=\""+prereqloc+"\">"+prereqdesc+"</a></li>";
                        }
                        html += "</ul>";
                        doc.body().append(html);                        
                    }
                    doc.body().append("<p>Contact your tutor for further information, or if you have received this message in error.</p></div>");
                }                
            }
            
            // have we only just logged in?
            // if so, log time and module
            if ("true".equals(freshlogin))
            {
                request.getSession().setAttribute("freshlogin",null);
                String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
                SimpleDateFormat sdf =
                    new SimpleDateFormat(DATE_FORMAT);
                String date = sdf.format(new Date());
                String module = doc.select("div.parameter#courseNo").text().trim();
                LogActivity.logActivity(username, date, "login",module,"","", request);
            }
            
            // make all the IMG elements have explicit/absolute URLs
            Elements imgs = doc.select("img");
            for (Element i : imgs)
            {
                String url = i.absUrl("src");                
                if (httpsOnImages)                
                {
                    url = url.replace("http:","https:");                    
                }
                // if this is a gif, assume it's animated (who uses static GIFs?!)
                // if so, add a random blah to the end to make sure it doesn't cache
                // also need to end it with .gif for the Javascript end
                if (url.endsWith(".gif"))
                {
                    url += "?fner="+UUID.randomUUID().toString()+"&fakeExt=.gif";
                }
                i.attr("src",url);
            }
            
            // handle the submission boxes
            Elements submissions = doc.select("div.submit");
            for (Element submit : submissions)
            {                
                String submittedAlready = "no";
                String id = submit.attr("data-box");
                File dir = new File(MiscUtils.getDataDir(request)+"/"+username+"/");                         
                        //new File(request.getSession().getServletContext().getInitParameter("datadir")+"/"+username);
                FileFilter fileFilter = new WildcardFileFilter(id+"*");
                File[] files = dir.listFiles(fileFilter);
                if (files == null) files = new File[0];
                
                if (submit.hasClass("single"))
                {
                    if (files.length != 0) submittedAlready = "yes";
                }
                else if (files.length != 0)
                {
                    submittedAlready = "yes but OK";
                }
                
                if (submittedAlready.equals("yes"))
                {
                    submit.appendText("You have already submitted this piece of work.");
                    submit.attr("style","border : 1px solid black; background : white;" +
                    "color : gray; padding : 5px; font-weight : bold; text-align : center");    
                }
                else if (submittedAlready.equals("yes but OK"))
                {
                    boolean oneOnly = false;
                    if(submit.hasClass("single")) oneOnly = true;
                    submit.appendText(">>> You have already submitted this, but can submit it multiple times. Click here to submit again. <<<");
                    submit.attr("style","border : 1px solid black; background : white; cursor : hand; " +
                    "cursor : pointer; padding : 5px; font-weight : bold; text-align : center");
                    submit.attr("onclick","submitWork(this,"+oneOnly+")");
                }
                else
                {
                    boolean oneOnly = false;
                    if(submit.hasClass("single")) oneOnly = true;
                    submit.appendText(">>> Click here to submit your work <<<");
                    submit.attr("style","border : 1px solid black; background : white; cursor : hand; " +
                    "cursor : pointer; padding : 5px; font-weight : bold; text-align : center");
                    submit.attr("onclick","submitWork(this,"+oneOnly+")");
                }
            }            
            
            // scan all a hrefs. Anything starting with a # is an internal
            // link, so do the requisite jiggery pokery on the URL to preprend
            // NoobLab environment URL. Leave plain old "#" alone though,
            // as chances are it's a route through to some clickable JS.
            Elements ahrefs = doc.select("a").not("a.nlinternal");
            for (Element ah : ahrefs)
            {
                String href = ah.attr("href");
                if (href.startsWith("#") && href != "#")
                {
                    // strip #
                    ah.attr("href",href.substring(1));
                    // internal link - so preprend NoobLab server blurb
                    String absUrl = ah.absUrl("href");
                    ah.attr("target","_blank");
                    // strip the http://
                    absUrl = absUrl.replace("http://","");
                    absUrl = request.getContextPath()+"/contents/"+absUrl;
                    ah.attr("href",absUrl);
                }
                
                // anything that doesn't start with a # is an external link,
                // that we want to show in a colourbox iframe rather than
                // letting the user fall out of the environment page
                else if (href != "#")
                {
                    // it's a real (i.e. offsite) link
                    // give it a class of .iframe
                    ah.addClass("iframe");
                }
                // but if href = "#" leave it alone
            }
            
            // grab all sections. All of them should be set to display: none
            // except the first
            Elements sections = doc.select("div.section");
            for (Element section : sections)
            {
                section.attr("style","display: none");
            }
            sections.get(0).attr("style","display: block");
            sections.get(0).addClass("selected");

            // Obscufate hiddenRun code
            Elements hiddenRuns = doc.select("div.hiddenrun, span.hiddenrun");
            {
                for (Element hiddenRun : hiddenRuns)
                {
                    String s = hiddenRun.text();
                    String result = "";
                    for (int i = 0; i < s.length(); i++) {
                        char c = s.charAt(i);
                        if       (c >= 'a' && c <= 'm') c += 13;
                        else if  (c >= 'n' && c <= 'z') c -= 13;
                        else if  (c >= 'A' && c <= 'M') c += 13;
                        else if  (c >= 'A' && c <= 'Z') c -= 13;
                        result += c;
                    }
                    hiddenRun.text(result);
                }
            }

            // build the "floating" navigation bar at the bottom of the screen.
            // derived from class .title in .section
            // edit 15/09/2017 - we actually grab this out with Javascript and relocate it out of the content client-side
            String html = "<div id=\"navbar\">";
            html += "<div class=\"navitem\" style=\"color: #666666\">Lesson Navigation:</div><div class=\"navitems\"><div class=\"navline\"></div>";
            Elements titles = doc.select("div.section h2.title");
            int i = 0;
            for (Element title : titles)
            {
                //System.out.println(title.text());
                // html += "<div class=\"navitem\">"+title.text()+"</div>";
                html += "<div id=\"navitem"+i+"\" class=\"navitem\"><a href=\"#\" "
                        + "onclick=\"contentNav("+i+"); return false;\" title=\""
                        + title.text()+"\">"+/*(i+1) +*/"</a></div>";
                i++;
            }
            html += "</div></div>";
            //System.out.println(html);
            
            // add nav bar at bottom of page
            doc.body().append(html);
            
            // change icons of each nav
            Elements navitems = doc.select("#navbar .navitem[id]");            
            for (int x = 0; x < navitems.size(); x++)
            {
                Element navitem = navitems.get(x);
                Element section = sections.get(x);
                if (section.select("div.testCase").size() != 0)
                {
                    navitem.select("a").append("<i class=\"fa fa-circle\"></i>");
                }
                else
                {
                    navitem.select("a").append("&nbsp;<i class=\"fa fa-info\"></i>&nbsp;");
                }
            }
            
            // first is selected by default
            try
            {
                doc.select("#navbar .navitem").get(1).addClass("selected");
            } catch (Exception e) {}
            
            request.setAttribute("contentshtml",doc.select("body > *").toString());
        }
        else
        {
            request.getSession().setAttribute("username",null);
            request.getSession().setAttribute("error","No contents specified");
            RequestDispatcher rd = request.getRequestDispatcher("/login.jsp");
            rd.forward(request, response);
            return;
        }
        
        /* get themes from codemirror */
        Set cmthemesSet = request.getServletContext().getResourcePaths("/codemirror/theme/");
        String[] cmthemes = (String[]) cmthemesSet.toArray(new String[0]);
        for (int i = 0; i < cmthemes.length; i++)
        {
            cmthemes[i] = cmthemes[i].replace("/codemirror/theme/","").replace(".css","");
        }
        request.setAttribute("cmthemes",cmthemes);
        
        RequestDispatcher rd = request.getRequestDispatcher("/mainpage.jsp");
        rd.forward(request, response);

    }

    private String shiteWget(String urlstr)
    {
        String data = "";
        if (urlstr != null)
        {
            InputStream is = null;
            BufferedReader dis;
            String s;
            try
            {
                URL u = new URL("http://"+urlstr);
                is = u.openStream();         // throws an IOException
                dis = new BufferedReader(new InputStreamReader(is));
                while ((s = dis.readLine()) != null) {
                    data = data + s+"\\n";
                }
            }
            catch (IOException ioe) { }
        }
        return data;
    }

        // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
        /**
         * Handles the HTTP <code>GET</code> method.
         * @param request servlet request
         * @param response servlet response
         * @throws ServletException if a servlet-specific error occurs
         * @throws IOException if an I/O error occurs
         */
        @Override
        protected void doGet


        (HttpServletRequest request, HttpServletResponse response)
        throws ServletException,
        IOException
        {
            processRequest(request, response);
        }
        /**
         * Handles the HTTP <code>POST</code> method.
         * @param request servlet request
         * @param response servlet response
         * @throws ServletException if a servlet-specific error occurs
         * @throws IOException if an I/O error occurs
         */
        @Override
        protected void doPost


        (HttpServletRequest request, HttpServletResponse response)
        throws ServletException,
        IOException
        {
            processRequest(request, response);
        }
        /**
         * Returns a short description of the servlet.
         * @return a String containing servlet description
         */
        @Override
        public String getServletInfo

             () {
        return "Short description";
        }// </editor-fold>

}
