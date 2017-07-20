/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import uk.ac.kingston.nooblab.c.CPPRunningUtils;

/**
 *
 * @author Paul
 */
public class CPPRunner extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {        
         response.setContentType("text/plain");
         PrintWriter pw = response.getWriter();
        
         String mode = request.getParameter("mode");
         if ("submitCode".equals(mode))
         {
             String[] codes = request.getParameterValues("code[]");
             String[] filenames = request.getParameterValues("filenames[]");
             request.getSession().setAttribute("submittedcode", codes);
             request.getSession().setAttribute("submittedfilenames", filenames);
             pw.println("qapla");
         }
         else
         {
            File js = new File(System.getProperty("java.io.tmpdir")+"/cpp-post-js.js");
            if (!js.exists())
            {
                FileUtils.copyInputStreamToFile(request.getServletContext().getResourceAsStream("/cpp-post-js.js"), js);
            }
            js = new File(System.getProperty("java.io.tmpdir")+"/cpp-pre-js.js");
            if (!js.exists())
            {
                FileUtils.copyInputStreamToFile(request.getServletContext().getResourceAsStream("/cpp-pre-js.js"), js);
            }

            String datadir = request.getSession().getServletContext().getInitParameter("datadir");
            String urlToData = request.getSession().getServletContext().getInitParameter("fullweburl");
            String username = request.getSession().getAttribute("username").toString();
            datadir = datadir + "/fullweb/"+username;

             String[] codes = (String[])request.getSession().getAttribute("submittedcode");
             String[] filenames = (String[])request.getSession().getAttribute("submittedfilenames");
             request.getSession().removeAttribute("submittedcode");
             request.getSession().removeAttribute("submittedfilenames");
             // compile our code
             String[] result = CPPRunningUtils.compileCode(codes,filenames,datadir);
             if (result.length == 1) // errrrr-orrrrrr (points at red text on screen)
             {
                String errorText = result[0];
                String errorDetails = "Error parsing failed :-(";
                String filename = "unknown.cpp";
                int lineNo = -1;
                int rowNo = -1;
                try
                {
                    Pattern pattern = Pattern.compile(".+\\/(.+?):([0-9]+?):([0-9]+?):.*error: (.*)");
                    Matcher matcher = pattern.matcher(errorText);    
                    if (matcher.find())
                    {
                        filename = matcher.group(1);
                        lineNo = Integer.parseInt(matcher.group(2));
                        rowNo = Integer.parseInt(matcher.group(3));
                        errorDetails = matcher.group(4);
                    }
                    else
                    {
                        errorDetails = errorText;
                    }
                }
                catch (Exception e) { errorDetails = e.getMessage(); e.printStackTrace(); };
                
                errorText = "Error in "+filename+" at line "+lineNo+", column "+rowNo+": "+errorDetails;
                                
                errorText = errorText.replace("\r","");                
                //errorText = "Error at line "+errorText;
                errorText = errorText.replace("\"","&quot;");
                errorText = errorText.replace("\n","<br/>");
                errorText = errorText.replace(" ","&nbsp;");
                errorText = "throw new Error(\""+errorText+"\");";
                pw.println(errorText);
             }
             else
             {
                 // send back JS code
                 pw.println(result[1]);
                // send back URL of JS..
                 //pw.println(urlToData+"/"+username+"/cppout.js");
             }
         }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
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
     *
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
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
