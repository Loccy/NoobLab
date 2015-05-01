/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.TreeMap;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import uk.ac.kingston.nooblab.stats.StudentStatuses;

/**
 *
 * @author paulneve
 */
public class ScoreTable extends HttpServlet
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
        response.setContentType("text/html;charset=UTF-8");
        
        String mode = request.getParameter("type");
        
        String username = request.getParameter("username");
        if (username == null) username = request.getSession().getAttribute("username").toString();
        if (username == null && mode == null) return;
        
        if ("bigtable".equals(mode))
        {
            TreeMap<Double,Object[]> bigtable = StudentStatuses.highScoreTable(MiscUtils.getDataDir(request));
            request.setAttribute("bigtable",bigtable);
            RequestDispatcher rd = request.getRequestDispatcher("/bigtable.jsp");
            rd.forward(request,response);
        }
        else
        {        
            String medalfile = MiscUtils.getDataDir(request)+"/"+username+"/medal.csv"; 
                    //request.getSession().getServletContext().getInitParameter("datadir")+"/"+username+"/medal.csv";

            TreeMap<String,String> medalDetails = StudentStatuses.medals(medalfile);

            request.setAttribute("medalDetails", medalDetails);

            RequestDispatcher rd = request.getRequestDispatcher("/scoretable.jsp");
            rd.forward(request, response);
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
