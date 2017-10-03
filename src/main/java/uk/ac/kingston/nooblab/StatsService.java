/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import uk.ac.kingston.nooblab.stats.RealStats;
import uk.ac.kingston.nooblab.stats.StudentStatuses;

/**
 *
 * @author paulneve
 */
public class StatsService extends HttpServlet
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
        
        // get parameters
        String basedir = MiscUtils.getDataDir(request); 
                //request.getSession().getServletContext().getInitParameter("datadir");
        String username = request.getParameter("student");
        if (username == null) username = request.getSession().getAttribute("username").toString();
        String statsType = request.getParameter("type");                
        
        PrintWriter out = response.getWriter();
        try {            
            if ("studentlist".equals(statsType))
            {
                String[] studentlist = RealStats.getStudentList(basedir);  
                response.setContentType("text/plain;charset=UTF-8");
                out.print(MiscUtils.arrayToJs(studentlist));
            }
            if ("total".equals(statsType))
            {                
                response.setContentType("text/plain;charset=UTF-8");
                out.print(RealStats.getStudentTotalTime(basedir+"/"+username+"/nocode.csv"));
            }
            if ("testMedals".equals(statsType))
            {
                response.setContentType("application/json");
                Gson gson = new Gson();
                out.print(gson.toJson(StudentStatuses.testWithMedal(basedir+"/"+username)));
                /*
                String json = "{ \n";
                HashMap<String,String> testMedals = StudentStatuses.testWithMedal(basedir+"/"+username);
                for (Map.Entry<String, String> entry : testMedals.entrySet()) {
                    String key = entry.getKey();                    
                    Object value = entry.getValue();
                    json += "\""+key+"\"   :   "+"\""+value+"\",\n";
                }
                json += "}";
                json = json.replace(",\n}","\n}");
                out.print(json);*/
            }
            if ("loginTimes".equals(statsType))
            {                                
                response.setContentType("application/json");
                Gson gson = new Gson();
                String course = request.getParameter("course");
                String ipmatch = request.getServletContext().getInitParameter("homeip");
                out.println(gson.toJson(RealStats.getUsageDates(basedir, true,ipmatch)));
            }
            if ("testAssists".equals(statsType))
            {
                response.setContentType("application/json");
                Gson gson = new Gson();
                out.print(gson.toJson(StudentStatuses.getAssists(basedir+"/"+username)));
            }
            if ("testAttempts".equals(statsType))
            {
                response.setContentType("application/json");
                Gson gson = new Gson();
                out.print(gson.toJson(StudentStatuses.getTestAttempts(basedir+"/"+username)));
            }
            if ("last20".equals(statsType))
            {
                response.setContentType("application/json");
                Gson gson = new Gson();                
                out.print(gson.toJson(StudentStatuses.tailLogFile(basedir+"/"+username+"/nocode.csv")));
            }
        } finally {            
            out.close();
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
