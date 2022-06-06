/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */ 

package uk.ac.kingston.nooblab.java;

import java.io.File;
import java.io.IOException;
import java.lang.String;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletContext;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.SystemUtils;

/**
 *
 * @author paulneve
 */
public class JavaRunningUtils {
    
    public static String[] compileCode(String codes[], String id, String basedir,
                                        String classWithMain, String pkgWithMain,
                                        ServletContext sc) throws IOException
    {
        return compileCode(codes,id,basedir,classWithMain,pkgWithMain,true,sc);
    }
    
    public static String[] compileCode(String codes[], String id, String basedir,
                                        String classWithMain, String pkgWithMain, boolean serverRun,
                                        ServletContext sc) throws IOException
    {
        return compileCode(codes, id, basedir,
                            classWithMain, pkgWithMain, 
                            serverRun, false,sc);
    }

    /**
     * Compiles what is supplied in the string code into the basedir.
     * Each new compile will go into a timestamp-based subdirectory,
     * @param code source code
     * @param id student's id
     * @param basedir student's base dir
     * @return a string array, element 0 is the class name from the code,
     * element 1 the package, element 2 the timestamp.
     */
    public static String[] compileCode(String codes[], String id, String basedir,
                                        String classWithMain, String pkgWithMain, boolean serverRun,
                                        boolean newdoppio,
                                        ServletContext sc) throws IOException
    {     
        if (pkgWithMain == null || "".equals(pkgWithMain)) pkgWithMain = "defaultpackage";
        
        File bdfile = new File(basedir+"/compiled");
        // remove any previous stuff
        FileUtils.deleteQuietly(bdfile);
        // if basedir doesn't exist, attempt to create it
        FileUtils.forceMkdir(bdfile);        
        
       // String dir = basedir;

        // create "file" objects for our code
        DynamicJavaSourceCodeObject javaFileObjects[] = new DynamicJavaSourceCodeObject[codes.length];
        String[] classNames = new String[codes.length];
        
        for (int i = 0; i < codes.length; i ++)
        {
            String pkg = serverRun ? "defaultpackage" : "";
            // next code file...
            String code = codes[i];
          
            Pattern pattern = Pattern.compile("package (.*?);");
            Matcher matcher = pattern.matcher(code);
            if (matcher.find()) {                
                pkg = matcher.group(1);
                // we're going to need to put everyone's code in a discrete package, based on
                // their ID (if server running)
                if (serverRun) code = code.replaceFirst(pkg,id+"."+pkg);
            }
            else if (serverRun)
            {
                // no package, so we're going to need to inject the line "package defaultpackage"
                // into the file
                code = "package "+id+".defaultpackage; "+code;
            }            
            
            String className = "(unknown)";
            //pattern = Pattern.compile("class (.*?)\\{",Pattern.DOTALL);
            pattern = Pattern.compile("\\s*(class|interface) (\\w+)");
            matcher = pattern.matcher(code);
            if (matcher.find()) {
                className = matcher.group(2);
                className = className.trim();
            }
            else
            {
                // it ain't gonna compile anyway :-)
                // TODO: handle thing gracefully :-)
            }
            className = className.replaceAll("[^A-Za-z0-9]", "");

            // finally, whack the remapping of IO code onto the end if serverRun
            if (serverRun) code = IORedefiner.modCode(code,id,classWithMain,pkgWithMain);
            // and update array
            codes[i] = code;
            if (!pkg.equals("")) pkg += ".";
            DynamicJavaSourceCodeObject fileObject = new DynamicJavaSourceCodeObject (pkg+className,code);
            classNames[i] = pkg+className;
            javaFileObjects[i] = fileObject;           
        }            
        
        // compile the class
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        StandardJavaFileManager sjfm = compiler.getStandardFileManager(null, Locale.getDefault(), null);
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();
        
        // check to see if oldrt exists
        // extract it from Doppio dir and put it in temp if not
        File oldrt = new File(System.getProperty("java.io.tmpdir")+"/oldrt.jar");
        if (!oldrt.exists())
        {
            FileUtils.copyInputStreamToFile(sc.getResourceAsStream("/doppio/vendor/java_home/lib/rt.jar"), oldrt);
        }
        
        String[] compileOptions;
        //System.out.println(JavaRunningUtils.class.getResource("/").getPath());
        if (sc != null)
        {
            if (!newdoppio) // old doppio
            {
                compileOptions = new String[]{
                    "-d", basedir+"/compiled",
                    "-target","1.6",
                    "-nowarn",  // needed as later JDKs generate warnings for 1.6 source
                    "-source","1.6",
                    "-bootclasspath", oldrt.getCanonicalPath(),
                    "-cp", JavaRunningUtils.class.getResource("/").getPath(),"-g"
                    //"-cp", sc.getRealPath("/WEB-INF/classes"), "-g"
                };
            }
            else // new doppio
            {
                compileOptions = new String[]{
                    "-d", basedir+"/compiled",
                    "-target","1.8",
                    "-nowarn",  // needed as later JDKs generate warnings for 1.8 source
                    "-source","1.8",
                    //"-cp", JavaRunningUtils.class.getResource("/").getPath(),"-g"
                    "-cp", sc.getRealPath("/WEB-INF/classes"), "-g" // this seems to need flipping on JDK 11
                };
            }
        }
        else
        {
            compileOptions = new String[]{
                "-d", basedir+"/compiled",
                "-target","1.8",
                "-source","1.8",/*
                "-cp", sc.getRealPath("/WEB-INF/classes"), "-g" */
            };
        }
        
        boolean status = compiler.getTask(null, sjfm, diagnostics, Arrays.asList(compileOptions), null, Arrays.asList(javaFileObjects)).call();
        try { sjfm.close(); } catch (IOException ex) { ex.printStackTrace();}
        if (!status)
        {
            ArrayList<String> errorList = new ArrayList<String>();
            errorList.add("**ERROR**");
            for (Diagnostic diagnostic : diagnostics.getDiagnostics()){
                errorList.add("Error on line "+diagnostic.getLineNumber()+" in "+diagnostic);
            }
            return Arrays.copyOf(errorList.toArray(), errorList.size(), String[].class);
        }
        else if (serverRun)
        {
            return new String[]{classWithMain,pkgWithMain};
        }
        else
        {            
            return classNames;
        }
    }

    public static Thread runMain(String id, String className, String packageName, 
            String baseDir, final ArrayList<String> out, final ArrayList<String> in, final ServletContext sc)
    {
        if (packageName == null) packageName = "defaultpackage";
        packageName = id+"."+packageName;
        // now run
        final String fclassName = className;
        final String fpackageName = packageName;
        final String dir = baseDir;
        Thread thread = new Thread()
        {
            public void run()
            {
                try
                {
                    URLClassLoader ucl = URLClassLoader.newInstance(new URL[] { 
                        new File(dir+"/compiled").toURI().toURL(),
                        new File(sc.getRealPath("/WEB-INF/classes")).toURI().toURL()
                    });
                    
                    String fullClassName = fclassName;
                    if (fpackageName != null) fullClassName = fpackageName+"."+fullClassName;
                    Class clazz = ucl.loadClass(fullClassName);
                    
                    // set IORedefiner
                    Class ioClass = ucl.loadClass("uk.ac.kingston.nooblab.java.IORedefiner");
                    Object io = ioClass.newInstance();
                    Method method = ioClass.getDeclaredMethod("setOut", new Class[] { out.getClass() });
                    method.invoke(io,out);
                    method = ioClass.getDeclaredMethod("setIn", new Class[] { in.getClass() });
                    method.invoke(io,in);
                    
                    // set IORemapper
                    method = clazz.getDeclaredMethod("setNewIo", new Class[] { io.getClass() });                                     

                    Object object = clazz.newInstance();
                    method.invoke(object,io);

                    method = clazz.getDeclaredMethod("main", new Class[] { String[].class });                    
                    String[] mainArgs = new String[1];
                    method.invoke(object, mainArgs);

                } catch (Exception e) { /* e.printStackTrace(); */ }
            }
            
            
        };
        thread.setName(className);
        return thread;
    }
    
    public static void monitor(final Thread javaRunThread,
            final ArrayList<String> out,
            final ArrayList<String> in,
            final ArrayList<String> command)
    {
        javaRunThread.start();
        
        // monitor javaRunThread for either lasting more than two minutes, or
        // for a STOP command on the command channel
        Thread monitor = new Thread()
        {
            public void run()
            {
                try
                {
                    int timesecs = 0;
                    boolean stopDetected = false;
                    while ((javaRunThread.isAlive() || !out.isEmpty()) && timesecs <= 120 && !stopDetected)
                    {
                        // have we had a stop command?
                        if (!command.isEmpty() && command.get(command.size()-1).equals("stop"))
                        {
                            stopDetected = true;
                            command.remove(command.size()-1);
                        }
                        Thread.sleep(1000);
                        timesecs += 1;
                    }
                    javaRunThread.stop();
                    command.add("stop");
                } catch (Exception e) { e.printStackTrace(); }
            }                        
        };
        monitor.start();
    }
    
    // stress test!
    
    public static void main(String[] args) throws Exception
    {
        /*
         * compileCode(String codes[], String id, String basedir,
                                        String classWithMain, String pkgWithMain, boolean serverRun,
                                        ServletContext sc) throws IOException
         */
        
        System.out.println("And we're off");
        
        int many = 50;
        if (args.length > 0) many = Integer.parseInt(args[0]);
        
        for (int i = 0; i < many; i++)
        {
            final int fi = i;
            System.out.println("Starting thread "+fi);
            Thread x = new Thread(){                
                public void run()
                {
                    int fix = fi;
                    String id = UUID.randomUUID().toString();
                    String[] code = { "import java.util.Scanner; public class Pigin { public static void main(String[] args) { Scanner keyboard = new Scanner(System.in); System.out.println(\"How many bottles to start with?\"); int bottles = keyboard.nextInt();  for (int i = bottles; i > 0; i--) {   String currentBottles =\"\";   String leftBottles =\"\";   String currentWord = \"bottles\";   String leftWord = \"bottles\";   if (i == 10)   {     currentBottles = \"ten\";     leftBottles = \"nine\";   }   else if (i == 9)   {     currentBottles = \"nine\";     leftBottles = \"eight\";   }   else if (i == 8)   {     currentBottles = \"eight\";     leftBottles = \"seven\";   }   else if (i == 7)   {     currentBottles = \"seven\";     leftBottles = \"six\";   }   else if (i == 6)   {     currentBottles = \"six\";     leftBottles = \"five\";   }   else if (i == 5)   {     currentBottles = \"five\";     leftBottles = \"four\";   }   else if (i == 4)   {     currentBottles = \"four\";     leftBottles = \"three\";   }   else if (i == 3)   {     currentBottles = \"three\";     leftBottles = \"two\";   }   else if (i == 2)   {     currentBottles = \"two\";     leftBottles = \"one\";     leftWord = \"bottle\";   }   else if (i == 1)   {     currentBottles = \"one\";     currentWord = \"bottle\";     leftBottles = \"no\";   }   System.out.println(currentBottles+\" green \"+currentWord+\", hanging on the wall\");   System.out.println(currentBottles+\" green \"+currentWord+\", hanging on the wall\");   System.out.println(\"and if one green bottle, should accidentally fall\");   System.out.println(\"there'd be \"+leftBottles+\" green \"+leftWord+\", hanging on the wall\");   System.out.println(); } } }" };                    
                    try {
                        compileCode(code, id, "/data/noobdata/noobstress/"+id, null, null, false,null);
                        System.out.println("Compile finished in thread "+fix);
                    } catch (IOException ex) { ex.printStackTrace(); }                
                }
            };
            x.start();
        }

    }

}
