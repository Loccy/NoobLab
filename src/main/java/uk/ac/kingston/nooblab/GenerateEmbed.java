/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import com.google.gson.Gson;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author paul
 */
public class GenerateEmbed extends HttpServlet
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
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        try
        {
            // create a pronouncable ID
            // nicked from https://codegolf.stackexchange.com/questions/11877/generate-a-pronounceable-word
            int i = 10;	    	      	     	        	       	
            String id = "";	    	      	     	        	       	
            while (--i > 0)	    	      	     	        	       	
            {	    	      	     	        	       	
              id += ((i % 2 == 0 ? "aeiouy" : "bcdfghjklmnpqrstvwxz").charAt(new java.util.Random().nextInt(6 + (i % 2) * 14)));	    	      	     	        	       	
            }
            String embeddirstr = getServletContext().getInitParameter("datadir")+"/embed";
            File embeddir = new File(embeddirstr);
            if (!embeddir.exists())
            {
                // create it
                embeddir.mkdir();
            }
            File ourembed = new File(embeddirstr+"/"+id);
            String params = request.getParameter("params");
            String code = request.getParameter("code");            
            String output = params+"\n"+"NOOBLABSEPSEPSEPNOOBLAB\n"+code;
            String carol = request.getParameter("carol");
            String fakeDoc = request.getParameter("fakeDoc");
            if (carol != null && !carol.trim().equals(""))
            {
                output += "\n"+"NOOBLABSEPSEPSEPNOOBLAB\n"+carol;
            }
            if (fakeDoc != null && !fakeDoc.trim().equals(""))
            {
                output += "\n"+"NOOBLABSEPSEPSEPNOOBLAB\n"+"fakeDoc:"+fakeDoc;
            }
            FileUtils.writeStringToFile(ourembed,output);
            out.print(id);           
        } finally
        {
            out.close();
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
