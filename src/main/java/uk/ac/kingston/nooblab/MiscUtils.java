/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package uk.ac.kingston.nooblab;

import java.util.Properties;
import java.util.UUID;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;

/**
 *
 * @author paulneve
 */
public class MiscUtils
{
    public static String arrayToJs(Object[] arr)
    {
        String array = "[";
        for (Object a : arr)
        {
            a = jsStringEscape(a.toString());
            array += "'"+a+"',";
        }
        array += "]";
        array = array.replaceAll(",\\]$","]");
        return array;
    }
    
    public static String jsStringEscape(String s)
    {
        // delete return chars
        s = s.replaceAll("\\r|\\n", " ");
        // escape difficult characters
        s = s.replace("\\","\\\\");
        s = s.replace("'","\\'");        
        return s;
    }
    
    public static String getDataDir(HttpServletRequest request)
    {
        String datadir = request.getSession().getServletContext().getInitParameter("datadir");
        String module = (String)request.getSession().getAttribute("module");
        if (module == null || "".equals(module)) module = "";
        if (!module.equals("")) datadir += "/"+module;
        return datadir;
    }
    
    public static String getDataDir(HttpServletRequest request, boolean module)
    {
        String datadir = request.getSession().getServletContext().getInitParameter("datadir");
        return datadir;
    }
    
    public static String klungeUID(String str)
    {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < str.length(); i++)
        {
            result.append(UUID.randomUUID().toString().replace("-",""));
            result.append(Character.toLowerCase(str.charAt(i)));
        }
        return result.toString();
    }
    
    public static void sendMail(String mailhost, String recipient, String from, String subject, String msgText) throws NoSuchProviderException, MessagingException
    {
        System.out.println(mailhost);
        System.out.println(recipient);
        System.out.println(from);
        System.out.println(subject);
        System.out.println(msgText);
        
        Properties props = new Properties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.host", mailhost);
        //props.put("mail.smtp.auth", "true");

        //Authenticator auth = new SMTPAuthenticator();
        Session mailSession = Session.getDefaultInstance(props, null);
        // uncomment for debugging infos to stdout
        //mailSession.setDebug(true);
        Transport transport = mailSession.getTransport();

        MimeMessage message = new MimeMessage(mailSession);
        message.setContent(msgText, "text/plain");
        message.setSubject(subject);
        message.setFrom(new InternetAddress(from));
        message.addRecipient(Message.RecipientType.TO,
             new InternetAddress(recipient));

        transport.connect();
        transport.sendMessage(message,
            message.getRecipients(Message.RecipientType.TO));
        transport.close();
    }
    
    
    public static void main(String[] args) throws Exception
    {
        String message = "Hello there, this is a test";
        //public static void sendMail(String mailhost, String recipient, String from, String subject, String msgText) throws NoSuchProviderException, MessagingException
        sendMail("smtp.kingston.ac.uk","p.neve@kingston.ac.uk","p.neve@kingston.ac.uk","Test message","This is a test");
    }
    
}
