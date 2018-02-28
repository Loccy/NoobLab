package doppio;

/**
 * Pipe a route through to Javascriptland
 * @author the Doppio people
 */
public class JavaScript {
    public static native String eval(String jsCode);
}
