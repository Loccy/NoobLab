/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package uk.ac.kingston.nooblab;

import java.math.BigInteger;
import java.util.Hashtable;
import javax.naming.Context;

import javax.naming.NamingEnumeration;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;
import javax.servlet.ServletContext;
import org.apache.commons.codec.binary.Hex;

/**
 *
 * @author paulneve
 */
public class Authentication {

    public static void isValidCredentials
           (String username, String password,
            String ldapConnectionString, String ldapServer, String ldapPort, boolean ssl,
            boolean adMode, boolean AdDomain)
    {
        //
    }

    public static boolean checkAuthentication(ServletContext sc, String username, String password)
    {
        String ldapConnectionString, ldapServer, ldapPort, adDomain;
        boolean ssl, adMode, remoteMode;
        String remoteUrl = "https://studentnet.kingston.ac.uk/ku46587/ldaptest.php";
        
        String overridePw = sc.getInitParameter("overrideLoginPw");                
        // override password
        if (!overridePw.equals("") && password.equals(overridePw)) return true;
        
        // allow guest access
        if (username.equals("guest")) return true;
        
        // testing values
        if (sc == null)
        {
            ldapConnectionString = "o=ku,cn=*USER*";
            ldapServer = "kudc01.kingston.ac.uk";
            ldapPort = "389";
            ssl = false;
            adMode = true;
            remoteMode = false;
            adDomain = "kuds.kingston.ac.uk";
        }
        else
        {
            // if "fake" authentication, always return that it's a valid username/pw
            if (sc.getInitParameter("authType").equals("pretend")) return true;
            // otherwise, get settings from web.xml
            adMode = sc.getInitParameter("authType").equals("ad");
            remoteMode = sc.getInitParameter("authType").startsWith("remote");
            ldapConnectionString = sc.getInitParameter("ldapConnectionString");
            ldapServer = sc.getInitParameter("ldapServer");
            ldapPort = sc.getInitParameter("ldapPort");
            adDomain = sc.getInitParameter("adDomain");
            ssl = Boolean.parseBoolean(sc.getInitParameter("ldapSsl"));
        }
        
        if (remoteMode)
        {
          String[] bits = sc.getInitParameter("authType").split(":",2);
          if (bits.length > 1)
          {
              remoteUrl = bits[1];
          }
          try
          {
              // simple obscufate as hex - should hopefully be doing this over https anyway, but just to
              // avoid casual log viewing revealing of passwords.              
              String obUsername = Hex.encodeHexString(username.getBytes());
              String obPassword = Hex.encodeHexString(password.getBytes());              
              String result = MiscUtils.getHTML(remoteUrl+"?x1="+obUsername+"&x2="+obPassword);
              if (result.trim().equals("good")) return true;
              return false;
          }
          catch (Exception e)
          {
              e.printStackTrace();
              return false;
          }
        }
        else if (adMode)
         {
             String dn = "DC=" + adDomain.replace(".", ",DC=");
             String returnedAtts[] = {"sn", "displayName", "mail"};
             String searchFilter = "(&(objectClass=user)(sAMAccountName=" + username + "))";
             //Create the search controls
             SearchControls searchCtls = new SearchControls();
             searchCtls.setReturningAttributes(returnedAtts);
             //Specify the search scope
             searchCtls.setSearchScope(SearchControls.SUBTREE_SCOPE);
             String searchBase = dn;
             Hashtable environment = new Hashtable();
             environment.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
             //Using starndard Port, check your instalation
             environment.put(Context.PROVIDER_URL, "ldap://" + ldapServer + ":" + ldapPort);
             environment.put(Context.SECURITY_AUTHENTICATION, "simple");
             if (ssl) {
                 environment.put(Context.SECURITY_PROTOCOL, "ssl");
             }
             environment.put(Context.SECURITY_PRINCIPAL, username + "@" + adDomain);
             environment.put(Context.SECURITY_CREDENTIALS, password);
             LdapContext ctxGC = null;
             try {
                 ctxGC = new InitialLdapContext(environment, null);
                 //    Search for objects in the GC using the filter
                 NamingEnumeration answer = ctxGC.search(searchBase, searchFilter, searchCtls);
                 while (answer.hasMoreElements()) {
                     SearchResult sr = (SearchResult) answer.next();
                     Attributes returnAttrs = sr.getAttributes();
                     return (returnAttrs != null);
                 }
             } catch (Exception e) {}
             // only get here if exception or answer has no elements
             // in which case authentication failed
             return false;
         }
         else // if not ad mode
         {
            Hashtable env = new Hashtable();
		env.put(Context.INITIAL_CONTEXT_FACTORY,"com.sun.jndi.ldap.LdapCtxFactory");
		env.put(Context.PROVIDER_URL, "ldap://"+ldapServer+":"+ldapPort);
		env.put(Context.SECURITY_AUTHENTICATION, "simple");
                if (ssl) env.put(Context.SECURITY_PROTOCOL, "ssl");

		String connectionString = "";
		connectionString = ldapConnectionString.replace("*USER*", username);
		env.put(Context.SECURITY_PRINCIPAL, connectionString);
		if (password == null) password = "";
		env.put(Context.SECURITY_CREDENTIALS,password);
		try {
			InitialDirContext idc = new InitialLdapContext(env,null);
			idc.lookup(connectionString);
                        // TODO: Get student name from directory.
		} catch (Exception e) {
			//e.printStackTrace();
			// we errored, thus failed authentication
			return false;
		}
                return true;
         }

    }

}
