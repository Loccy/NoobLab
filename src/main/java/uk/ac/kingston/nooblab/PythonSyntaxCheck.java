/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.ExecuteException;
import org.apache.commons.exec.ExecuteWatchdog;
import org.apache.commons.exec.PumpStreamHandler;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;

/**
 *
 * @author paul
 */
public class PythonSyntaxCheck extends HttpServlet
{

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
            throws ServletException, IOException
    {
        response.setContentType("text/plain");
        String code = request.getParameter("code");
        PrintWriter out = response.getWriter();
        try
        {
            out.print(checkPythonCode(code));
        } finally
        {
            out.close();
        }
    }
    
    public static String checkPythonCode(String code) throws IOException
    {
        // stash source files somewhere in the temp directory
        String temp = System.getProperty("java.io.tmpdir");
        // create temp directory in system temp
        String tempdirStr = temp+"/"+RandomStringUtils.randomAlphabetic(10);
        //System.out.println(tempdirStr);
        File tempdir = new File(tempdirStr);
        tempdir.mkdir();
        
        File output = new File(tempdirStr+"/checkcode.py");
        FileUtils.writeStringToFile(output, code);
        
        String emcl = (System.getProperty("os.name")+"").startsWith("Windows") ? "pylint.exe" : "pylint";
        CommandLine cmdLine = new CommandLine(emcl);
        // disable everything other than errors
        cmdLine.addArgument("-E");
        cmdLine.addArgument(tempdirStr+"/checkcode.py");
        
        DefaultExecutor executor = new DefaultExecutor();
        ExecuteWatchdog watchdog = new ExecuteWatchdog(60000);
        executor.setWatchdog(watchdog);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PumpStreamHandler streamHandler = new PumpStreamHandler(outputStream);
        executor.setStreamHandler(streamHandler);
        int exitValue = 0;
        try { exitValue = executor.execute(cmdLine); } catch (ExecuteException e) { exitValue = 1; };
        // we should now have javsscript in tempdirStr/out.js
        // suck this into a string, then clean up, and return string
        String errors = outputStream.toString();
        
        return errors;
        
        
        //return "no-pylint";
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
            throws ServletException, IOException
    {
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
