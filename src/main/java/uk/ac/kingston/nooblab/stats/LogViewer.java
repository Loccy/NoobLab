/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.stats;

import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FilenameUtils;
import uk.ac.kingston.nooblab.MiscUtils;

/**
 *
 * @author paulneve
 */
public class LogViewer extends HttpServlet
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
        String datadir = MiscUtils.getDataDir(request, false);
        String currentdir = request.getParameter("currentdir");        
        ArrayList<DirectoryEntry> dirlist = new ArrayList();                         
        
        if (currentdir != null && !"".equals(currentdir))
        {
            if(currentdir.contains("../..") || currentdir.equals("..") || currentdir.startsWith("../")) return;
            String actualdir =  new File(datadir+"/"+currentdir).getCanonicalPath();
            if (!datadir.equals(actualdir))
            {
                dirlist.add(new DirectoryEntry(currentdir+"/..","..","dir"));
            }
            currentdir = actualdir;            
        }
        else
        {
            currentdir = datadir;
        }
        
        String mode = request.getParameter("mode");
        if ("viewlog".equals(mode))
        {
            processViewlogRequest(request,response,currentdir);
            return;
        }
        
        File[] dirlistf = new File(currentdir).listFiles();
        for (File file : dirlistf)
        {
            String fullpath = file.getCanonicalPath().replace(datadir+"/", "");
            String shortname = file.getName();
            if (file.isDirectory())
            {
                
                dirlist.add(new DirectoryEntry(fullpath,shortname,"dir"));
            }
            else if (FilenameUtils.getExtension(fullpath).equals("csv"))
            {
                dirlist.add(new DirectoryEntry(fullpath,shortname,"log"));
            }            
        }
        request.setAttribute("dirlisting", dirlist);
        RequestDispatcher rd = request.getRequestDispatcher("/logviewer.jsp");
        rd.forward(request, response);        
    }
    
    private void processViewlogRequest(HttpServletRequest request, HttpServletResponse response, String currentdir)
            throws ServletException, IOException
    {
        // read in the file
        CSVReader reader = new CSVReader(new FileReader(currentdir));
        ArrayList<String[]> lines = new ArrayList(reader.readAll());

        request.setAttribute("logdata",lines);
        RequestDispatcher rd = request.getRequestDispatcher("/logdisplay.jsp");
        rd.forward(request, response);        
    }
    
    public class DirectoryEntry
    {
        String dir;
        String type;
        String shortname;

        public DirectoryEntry(String dir, String shortname, String type)
        {
            this.dir = dir;
            this.shortname = shortname;
            this.type = type;
        }

        public String getDir()
        {
            return dir;
        }

        public String getType()
        {
            return type;
        }
        
        public String getShortname()
        {
            return shortname;
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
