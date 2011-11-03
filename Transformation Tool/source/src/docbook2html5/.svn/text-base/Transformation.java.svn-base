package docbook2html5;

import java.io.File;
import java.io.IOException;
import org.apache.commons.io.FileUtils;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Templates;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;




/**
 *
 * @author Jakub Hamerník
 */
public class Transformation {
    private static File docbookStylesheet;
    private static File xhtml2html5Stylesheet;
    private static final String path = "docbook2html-xsl";
    private File source;
    private File tempXhtml;
    private Transformer DBtm;
    private Transformer X2Htm;
    private File outputDir;
    private Boolean isSlides;

    /**
     * Creates a new instance of class Transformation
     * @param source a source to transform
     * @param outputDir a directory to save the transformated document
     * @throws TransformationException
     */
    public Transformation(File file, File outputDir, File background) throws TransformationException{
        this.source = file;
        this.outputDir = outputDir;
        
        if(this.isSlides(file)){
            docbookStylesheet = new File(path + "/docbook-xsl/slides/xhtml/flat.xsl");
        } else {
            docbookStylesheet = new File(path + "/docbook-xsl/xhtml/docbook.xsl");
        }
        xhtml2html5Stylesheet = new File(path + "/xhtml2html5.xsl");

        File outputPath = new File(outputDir.getPath());
        try {
            FileUtils.copyDirectory(new File(path + "/output/css"), new File(outputDir.getPath() + "/css"));
            FileUtils.copyDirectory(new File(path + "/output/images"), new File(outputDir.getPath() + "/images"));
            FileUtils.copyDirectory(new File(path + "/output/js"), new File(outputDir.getPath() + "/js"));
            this.CopyFiles(file);
        } catch (IOException ex) {
            throw new TransformationException("Error when copying the additional files");
        }
        
        if(background != null){
            try{
            FileUtils.copyFile(background, new File(outputDir.getPath() + "/images/background.jpg"));
            }catch (IOException ex) {
            throw new TransformationException("Error when copying the background file");
            }
        }

        if(!docbookStylesheet.exists()){
            throw new TransformationException("Docbook xsl stylesheet was not found\n Tried to find it in "+docbookStylesheet.getAbsolutePath());
        }

        if(!xhtml2html5Stylesheet.exists()){
            throw new TransformationException("xhtml2html5 xsl stylesheet was not found\n Tried to find it in "+xhtml2html5Stylesheet.getAbsolutePath());
        }

        TransformerFactory transFact = TransformerFactory.newInstance();

        try {
            Templates docbookTemplate = transFact.newTemplates(new StreamSource(docbookStylesheet));
            DBtm = docbookTemplate.newTransformer();
            Templates xhtml2html5Template = transFact.newTemplates(new StreamSource(xhtml2html5Stylesheet));
            X2Htm = xhtml2html5Template.newTransformer();
        } catch (TransformerConfigurationException ex) {
            throw new TransformationException("Unable to process xsl stylesheet: " + ex);
        }

        try {
            tempXhtml = File.createTempFile("docbook_xhtml", ".html");
        } catch (IOException ex) {
            throw new TransformationException("Error while creating the temporary file: " + ex);
        }
        tempXhtml.deleteOnExit();
    }

    /**
     * Sets parameter to the transformer
     * @param param parameter
     * @param val value
     */
    public void addParameter(String param, String val){
        DBtm.setParameter(param, val);
    }
    /**
     * Testing if the file is Docbook or docbook slides.
     * @param File file
     * @return false or true
     * @throws TransformationException
     */
    public boolean isSlides(File file) throws TransformationException{
        try {
          DocumentBuilder builder=DocumentBuilderFactory.newInstance().newDocumentBuilder();
          Document doc = builder.parse(file);
          Node n = doc.getFirstChild();
          if(n.getNodeName().equals("slides")){
              return true;
          }else{
              return false;
          }
        } catch (java.lang.Exception ex) { 

            throw new TransformationException("Cannot load document: "+ex.toString());
        }
        
    }

    /**
     * Transformates the document into the temporary docbook xhtml file
     * @throws TransformationException
     */
    public void TransformDB() throws TransformationException{
        Source src = new StreamSource(source);
        String fName = source.getName().substring(0, source.getName().lastIndexOf('.'));

        Result tmpres = new StreamResult(tempXhtml);
        
        try {
            DBtm.transform(src, tmpres);
        } catch (TransformerException ex) {
            throw new TransformationException("Error while transformating the document: " + ex);
        }
    }

    /**
     * Transformates the temporary docbook xhtml file into the html5 file
     * @throws TransformationException
     */
    public void TransformX2Htm() throws TransformationException{
        String fName = source.getName().substring(0, source.getName().lastIndexOf('.'));
        File destFile = new File(outputDir.getPath() + "/" + fName + ".html");
        Result res = new StreamResult(destFile);

        Source tmpsrc = new StreamSource(tempXhtml);

        try {
            X2Htm.transform(tmpsrc, res);
        } catch (TransformerException ex) {
            throw new TransformationException("Error while transformating the document: " + ex);
        }
    }
    
    public void CopyFiles(File file) throws TransformationException{
        try{
        DocumentBuilder builder=DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = builder.parse(file);
        NodeList imagedata = doc.getElementsByTagName("imagedata");
        for(int i=0; i < imagedata.getLength(); i++){
            Element e =(Element) imagedata.item(i);
            String filer = e.getAttribute("fileref");
            FileUtils.copyFile(new File(source.getParent() + '/' + filer), new File(outputDir.getPath() + '/' + filer));
        }
        }catch (java.lang.Exception ex) { 
            throw new TransformationException("Cannot load document: "+ex.toString());
        }
    }
}
