/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import com.ovea.crypto.ASCII;
import com.ovea.crypto.Base64;
import com.ovea.crypto.XXTEA;
import java.io.IOException;
import java.nio.IntBuffer;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author paulneve
 */
public class Login extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        
        // set request parameter to de-crap IE on KU network
        response.addHeader("X-UA-Compatible", "IE=Edge");
        
       // get the parameters
        
        String sessId = request.getSession().getId().substring(0,16); 
        String username = request.getParameter("x1")+"";
        String password = request.getParameter("x2")+"";
        
        int[] key = new int[4];
        for (int i = 0; i < 4; i++)
        {
            key[i] = Integer.parseInt(sessId.charAt(i)+"",16);
        }
        
        IntBuffer keyIB = IntBuffer.wrap(key);
        IntBuffer java_buffer = Base64.decodeBase64(username).asIntBuffer();
        XXTEA.decryptInPlace(java_buffer, keyIB);
        username = ASCII.fromIntBuffer(java_buffer);
        
        IntBuffer java_buffer2 = Base64.decodeBase64(password).asIntBuffer();
        XXTEA.decryptInPlace(java_buffer2, keyIB);
        password = ASCII.fromIntBuffer(java_buffer2);
                
        String originalUrl = request.getParameter("originalUrl");
        String logout = request.getParameter("logout");

        String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
        SimpleDateFormat sdf =
            new SimpleDateFormat(DATE_FORMAT);
        String date = sdf.format(new Date());

        // see if we can login using the username and password
        if (Authentication.checkAuthentication(request.getSession().getServletContext(), username, password))
        {
            username = username.toLowerCase();
            // set our username into the session
            request.getSession().setAttribute("username", username);
            request.getSession().setAttribute("watermark",MiscUtils.klungeUID(username));
            // clear any error
            request.getSession().setAttribute("error",null);
            // note that we've just logged in
            request.getSession().setAttribute("freshlogin","true");         
        }
        else
        {
            request.getSession().setAttribute("error","error");
        }

        // but forget all that if we actually sent a logout
        if (logout != null) 
        {
            username = (String)request.getSession().getAttribute("username");
            //TODO: Put in clientland 
            //LogActivity.logActivity(username, date, "logout", "","","", request);
            originalUrl =  request.getContextPath().toString()+"/logout.jsp";
            request.getSession().invalidate();
        }

        // and redirect to original URL
        // if we don't have a username in the session, this should have the effect
        // of going back to the login page.
        response.sendRedirect(originalUrl);
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
