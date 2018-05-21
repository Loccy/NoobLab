/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import au.com.bytecode.opencsv.CSVWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author paulneve
 */
public class LogActivity extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {

        // get parameters
        String username = (String)request.getSession().getAttribute("username");
        if (username == null || username.equals("guest") || username.equals("embed")) return;

        //String date = request.getParameter("datetime");
        String DATE_FORMAT = "HH:mm:ss yyyy/MM/dd";
        SimpleDateFormat sdf =
            new SimpleDateFormat(DATE_FORMAT);
        String date = sdf.format(new Date());
        
        String activity = request.getParameter("activity");
        String details = request.getParameter("details");
        String position = request.getParameter("position");
        String code = request.getParameter("code");

        LogActivity.logActivity(username, date, activity, position, details, code, request);

        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();
        out.print("done");
        out.close();
    }

    public static void logActivity(String username, String datetime, String activity,
            String position, String details, String code, HttpServletRequest request) throws IOException
    {                
        if (username == null || username.equals("guest")) return;
        
        // replace any newlines in code
        code = code.replaceAll("\r\n?|\n","\\$\\$");                
        
        String module = (position == null || position.equals("")) ? "nomodule" : position.split(":")[0];
        // put the current module into the session 
        request.getSession().setAttribute("module", module);                
        
        String datadir = MiscUtils.getDataDir(request); //request.getSession().getServletContext().getInitParameter("datadir")+"/module";

        // get current directory for writing file
        File path = new File(datadir+"/"+username.toLowerCase());
        File path2 = new File(datadir+"/all");
        
        String ip = request.getRemoteAddr();
        String xforward = request.getHeader("X-Forwarded-For");
        
        if (xforward != null) ip = xforward.split(",")[0];        
        
        if (!path.exists()) FileUtils.forceMkdir(path); //path.mkdir();
        if (!path2.exists()) FileUtils.forceMkdir(path2);//path2.mkdir();
        
        // student's "main" file - in their directory
        String csvfile = datadir+"/"+username.toLowerCase()+"/main.csv";
        // student's "main" file - in "all" directory
        String rootfile = datadir+"/all/"+username.toLowerCase()+".csv";
        // nocode file - in their dir
        String nocodefile = datadir+"/"+username.toLowerCase()+"/nocode.csv";                
        
        // write two mains
        CSVWriter writer = new CSVWriter(new FileWriter(csvfile,true));
        CSVWriter writer2 = new CSVWriter(new FileWriter(rootfile,true));
        String[] csvLine = { datetime,ip,activity,position,details,code };
        writer.writeNext(csvLine);
        writer2.writeNext(csvLine);
	writer.close();
        writer2.close();
        
        // nocode
        CSVWriter writerNocode = new CSVWriter(new FileWriter(nocodefile,true));
        String[] csvLineNocode = { datetime,ip,activity,position,details };
        writerNocode.writeNext(csvLineNocode);
	writerNocode.close();
        
        // test files contain only results of tests
        if (activity.startsWith("Test"))
        {
            String testfile = datadir+"/"+username.toLowerCase()+"/tests.csv";
            CSVWriter writerTest = new CSVWriter(new FileWriter(testfile,true));
            String[] csvLineTest = { datetime,activity,position,details };
            writerTest.writeNext(csvLineTest);
            writerTest.close();            
        }
        
        // quiz files contain only interactions with quizzes
        if (activity.startsWith("Quiz"))
        {
            String quizfile = datadir+"/"+username.toLowerCase()+"/quiz.csv";
            CSVWriter writerquiz = new CSVWriter(new FileWriter(quizfile,true));
            String[] csvLineQuiz = { datetime,activity,position,details };
            writerquiz.writeNext(csvLineQuiz);
            writerquiz.close();            
        }
        
        if (activity.startsWith("Medal"))
        {
            String medalfile = datadir+"/"+username.toLowerCase()+"/medal.csv";
            CSVWriter writermedal = new CSVWriter(new FileWriter(medalfile,true));
            String[] csvLinemedal= { datetime,activity,position,details };
            writermedal.writeNext(csvLinemedal);
            writermedal.close();            
        }

        if(activity.startsWith("Assist"))
        {
            String[] x = code.split(":");
            String recipient = x[0];
            int points = Integer.parseInt(x[1]);
            String awardersFileS = datadir+"/"+username.toLowerCase()+"/assists.csv";
            String recipientsFileS = datadir+"/"+recipient+"/assists.csv";
            CSVWriter awardersFile = new CSVWriter(new FileWriter(awardersFileS,true));
            CSVWriter receipientsFile = new CSVWriter(new FileWriter(recipientsFileS,true));
            String[] csvLineRec = { datetime,activity,position,details+":"+points+":"+username.toLowerCase() };
            points = -points;
            String[] csvLineAw = { datetime,activity,position,details+":"+points+":"+recipient };
            awardersFile.writeNext(csvLineAw);
            awardersFile.close();
            receipientsFile.writeNext(csvLineRec);
            receipientsFile.close();
        }
        
        if (activity.endsWith("Error"))
        {
            String errorfile = datadir+"/errorsforall.csv";
            CSVWriter errorline = new CSVWriter(new FileWriter(errorfile,true));
            String[] csvLinemedal= { username.toLowerCase(),datetime,activity,position,details };
            errorline.writeNext(csvLinemedal);
            errorline.close();                        
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
