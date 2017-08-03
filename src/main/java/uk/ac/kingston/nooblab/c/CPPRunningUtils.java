/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.c;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.ExecuteException;
import org.apache.commons.exec.ExecuteWatchdog;
import org.apache.commons.exec.PumpStreamHandler;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;


/**
 *
 * @author Paul
 */
public class CPPRunningUtils {
    /**
     * Compiles an array of strings containing C++ code to Javascript using Emscripten.
     * Emscripten should be in the server's path, otherwise this will throw an IOException
     * 
     * @param codes Array of strings containing C++ code
     * @return An array pf strings. Index 0 is any error text. Index 
     * @throws IOException 
     */
    public static String[] compileCode(String[] codes, String[] filenames, String destinationDir) throws IOException
    {
        // stash source files somewhere in the temp directory
        String temp = System.getProperty("java.io.tmpdir");
        // create temp directory in system temp
        String tempdirStr = temp+"/"+RandomStringUtils.randomAlphabetic(10);
        //System.out.println(tempdirStr);
        File tempdir = new File(tempdirStr);
        tempdir.mkdir();
        
        String emcl = (System.getProperty("os.name")+"").startsWith("Windows") ? "em++.bat" : "em++";
        CommandLine cmdLine = new CommandLine(emcl);
        
        ArrayList<String> correctedFilenames = new ArrayList();        
        // check filenames for .h files
        for (int i = 0; i < filenames.length; i++)
        {
            if (filenames[i].endsWith(".h"))
            {
                correctedFilenames.add(filenames[i]);
                // append .cpp to filename of .h - will end up with .h.cpp
                filenames[i] = filenames[i]+".cpp";
            }
        }
        
        for (int i = 0; i < codes.length; i++)
        {            
            String code = codes[i];
            // correct references to .h files to .h.cpp
            for (String correctedFilename : correctedFilenames)
            {
                code = code.replace("\""+correctedFilename+"\"","\""+correctedFilename+".cpp\"");
            }
            String filename = tempdirStr+"/"+filenames[i];            
            FileUtils.writeStringToFile(new File(filename),code);
            cmdLine.addArgument("\""+filename+"\"",true);
        }
        cmdLine.addArgument("--pre-js");
        cmdLine.addArgument(temp+"/cpp-pre-js.js",true);
        cmdLine.addArgument("--post-js");
        cmdLine.addArgument(temp+"/cpp-post-js.js",true);
        //cmdLine.addArgument("-s");
        //cmdLine.addArgument("EMTERPRETIFY=1");
        //cmdLine.addArgument("-s");
        //cmdLine.addArgument("EMTERPRETIFY_ASYNC=1");
        cmdLine.addArgument("-s");
        cmdLine.addArgument("INVOKE_RUN=0");
        cmdLine.addArgument("-o");
        cmdLine.addArgument(destinationDir+"/cppout.js");
        DefaultExecutor executor = new DefaultExecutor();
        ExecuteWatchdog watchdog = new ExecuteWatchdog(60000);
        executor.setWatchdog(watchdog);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PumpStreamHandler streamHandler = new PumpStreamHandler(outputStream);
        executor.setStreamHandler(streamHandler);
        int exitValue = 0;
        try { exitValue = executor.execute(cmdLine); } catch (ExecuteException e) { exitValue = 1; };
        // we should now have javsscript in tempdirStr/out.js
        // suck this into a string, then clean up, and return string
        String errors = outputStream.toString();
        String[] retarr;
        if (exitValue == 0)
        {
            String outjs = FileUtils.readFileToString(new File(destinationDir+"/cppout.js"));
            retarr = new String[]{ errors,outjs };
        }
        else
        {
            retarr = new String[]{ errors };
        }
        // clean up
        FileUtils.deleteDirectory(tempdir);
        return retarr;
    }
    
    /*
    // test main
    public static void main(String[] args) throws Exception
    {
        String code = "#include <iostream>\n"+ 
"using namespace std;\n" +
"\n" +
"int main()\n" +
"{\n" +
"    cout << \"Hello World!\";\n" +
"}";
        String[] codes = { code };
        String[] result = compileCode(codes);
        System.out.println(result[0]);
        System.out.println(result[1]);
    } */
}
