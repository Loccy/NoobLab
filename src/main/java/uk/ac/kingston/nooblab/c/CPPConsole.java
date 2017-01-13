/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.c;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Paul
 */
public class CPPConsole extends HttpServlet {

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
        response.setHeader("Access-Control-Allow-Origin","*");
        
        response.setContentType("text/plain");
        ArrayList<String> consoleLines = (ArrayList)request.getSession().getAttribute("cppconsole");
        PrintWriter out = response.getWriter();
        if (consoleLines == null)
        {
            consoleLines = new ArrayList<String>();
        }
        
        String mode = request.getParameter("mode");
        if ("get".equals(mode))
        {
            if (consoleLines.size() == 0)
            {
                out.println("**(empty)**");
            }
            else
            {
                String topline = consoleLines.get(0);
                consoleLines.remove(0);
                request.getSession().setAttribute("cppconsole", consoleLines);
                out.println(topline);
            }
        }
        else // add
        {
            String newline = request.getParameter("line");
            if (newline == null) newline = "";
            newline = newline.trim();
            consoleLines.add(newline);
            request.getSession().setAttribute("cppconsole", consoleLines);
            out.println("qapla");
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
