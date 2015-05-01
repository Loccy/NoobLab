/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;

/**
 *
 * @author paulneve
 */
public class BounceFile extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        boolean isMultipart = ServletFileUpload.isMultipartContent(request);        

        if (isMultipart) {
            FileItemFactory factory = new DiskFileItemFactory();
            ServletFileUpload upload = new ServletFileUpload(factory);
            PrintWriter out = response.getWriter();
            String asString = "";
            response.setContentType("text/plain");
            
            try {
                List items = upload.parseRequest(request);
                FileItem item = (FileItem)items.get(0);                                
                
                // it's a zip file... convert anything in it
                if (item.getName().toLowerCase().endsWith(".zip"))
                {
                    ZipInputStream zis = new ZipInputStream(item.getInputStream());
                    ZipEntry entry;
                    // while there are entries I process them
                    String tabPackage = "";
                    while ((entry = zis.getNextEntry()) != null)
                    {
                        if (!entry.isDirectory())
                        {
                            String entryFilename = FilenameUtils.getName(entry.getName());
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            int data;
                            while ((data = zis.read()) != -1) baos.write(data);
                            baos.close();
                            byte[] entryAsByteArr = baos.toByteArray();
                            String entryAsString = new String(entryAsByteArr, "UTF-8");
                            tabPackage += "***TAB***#RET#"
                                        + entryFilename+"#RET#"
                                        + "***CODE***#RET#"
                                        + entryAsString+"#RET#";
                        }
                    }
                    zis.close();
                    asString = tabPackage;
                }
                else
                {                    
                    asString = item.getString("UTF-8");
                    // swap out return chars for placeholders
                    asString = asString.replaceAll("\\r\\n|\\r|\\n", "#RET#");                                        
                }
                //IOUtils.copy(item.getInputStream(), out, "UTF-8");
            } catch (Exception e) {
                e.printStackTrace();
            }
            out.println(asString);
            out.close();
        }
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
