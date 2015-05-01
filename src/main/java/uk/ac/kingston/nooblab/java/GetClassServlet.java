/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.java;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;
import uk.ac.kingston.nooblab.MiscUtils;

/**
 *
 * @author paulneve
 */
public class GetClassServlet extends HttpServlet
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
        HttpSession session = request.getSession();        
        String username = session.getAttribute("username").toString();
        String basedir = MiscUtils.getDataDir(request)+"/"+username+"/java/compiled/"; 
                //session.getServletContext().getInitParameter("datadir")+"/"+username+"/java/compiled/";            
        String classFileLoc = request.getParameter("classfile");
        classFileLoc = classFileLoc.replace(".", "/")+".class";
        classFileLoc = basedir+classFileLoc;        
        
        File classFile = new File(classFileLoc);
        byte[] classFileBytes = FileUtils.readFileToByteArray(classFile);
   
        String classFileBase64 = Base64.encodeBase64String(classFileBytes);        
        response.setContentType("text/plain");
        PrintWriter pw = response.getWriter();
        pw.print(classFileBase64);        
        pw.flush();
        pw.close();
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
