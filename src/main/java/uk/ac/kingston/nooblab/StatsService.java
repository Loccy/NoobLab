/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import com.google.gson.Gson;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
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
        // DIE, same origin. Just bloody DIE.
        response.addHeader("Access-Control-Allow-Origin","*");
        
        // get parameters
        String basedir = MiscUtils.getDataDir(request); 
                //request.getSession().getServletContext().getInitParameter("datadir");
        String username = request.getParameter("student");
        if (username == null) username = request.getSession().getAttribute("username").toString();
        String statsType = request.getParameter("type");
        
        String module = request.getParameter("module");
        if (module != null)
        {
            basedir = request.getServletContext().getInitParameter("datadir")+"/"+module;            
        }        
        
        PrintWriter out = response.getWriter();
        try {            
            if ("lastmedal".equals(statsType))
            {                
                String testid = request.getParameter("testid");
                String medalgrade = request.getParameter("grade");
                if (medalgrade != null && medalgrade.trim().equals("")) medalgrade = null;                                
                String code = StudentStatuses.findSuccessCode(testid, basedir+"/"+username+"/main.csv", medalgrade);
                
                response.setContentType("text/plain;charset=UTF-8");                
                out.print(code);                
            }
                    
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
            if ("testMedalsWithDate".equals(statsType))
            {
                response.setContentType("application/json");
                Gson gson = new Gson();
                out.print(gson.toJson(StudentStatuses.testWithMedal(basedir+"/"+username,true)));
            }
            if ("loginTimes".equals(statsType))
            {                                
                response.setContentType("application/json");
                Gson gson = new Gson();
                String course = request.getParameter("course");
                String ipmatch = request.getServletContext().getInitParameter("homeip");
                out.println(gson.toJson(RealStats.getUsageDates(basedir, true,ipmatch)));
            }
            if ("studentAttended".equals(statsType))
            {                
                response.setContentType("text/plain");
                String student = request.getParameter("student");
                String startdate = request.getParameter("startdate");
                String enddate = request.getParameter("enddate");
                String datadir = request.getSession().getServletContext().getInitParameter("datadir");
                String course = request.getParameter("course");
                String ipmatch = request.getServletContext().getInitParameter("homeip");
                boolean result = RealStats.didStudentAttend(student, datadir+"/"+course, startdate, enddate, ipmatch);
                out.println(result ? "X" : "");
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
