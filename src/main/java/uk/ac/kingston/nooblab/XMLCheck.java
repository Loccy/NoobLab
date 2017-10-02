/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXParseException;


/**
 *
 * @author paul
 */
public class XMLCheck extends HttpServlet {

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
        PrintWriter out = response.getWriter();
        try {
            String xmlcode = request.getParameter("xml");
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setValidating(false);
            factory.setNamespaceAware(true);                       
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            DocumentBuilder db = factory.newDocumentBuilder();
            db.setErrorHandler(null);
            Document doc = db.parse(new InputSource(new StringReader(xmlcode)));
            /* TODO output your page here. You may use following sample code. */
            response.setContentType("text/plain");
            out.print("ok");
        }
        catch (SAXParseException e)
        {
            response.setContentType("application/json");
            out.println("{");
            out.println("\"lineno\" : "+e.getLineNumber()+",");
            out.println("\"colno\" : "+e.getColumnNumber()+",");
            String msg = e.getMessage();
            if (msg.trim().equals("Content is not allowed in prolog.")) msg = "There is illegal text before the initial <html> element.";
            if (msg.trim().equals("Content is not allowed in trailing section.")) msg = "There is illegal text after the final <html> element.";
            msg = msg.replaceAll("\"", "\\\\\"");
            msg = "\""+msg+"\"";
            out.println("\"colno\" : "+e.getColumnNumber()+",");
            out.println("\"msg\" : "+msg);
            out.println("}");            
        }
        catch (Exception e)
        {
            out.println(ExceptionUtils.getMessage(e));
        }
        finally {
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
