/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Iterator;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.commons.lang.SystemUtils;
import uk.ac.kingston.nooblab.java.JavaRunningUtils;

/**
 *
 * @author paulneve
 */
public class JavaRunner extends HttpServlet
{

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        response.setContentType("text/plain");
        String mode = request.getParameter("mode");
        HttpSession session = request.getSession();
        PrintWriter pw = response.getWriter();
        
        if (mode == null) mode = "compilerun";
        
        // compilerun - runs on server using IO redirection
        // Probably obsolete since introduction of Doppio.
        // Used on resources of language type "javaserver"
        if ("compilerun".equals(mode))
        {                        
            String username = session.getAttribute("username").toString();
            String main = request.getParameter("main");
            String mainPkg = request.getParameter("mainPkg");
            String basedir = MiscUtils.getDataDir(request)+"/"+username+"/"; 
                             //session.getServletContext().getInitParameter("datadir")+"/"+username+"/";            
        
            String[] code = request.getParameterValues("code[]");        
            
            // create the io channel objects
            ArrayList<String> out = new ArrayList<String>();
            ArrayList<String> in = new ArrayList<String>();            
            ArrayList<String> command = new ArrayList<String>();
            
            // put them into the session
            session.setAttribute("javaout",out);
            session.setAttribute("javain",in);
            session.setAttribute("javacommand",command);
            
            // compile our code
            String[] compileresults = JavaRunningUtils.compileCode(code,username,basedir+"/java",
                    main,mainPkg,getServletContext());
                        
            if ("**ERROR**".equals(compileresults[0]))
            {
                if (SystemUtils.isJavaVersionAtLeast(170))
                {
                    compileresults[0] = "**ERROR**NEWJAVA**";                           
                }
                pw.print(compileresults[0]+":"+compileresults[1]);
                pw.close();
                return;
            }
            
            // compile success :-)
            // run our code
            Thread thread = JavaRunningUtils.runMain(username,compileresults[0],compileresults[1],basedir+"/java",out,in,getServletContext());
            JavaRunningUtils.monitor(thread,out,in,command);            
            
            response.setContentType("text/plain");
                          
            pw.print(compileresults[0]+":"+compileresults[1]);
            pw.close();            
        }                    
        
        if ("compile".equals(mode))
        {
            String username = session.getAttribute("username").toString();
            String main = request.getParameter("main");
            String mainPkg = request.getParameter("mainPkg");
            String basedir = MiscUtils.getDataDir(request)+"/"+username+"/"; 
                    //session.getServletContext().getInitParameter("datadir")+"/"+username+"/";            
        
            String[] code = request.getParameterValues("code[]");
            
            boolean newdoppio = (request.getParameter("newdoppio") != null && !request.getParameter("newdoppio").equals("false"));
            
            // compile our code
            String[] compileresults = JavaRunningUtils.compileCode(code,username,basedir+"/java",
                    main,mainPkg,false,newdoppio,getServletContext());
                        
            if ("**ERROR**".equals(compileresults[0]))
            {
                if (SystemUtils.isJavaVersionAtLeast(170))
                {
                    compileresults[0] = "**ERROR**NEWJAVA**";                           
                }
                pw.print(compileresults[0]+":"+compileresults[1]);
                pw.close();
                return;
            }
            else
            {
                for (String filename : compileresults)
                {
                    pw.print(filename+":");                    
                }
                pw.close();
                return;
            }
        }
        
        if ("consolemonitor".equals(mode))
        {
            // anything in out?            
            ArrayList<String> out = (ArrayList<String>)session.getAttribute("javaout");
            if (!out.isEmpty())
            {
                response.setContentType("text/html");                          
                int count = 0;                                
                while (!out.isEmpty() && count < 5000)
                {
                    String extra = "";
                    //synchronized(out)
                    {
                        extra = out.get(0);
                        out.remove(0);                    
                    }
                    pw.print(extra);
                    count++;
                }                
                pw.close();            
            }
            else
            {
                response.setContentType("text/plain");
                pw.print("noop");
                pw.close();
            }
        }
        
        if ("commandmonitor".equals(mode))
        {
            // anything in command?
            ArrayList<String> command = (ArrayList<String>)session.getAttribute("javacommand");
            if (!command.isEmpty())
            {
                response.setContentType("text/plain");
                pw.print(command.get(command.size()-1));
                pw.close();
            }
            else
            {
                response.setContentType("text/plain");
                pw.print("noop");
                pw.close();
            }
        }
        
        if ("sendstop".equals(mode))
        {
            // get command
            ArrayList<String> command = (ArrayList<String>)session.getAttribute("javacommand");
            command.add("stop");
            // wipe output
            ArrayList<String> out = (ArrayList<String>)session.getAttribute("javaout");
            out.clear();
            out.add("<p style=\"color: red\">Stop button pressed by user</p>");
            // shouldn't need a response...
            pw.close();
        }
        
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo()
    {
        return "Short description";
    }// </editor-fold>
}
