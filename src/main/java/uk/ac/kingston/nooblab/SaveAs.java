/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author paulneve
 */
public class SaveAs extends HttpServlet {

    protected void processRequest(final HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
    {
        String code = request.getParameter("codeinput");
        String filename = request.getParameter("filename");
        String tabs = request.getParameter("tabs");
        if ("true".equals(tabs))
        {
            processRequestForZip(code, filename, request,response);
            return;
        }
        response.setContentType("application/force-download");
        response.setContentLength(code.length());

        response.setHeader("Content-Transfer-Encoding", "binary");
        response.setHeader("Content-Disposition","attachment; filename=\""+filename+"\"");

        PrintWriter pw = response.getWriter();
        pw.print(code);
        pw.close();
    }
    
    protected void processRequestForZip(String code, String filename, final HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
    {
        // we've got our stuff as a getTabBundle string..
        // separate out the code...
        String[] tabs = code.split("\\*\\*\\*TAB\\*\\*\\*");
        // set up for output
        ServletOutputStream sos = response.getOutputStream();
        response.setContentType("application/force-download");
        response.setHeader("Content-Transfer-Encoding", "binary");
        response.setHeader("Content-Disposition", "attachment; filename=\""+filename+"\"");
        final ZipOutputStream out = new ZipOutputStream(sos);
        
        for (String tab : tabs)
        {
            if (tab.trim().length() == 0) continue;
            String[] tabArr = tab.split("\\*\\*\\*CODE\\*\\*\\*");
            String tabFilename = tabArr[0].trim();
            String tabCode = tabArr[1].trim();
            
            if (tabFilename.endsWith(".java"))
            {
                Pattern pattern = Pattern.compile("package (.*?);");
                Matcher matcher = pattern.matcher(tabCode);
                if (matcher.find())
                {                
                    String pkg = matcher.group(1);
                    pkg = pkg.replace(".","/");
                    tabFilename = pkg+"/"+tabFilename;
                }
            }
            
            ZipEntry e = new ZipEntry(tabFilename);
            out.putNextEntry(e);
            byte[] data = tabCode.getBytes();
            out.write(data, 0, data.length);
            out.closeEntry();
        }
        out.close();
        sos.flush();
        sos.close();
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
