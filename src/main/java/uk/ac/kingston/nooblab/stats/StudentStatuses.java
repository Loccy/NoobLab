/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab.stats;

import au.com.bytecode.opencsv.CSVParser;
import au.com.bytecode.opencsv.CSVReader;
import java.io.File;
import java.io.FileReader;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

/**
 *
 * @author paulneve
 */
public class StudentStatuses
{    
    public static boolean hasPassedTest(ArrayList<String> testIds,String basefile)
    {
        int passed = 0;
        try
        {
            File datafile = new File(basefile);
            CSVReader reader = new CSVReader(new FileReader(datafile));
            String [] nextLine;
            while ((nextLine = reader.readNext()) != null)
            {
                for (String testId : testIds)
                {
                    if (nextLine[1].equals("TestPassed") && nextLine[2].toLowerCase().endsWith(testId.toLowerCase())) passed++;
                }
                if (passed == testIds.size())
                {
                    return true;
                }
            }  
            reader.close();
        } catch (Exception e) {}
        return false;
    }
    
    public static TreeMap<Double,Object[]> highScoreTable(String startdir)
    {
        File[] users = new File(startdir+"/all").listFiles();
        TreeMap<Double,Object[]> results = new TreeMap(Collections.reverseOrder());
        for (File user : users)
        {
            String filename = user.getAbsolutePath();
            if (filename.toLowerCase().endsWith(".csv"))
            {
                String id = user.getName().split("\\.")[0];
                String medalfile = startdir+"/"+id+"/medal.csv"; 
                int bronze = 0;
                int silver = 0;
                int gold = 0;
                int ribbon = 0;
                TreeMap<String,String> studentMedals = StudentStatuses.medals(medalfile);
                for (String value : studentMedals.values()) 
                {
                    if (value.equals("gold")) gold++;
                    if (value.equals("bronze")) bronze++;
                    if (value.equals("silver")) silver++;
                    if (value.equals("ribbon")) ribbon++;
                }
                double totalpoints = (gold*5)+(silver*3)+(bronze*2)+(ribbon*0.01);
                try
                {
                    String numberOnly = id.replaceAll("[^0-9]", "");                    
                    numberOnly = "0.00"+numberOnly;
                    totalpoints += Double.parseDouble(numberOnly);
                }
                catch (Exception e)
                {
                    // TODO: This all presupposes that student ID contains a unique number.
                    // ...as well as ID numbers not being so long that they force things
                    // into exponential notation when appended to 0.00...!
                    // Works for KU IDs, can't possibly comment for other institutions!
                }
                int ass = 0;
                HashMap<String,Integer> assists = StudentStatuses.getAssists(startdir+"/"+id);
                for (Integer value : assists.values()) {
                    ass += value;
                }
                totalpoints += ass;

                Object[] x = {id,gold,silver,bronze,ribbon,ass};
                results.put(totalpoints,x);
            }
        }
        return results;
    }
    
    /**
     * 
     * @param medalFile medal.csv location
     * @return ArrayList. First element is overall score where
     * gold is worth 5, silver 2 and bronze 1 (and ribbons zero, as they're
     * formative). Subsequent items are String[2] where String[0] is medal type
     * and String[1] is medal label.
     */
    public static TreeMap<String,String> medals(String medalFile)
    {
        try {
            TreeMap<String,String> medalDetails = new TreeMap<String,String>();
            medalDetails.put("finalscore","0");
            File datafile = new File(medalFile);
            HashMap<String,Integer> assists = 
                    getAssists(medalFile.substring(0,medalFile.lastIndexOf(File.separator)));

            CSVReader reader = new CSVReader(new FileReader(datafile));
            String [] nextLine;
            while ((nextLine = reader.readNext()) != null)
            {
                String[] thisMedal = nextLine[3].split(":");
                String medalType = thisMedal[0];
                String medalLabel = thisMedal[1];
                String medalId = thisMedal[2];
                Integer score = Integer.parseInt(medalDetails.get("finalscore"));
                String points;
                if (medalType.equalsIgnoreCase("gold")) points = "5";
                else if (medalType.equalsIgnoreCase("silver")) points = "3";
                else if (medalType.equalsIgnoreCase("bronze")) points = "2";
                else points = "";
                
                // do we already have a medal?
                String currentMedal = medalDetails.get(medalLabel);
                if (currentMedal == null)
                {
                    // no medal... add points and item
                    medalDetails.put(medalLabel,medalType);
                    if (!points.equals("")) score = score + Integer.parseInt(points);
                    if (assists.containsKey(medalId+":awarded"))
                    {
                        medalDetails.put(medalLabel+" (-assist)",""+assists.get(medalId+":awarded"));
                        score += assists.get(medalId+":awarded");
                    }
                    if (assists.containsKey(medalId+":received"))
                    {
                        medalDetails.put(medalLabel+" (+assist)",""+assists.get(medalId+":received"));
                        score += assists.get(medalId+":received");
                    }

                }
                // if they currently have a bronze and have just won a silver or gold
                else if (currentMedal.equalsIgnoreCase("bronze")
                            && (medalType.equalsIgnoreCase("silver") || medalType.equalsIgnoreCase("gold")) )
                {
                    // add points for new medal MINUS existing medal
                    medalDetails.put(medalLabel,medalType);
                    if (!points.equals("")) score = score + Integer.parseInt(points)-2;
                }
                // if they currently have a silver and have just won a gold
                else if (currentMedal.equalsIgnoreCase("silver") && medalType.equalsIgnoreCase("gold"))   
                {
                    // add points for new medal MINUS existing medal
                    medalDetails.put(medalLabel,medalType);
                    if (!points.equals("")) score = score + Integer.parseInt(points)-3;
                }             
                medalDetails.put("finalscore",score+"");
            }   
            reader.close();
            return medalDetails;
        } catch (Exception ex) {
            TreeMap<String,String> medalDetails = new TreeMap<String,String>();
            medalDetails.put("finalscore","0");
            return medalDetails;
        }
    }
    
    public static ArrayList<String[]> tailLogFile(String filename)
    {
        File file = new File(filename);
        try
        {
            ArrayList<String[]> last20 = tail(file,20);            
            return last20;
        }
        catch (Exception e) { return new ArrayList<String[]>(); }
    }
    
    public static HashMap<String,String> testWithMedal(String dir)
    {
        return testWithMedal(dir,false);
    }
    
    public static HashMap<String,String> testWithMedal(String dir, boolean withDate)
    {
            List<String[]> testLines = new ArrayList<String[]>();            
            try
            {
                CSVReader testReader = new CSVReader(new FileReader(new File(dir+"/tests.csv")));
                testLines = testReader.readAll();
                testReader.close();
            }
            catch (Exception e) {}
            
            List<String[]> medalLines = new ArrayList<String[]>();            
            try
            {
                CSVReader medalReader = new CSVReader(new FileReader(new File(dir+"/medal.csv")));
                medalLines = medalReader.readAll();
                medalReader.close();
            }
            catch (Exception e) {}
            
            HashMap<String,String> tests = new HashMap<String,String>();
            for (String[] testLine : testLines)
            {
                String status = testLine[1];
                if ("TestPassed".equals(status))
                {
                    String testId = testLine[2];
                    testId = testId.substring(testId.lastIndexOf(':') + 1);
                    if (testId.trim().length() != 0) tests.put(testId,"");
                    //System.out.println("Found test passed: "+testId);
                }
            }
            for (String[] medalLine : medalLines)
            {                           
                String date = medalLine[0];
                String[] details = medalLine[3].split(":");
                String grade = withDate ? details[0]+":"+date : details[0];
                String id = details[details.length-1];
                String current = tests.get(id);
                if (current == null) current = "";                
                if (current.equals("") || current.equals("bronze") || (current.equals("silver") && grade.equals("gold") ) )
                {                    
                    tests.put(id,grade);
                }
            }
            return tests;        
    }

    public static HashMap<String,Integer> getAssists(String dir)
    {
        List<String[]> assLines = new ArrayList<String[]>();
        try
        {
            CSVReader assReader = new CSVReader(new FileReader(new File(dir+"/assists.csv")));
            assLines = assReader.readAll();
            assReader.close();
        }
        catch (Exception e) {}

        HashMap<String,Integer> result = new HashMap();
        for (String[] line : assLines)
        {
            String medalId = line[3].split(":")[1];
            int assPoints = Integer.parseInt(line[3].split(":")[2]);
            String type = assPoints > 0 ? "received" : "awarded";
            medalId = medalId+":"+type;
            if (!result.containsKey(medalId))
            {
                result.put(medalId, 0);
            }
            int currentPoints = result.get(medalId);
            result.put(medalId,currentPoints+assPoints);
        }
        return result;
    }
    
    public static Object getTestAttempts(String dir)
    {
        List<String[]> testLines = new ArrayList<String[]>();            
        try
        {
            CSVReader testReader = new CSVReader(new FileReader(new File(dir+"/tests.csv")));
            testLines = testReader.readAll();
            testReader.close();
        }
        catch (Exception e) {}
        
        HashMap<String,Integer> quantities = new HashMap();
        
        for (String[] testLine : testLines)
        {
            String status = testLine[1];
            String testId = testLine[2];
            String medal = null;
            String[] x = testLine[3].split(":");
            if (x.length == 2) medal = x[1];

            testId = testId.substring(testId.lastIndexOf(':') + 1);

            if (medal != null) testId = testId+ ":"+medal;

            if ("TestPassed".equals(status))
            {
                // if passed, forget quantities                
                quantities.put(testId,-1);
            }

            if ("TestStart".equals(status))
            {
                if (testId.length() != 0)
                {
                    if (!quantities.containsKey(testId))
                    {
                        quantities.put(testId,0);
                    }
                    int current = quantities.get(testId);
                    if (current != -1)
                    {
                        current++;
                        quantities.put(testId,current);
                    }
                }
            }
        }
        
        return quantities;
    }
    
    // slightly modded from http://stackoverflow.com/questions/686231/java-quickly-read-the-last-line-of-a-text-file
    public static ArrayList<String[]> tail(File file, int linesToRead) throws Exception
    {        
        RandomAccessFile raf = new RandomAccessFile(file, "r");
        //String lines = "";
        int noOfLines = 0;
        ArrayList<String[]> lines = new ArrayList<String[]>();

        final int chunkSize = 1024;
        long end = raf.length();
        boolean readMore = true;
        while (readMore) 
        {
            byte[] buf = new byte[chunkSize];

            // Read a chunk from the end of the file
            long startPoint = end - chunkSize;
            long readLen = chunkSize;
            if (startPoint < 0) {
                readLen = chunkSize + startPoint;
                startPoint = 0;
            }
            raf.seek(startPoint);
            readLen = raf.read(buf, 0, (int)readLen);
            if (readLen <= 0) {
                break;
            }

            // Parse newlines and add them to an array
            int unparsedSize = (int)readLen;
            int index = unparsedSize - 1;
            while (index >= 0) {               
                if (buf[index] == '\n') {
                    int startOfLine = index + 1;
                    int len = (unparsedSize - startOfLine);
                    if (len > 0) {
                        String line = new String(buf, startOfLine, len).trim();
                        String[] lineArr = new CSVParser().parseLine(line);
                        lines.add(lineArr);
                        noOfLines++;
                    }
                    unparsedSize = index + 1;
                }
                --index;
            }

            // Move end point back by the number of lines we parsed
            // Note: We have not parsed the first line in the chunked
            // content because could be a partial line
            end = end - (chunkSize - unparsedSize);

            readMore = noOfLines < linesToRead && startPoint != 0;
       }
       Collections.reverse(lines);
       return lines;
    }
    
}
