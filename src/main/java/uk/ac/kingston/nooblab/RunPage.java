/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.io.IOException;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author paulneve
 */
public class RunPage extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(final HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        String code = request.getParameter("codeinput");
        String codefortest = request.getParameter("codefortest");
        if (codefortest != null)
        {
            codefortest = codefortest.trim();
        }
        else
        {
            codefortest = "";
        }
        String halt = "hold(1);";
        if (request.getParameter("nohalt") != null && request.getParameter("nohalt").equals("true"))
        {
            halt = "";
        }

        if (codefortest.equals("")) codefortest = code;

        // see if code actually runs with skeleton additional functions
        String testCode = "function cls(){}; function print(x){} function println(x){} function input(x){ return 0; } ";
        testCode = testCode + "function wrapper() { "+codefortest+" }";

        ScriptEngineManager manager = new ScriptEngineManager();
        final ScriptEngine engine = manager.getEngineByName("js");
        try {
            engine.eval(testCode);
        } catch (ScriptException ex) {
            String error = ex.getMessage();
            String[] x = error.split(": ");
            error = "";
            for (int i = 1; i < x.length; i++)
            {
                error = error + x[i]+" ";
            }
            // get rid of all the weirdness of the error message, e.g. (#2)
            error = error.replaceAll("<Unknown source>","");
            error = error.replaceAll("\\(#\\d\\)", "");
            error = error.replace("in  at ","<br/>Error at or around ");

            request.setAttribute("error",error);
            request.setAttribute("linenumber",ex.getLineNumber()-1);
            RequestDispatcher rd = request.getRequestDispatcher("runpage.jsp");
            rd.forward(request, response);
            return;
        }

        // consistantise CRs     
        code = code.replaceAll("\r\n","\n");
        String newCode = "";
        
        String[] codelines = (code+"\n").split("\n");
        for (int lineno = 0; lineno < codelines.length; lineno++)
        {
           String line = codelines[lineno].trim();
           String nextLine = "";
           try
           {
              nextLine = codelines[lineno+1].trim();
            } catch (Exception e) {}

           if (line.length() == 0) line = "//";
           if (nextLine.length() == 0) nextLine = "//";

           char eol = line.charAt(line.length()-1);
           boolean valid = false;

           // detect valid end of line
           if (eol == ';') valid = true;
           else if (eol == '/') valid = true; // end of comment
           else if (line.contains("//")) valid = true;
           else if (line.endsWith("}")) valid = true; // end of code block
           else if (eol == '{') valid = true; // start of code block
           else  if (nextLine.startsWith("{")) valid = true; // code block on next line

           if (!valid)
           {
               request.setAttribute("error","Missing semicolon at end of line<br/>Error at or around line "+(lineno+1));
               request.setAttribute("linenumber", lineno);
               lineno = codelines.length;
           }
           newCode += line+"\n";
           //if (lineno == codelines.length-2) newCode += nextLine+"\n";
        }
        
        code = newCode;
        
        // add in a 1ms SJS halt at each line - this should prevent any rogue progs
        // from hanging browsers. Also add hook to "end" run
        //code = code.replaceAll(";(\\s*)\n", "; "+halt+" if (halt == true) return 'terminated'; \r\n");
        code = code.replaceAll(";(\\s*)\n", "; "+halt+" if (halt == true) throw new Error('Program terminated by user.'); \r\n");

        request.setAttribute("filteredcode", code);

        //request.setAttribute("codeinput", code);

        RequestDispatcher rd = request.getRequestDispatcher("runpage.jsp");
        rd.forward(request, response);
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
