/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import au.com.bytecode.opencsv.CSVWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author paulneve
 */
public class LogEmotion extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {

        // get parameters
        String username = (String)request.getSession().getAttribute("username");
        if (username == null || username.equals("guest")) return;

        //String date = request.getParameter("datetime");
        String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
        SimpleDateFormat sdf =
            new SimpleDateFormat(DATE_FORMAT);
        String date = sdf.format(new Date());
        
        String eventType = request.getParameter("eventtype");
        String position = request.getParameter("position");
        String emotion = request.getParameter("emotion");
        LogEmotion.logEmotion(username, date, eventType, position, emotion, request);

        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();
        out.print("done");
        out.close();
    }

    public static void logEmotion(String username, String datetime, String eventType,
            String position, String emotion, HttpServletRequest request) throws IOException
    {                          
        
        String module = (position == null || position.equals("")) ? "nomodule" : position.split(":")[0];
        // put the current module into the session 
        request.getSession().setAttribute("module", module);                
        
        String datadir = MiscUtils.getDataDir(request); //request.getSession().getServletContext().getInitParameter("datadir")+"/module";

        // get current directory for writing file
        File path = new File(datadir+"/"+username.toLowerCase()+"/emotions");
        File path2 = new File(datadir+"/all/emotions");
        
        String ip = request.getRemoteAddr();
        String xforward = request.getHeader("X-Forwarded-For");
        
        if (xforward != null) ip = xforward.split(",")[0];        
        
        if (!path.exists()) FileUtils.forceMkdir(path); //path.mkdir();
        if (!path2.exists()) FileUtils.forceMkdir(path2);//path2.mkdir();
        
        // student's "main" file - in their directory
        String csvfile = datadir+"/"+username.toLowerCase()+"/emotions/emotion.csv";
        // student's "main" file - in "all" directory
        String rootfile = datadir+"/all/emotions/"+username.toLowerCase()+".csv";
        
        // write two mains
        CSVWriter writer = new CSVWriter(new FileWriter(csvfile,true));
        CSVWriter writer2 = new CSVWriter(new FileWriter(rootfile,true));
        String[] csvLine = { datetime,ip,eventType,position,emotion };
        writer.writeNext(csvLine);
        writer2.writeNext(csvLine);
	writer.close();
        writer2.close();
        
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
