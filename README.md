**Docbook2html5** is a simple-to-use utility for converting study materials in Docbook / Docbook Slides format into the SGML variant of HTML5. Currently available transformation stylesheets are a bit antiquated and this project attempts to fix it by fully leveraging HTML5 technologies and giving a fresh, modern feel to the output web page / presentation slides.

##Usage##
* Download and open docbook2html5.jar file. 
* Select the input files (Open file). 
* Choose transformation mode (Docbook or Docbook Slides)
* and hit the Tranform button (It may take a couple of minutes for the process to complete).

##Team##
This was a course project developed by these awesome people:

* Jakub Hamerník ()
* Michal Obročník (mbixby)
* Lubomír Šálek ()
* Petr Zvoníček ()

#For developers#
* /Source/output-development is used for frontend development. Assets are then minimized, exported into /Source/javascript_and_stylesheets.xml and inserted into xsl-transformed HTML for end-user convenience. See 'Minifying js/css/images' in Useful links.


##Todo##
* consolidate output assets for docbook slides (images, css, js) into a single companion file (use Base64 for images when possible (<32KB))
* bug?: when transforming files with the Java tool, it sends some http (:80) requests

##Useful Links##
* [http://wiki.docbook.org/DocBookXslStylesheets Main DocBook XSL page on Wiki]
* [http://docbook.svn.sourceforge.net/viewvc/docbook/trunk/xsl/?sortby=file DocBook XSL Repository]
* [http://docbook.svn.sourceforge.net/viewvc/docbook/trunk/xsl/xhtml/?sortby=file HTML to XHTML 1.1]
* [http://docbook.svn.sourceforge.net/viewvc/docbook/trunk/xsl/README?revision=9005&view=markup&sortby=date README file for DocBook XSL Stylesheets]
* DocBook Project (supporting development) - [http://docbook.sourceforge.net/ Home]
* DocBook Project – [http://sourceforge.net/projects/docbook/files/docbook-xsl/ XSL]
microformats: http://devcheatsheet.com/tag/microformats/

* Minifying js/css/images: https://github.com/cjohansen/juicer and http://cjohansen.no/en/ruby/juicer_a_css_and_javascript_packaging_tool

##Contact##
Feel free to contact us via GitHub messages.