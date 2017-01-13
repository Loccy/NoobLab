/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author paulneve
 */
public class RunFullWeb extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(final HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
              
        String datadir = request.getSession().getServletContext().getInitParameter("datadir");
        String urlToData = request.getSession().getServletContext().getInitParameter("fullweburl");
        
        String username = request.getSession().getAttribute("username").toString();
        
        String fullcode = request.getParameter("codeinput");   
        //String givenDefaultPage = request.getParameter("defaultPage");
        String givenDefaultPage = request.getParameter("filename");
        String actualDefaultPage = givenDefaultPage;
        // extract out the various bits
        String[] files = fullcode.split("\\*\\*\\*TAB\\*\\*\\*");        
        
        // clean up previous efforts
        String basedir = datadir;
        datadir = datadir + "/fullweb/"+username;
        File dd = new File(datadir);
        FileUtils.deleteQuietly(dd);
        FileUtils.forceMkdir(dd);
        // write files
        for (int i = 1; i < files.length; i++)
        {
            String blob = files[i];
            String[] blobs = blob.split("\\*\\*\\*CODE\\*\\*\\*");
            String filename = blobs[0].trim();
            String code = blobs[1].trim();
            File newFile = new File(datadir+"/"+filename);
            
             // inject error handling Javascript into HTML/PHP
            // pages            
            if (filename.toLowerCase().endsWith(".html") || filename.toLowerCase().endsWith(".htm") || filename.toLowerCase().endsWith(".php"))
            {
                String errorHandling = "<script type=\"text/javascript\">var errordialog=function(msg, url, linenumber,lang){"+
                                            "if (lang == undefined) lang = 'Javascript';"+
                                           "var dialog=document.createElement(\"div\");"+
                                            "dialog.className='errordialog';"+
                                            "dialog.style.position='fixed';"+
                                            "dialog.style.border='2px solid black';"+
                                            "dialog.style.margin='3px';"+
                                            "dialog.style.padding='3px';"+
                                            "dialog.style.fontFamily='monospace';"+
                                            "dialog.style.backgroundColor='white';"+
                                            "dialog.style.top='0px';"+
                                            "dialog.style.left='0px';"+
                                            "url = url.split('/').pop();"+
                                            "dialog.innerHTML='<b style=\"color:red\">'+lang+' Error: </b>' + msg +' at line number ' + linenumber +' of '+url;"+
                                            "var siLoop = setInterval(function(){"+
                                                "if (document.readyState == 'interactive' || document.readyState == 'complete') {"+
                                                    "clearInterval(siLoop);"+
                                                    "parent.$(document.body).append(dialog);"+
                                                    "parent.$(dialog).fadeTo(1,75);"+
                                                    "parent.$('div.tab').each(function(){"+
                                                        "if (parent.$(this).contents().eq(0).text() == url) {"+
                                                            "if (!parent.$(this).hasClass('selected')) {parent.$(this).click();}"+
                                                            "parent.editor.focus();"+
                                                            "parent.editor.setLineClass(linenumber-1,'error');"+
                                                            "parent.editor.setCursor(linenumber-1);"+
                                                        "};"+
                                                    "});"+
                                                "};"+
                                            "},1000);"+                                            
                                            "return true;"+
                                        "};"+
                                        
                                        "window.onerror=function(msg, url, linenumber){"+
                                            "return errordialog(msg, url, linenumber);"+
                                        "};;;</script>";
                
                if (code.contains("<head>"))
                {
                    code = code.replace("<head>","<head>"+errorHandling);
                }
                else if (code.contains("<body>"))
                {
                    code = code.replace("<body>","<body>"+errorHandling);
                }
                else { code = errorHandling+code; }                                
            }
            
            if (filename.toLowerCase().endsWith(".php"))
            {                
                // inject "push variables through to Javascript" code
                String varpush = "<?php $ignore = array('GLOBALS', '_FILES', '_COOKIE', '_POST', '_GET', '_SERVER', '_ENV', 'ignore');" +
                "$php_vars = array_diff_key(get_defined_vars() + array_flip($ignore), array_flip($ignore));" +
                "echo '<script type=\"text/javascript\">var php_vars = '.json_encode($php_vars).';</script>'; ?>";
                
                if (code.contains("</body>"))
                {
                    code = code.replace("</body>",varpush+"</body>");
                }
                else code = code+varpush;
                
            }
            
            FileUtils.writeStringToFile(newFile, code);
            
        }
        
        // pull in PHP error handler
        InputStream phperror = request.getServletContext().getResourceAsStream("/php_error_handler.php");
        String phperrorcode = IOUtils.toString(phperror);

        // if PHP error handler does not exist in noobdata dir, create it
        File datadirAsFile = new File(basedir+"/php_error_handler.php");
        if (!datadirAsFile.exists())
        {
            FileUtils.writeStringToFile(datadirAsFile, phperrorcode);
        }
        
        // create .htaccess and .user.ini in user's home dir
        String htaccess = "<IfModule mod_php5.c>\nphp_value auto_prepend_file "+basedir+"/php_error_handler.php\n</IfModule>";
        FileUtils.writeStringToFile(new File(datadir+"/.htaccess"),htaccess);
        String userini = "auto_prepend_file="+basedir+"/php_error_handler.php";
        FileUtils.writeStringToFile(new File(datadir+"/.user.ini"),userini);
        
        request.setAttribute("defaultPage", urlToData+"/fullweb/"+username+"/"+actualDefaultPage);                                                        
        RequestDispatcher rd = request.getRequestDispatcher("runfullweb.jsp");
        rd.forward(request, response);
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
