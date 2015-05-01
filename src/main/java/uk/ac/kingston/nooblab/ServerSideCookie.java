/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.File;
import java.io.FileNotFoundException;
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
public class ServerSideCookie extends HttpServlet {
   
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
        if (username == null) return;
        
        String key = request.getParameter("key");
        String value = request.getParameter("value");
        if (value == null || value.equals("")) value = "";
        String mode = request.getParameter("mode");

        // get current directory for file
        String cookiefile = request.getSession().getServletContext().getInitParameter("datadir")+"/cookie/"+key+"-"+username.toLowerCase()+".cookie";
        if (mode == null) mode = "write";

        if (mode.equals("write"))
        {
            FileUtils.writeStringToFile(new File(cookiefile), value);
        }
        else
        {
            try
            {
                value = FileUtils.readFileToString(new File(cookiefile));
            }
            catch (FileNotFoundException e)
            {
                value = "";
            }
        }

        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();
        out.print(value);
        out.close();

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
