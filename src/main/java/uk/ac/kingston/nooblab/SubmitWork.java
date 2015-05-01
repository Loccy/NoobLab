/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author paulneve
 */
public class SubmitWork extends HttpServlet {

    protected void processRequest(final HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
    {
        // get parameters
        String username = (String)request.getSession().getAttribute("username");
        if (username == null) return;        
        String code = request.getParameter("code");
        String dir = request.getParameter("dir");
        String tabname = request.getParameter("tabname");        
        
        response.setContentType("text/plain");
        
        String outputDir = MiscUtils.getDataDir(request)+"/"+username+"/"+dir; 
                //request.getSession().getServletContext().getInitParameter("datadir")+"/"+username+"/"+dir;
        try { FileUtils.forceMkdir(new File(outputDir));} catch (IOException e) {} // exception if dir already exists - quite possible, so trap quietly
        File outputFile = new File(outputDir+"/"+tabname+".noob");
        
        FileUtils.writeStringToFile(outputFile,code,"UTF-8");

        PrintWriter pw = response.getWriter();
        pw.print("win");
        pw.close();
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
    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /** 
     * Handles the HTTP <code>GET</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */

}
