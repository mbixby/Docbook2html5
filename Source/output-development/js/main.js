/**
 * Main.js
 *
 * @depend modernizr.js
 * @depend mt-core.js
 * @depend mt-more.js
 */


window.addEvent('domready', function() {


  /* URL parser
   *
   * Regex from [url=http://www.netlobo.com/url_query_string_javascript.html]http://www.netlobo.com/url_query_string_javascript.html[/url]
   * Function by Jens Anders Bakke, webfreak.no
   */
  function $get(key,url){
    if(arguments.length < 2) url =location.href;
    if(arguments.length > 0 && key != ""){
      if(key == "#"){
        var regex = new RegExp("[#]([^$]*)");
      } else if(key == "?"){
        var regex = new RegExp("[?]([^#$]*)");
      } else {
        var regex = new RegExp("[?&]"+key+"=([^&#]*)");
      }
      var results = regex.exec(url);
      return (results == null )? "" : results[1];
    } else {
      url = url.split("?");
      var results = {};
      if(url.length > 1){
        url = url[1].split("#");
        if(url.length > 1) results["hash"] = url[1];
        url[0].split("&").each(function(item,index){
          item = item.split("=");
          results[item[0]] = item[1];
        });
      }
      return results;
    }
  }


  /* DocbookPresentation Class
   *
   * Makes a butterfly from caterpillar.
   * In other words, transforms a raw document in Docbook Slides format (made
   * by Docbook2html5 tool) into an elegant dynamic presentation
   */
  var DocbookPresentation = new Class({

    Binds: ['hideAllSlides', 'slides', 'moveToPreviousSlide', 'moveToNextSlide', 'currentSlide', 'slideWidth', 'handleResizedWindow', 'slidesTitle', 'toggleNavBar'],

    initialize: function(){
      this.slides = $$('div.titlepage, div.foil, div.foilgroup');
      this.slidesTitle = $$('h1.title')[0].get('text');
      this.initHTMLBodyForSlides();
      this.replaceOriginalSlideToSlideLinks();

      this.hideAllSlides();
      this.show(this.currentSlide);
    },


    initHTMLBodyForSlides: function(){
      document.body.addClass('slidesBody');

      // Wrap html in div container (this activates styles in db-slides.css (minified into base.min.css))
      var container = new Element('div#mainContainer');
      this.mainContainer = container
      container.adopt(document.body.getChildren());
      container.inject(document.body);

      // Create and init prev/next buttons and navBar
      this.initNavigationButtons();
      this.initNavBar();

      // Move logotypes to separate slide
      // TODO
      $$('div.logotypes').dispose();

      // If the slides were once loaded before, find out what page should it restore to
      // TODO
      var anchorInt = $get("#");
      if (anchorInt != "" && anchorInt > 0 && anchorInt <= this.slides.length) {
        this.currentSlide = anchorInt-1;
      } else {
        //this.currentSlide = ($.jStorage.get(this.slidesTitle, String.from(0))).toInt();
        this.currentSlide = 0;
      }

      // Fix CSS heights to accommodate for current window size
      this.handleResizedWindow();
      var timer;
      var temp = this;
      window.addEvent('resize', function(){
        $clear(timer);
        timer = (function(){
          temp.handleResizedWindow();
        }).delay(30);
      });
    },

    initNavBar: function(){
      var that = this;
      var navBarList = new Element('ul').inject(document.body)
      this.navBar = new Element('div#navBar').wraps(navBarList)
      this.isNavBarVisible = false;
      
      this.slides.each(function(slide, index){
        var link =  new Element('a').inject(navBarList)
        new Element('li').wraps(link)

        link.set('text', slide.getElement('h1.title').get('text') )
        link.set('href', '#' + (index + 1))
        link.addEvent('click', function(e){
          e.stop()
          that.hideAllSlides();
          that.show(index);
        });

        // If the slide is a sort of header slide, insert a separator above the link 
        if (slide.getNext().hasClass('foilgroup')) {
          new Element('div.separator').inject( link.getParent(), 'after' );
        }
        
        // Plus make the first link in the section bold (<strong>)  
        if (slide.hasClass('foilgroup')) {
          new Element('strong').wraps(link);
        }
        
      })
    },

    toggleNavBar: function(){
      that = this;
      [this.navBar, this.mainContainer, $$('div.leftNav')[0]].each(function(el){
        //if (that.isNavBarVisible) 
        el.toggleClass('navBarOpened')
        //el.set('morph', {duration: 'long'});
        el.morph('.navBarOpened')
        el.morph('.navBarClosed')
        that.isNavBarVisible = !that.isNavBarVisible
      })
    },

    initNavigationButtons: function(){
      var navigation = Elements.from('<div class="leftNav"><a id="previousButton" class="btn" href="#">Previous Slide</a><a id="togglePanelButton" class="btn" href="#">Toggle Panel</a></div>\n<div class="rightNav"><a id="nextButton" class="btn" href="#">Next Slide</a><div id="pageNumber">0/0</div></div>');
      navigation.inject(this.mainContainer);

      $('previousButton').addEvent('click', this.moveToPreviousSlide);
      $('nextButton').addEvent('click', this.moveToNextSlide);
      $('togglePanelButton').addEvent('click', this.toggleNavBar);

      window.addEvent('keydown:keys(left)', this.moveToPreviousSlide);
      window.addEvent('keydown:keys(right)', this.moveToNextSlide);
    },

    replaceOriginalSlideToSlideLinks: function(){
      // Replace href="foil05.html" with corresponding anchor links (#5)
      var links = $$('a[href^=foil]');
      var foilSlides = $$('div.foil');
      var that = this;

      links.each(function(link){
        var hrefString = link.get('href');

        if (hrefString.contains('foil')) {
          hrefString = hrefString.replace(/[a-zA-Z]*/gi, "");
          var foilNo = hrefString.toInt();
          var slide = foilSlides[foilNo-1];

          // Get index in slides[] array
          var slideIndex = that.slides.indexOf(slide);
          slideIndex = (slideIndex > -1) ? slideIndex : 1;
          link.set('href', '#' + (slideIndex + 1));

          link.addEvent('click', function(e){
            e.stop()
            that.hideAllSlides();
            that.show(slideIndex);
          });
        }
      });
    },

    handleResizedWindow: function(){
      this.slides.setStyle('min-height', window.getSize().y - 80);
      $$('div.leftNav, div.rightNav').setStyle('top', window.getSize().y/2 - 40);
    },

    hideAllSlides: function(){
      this.slides.setStyle('display','none');
    },

    show: function(i){
      this.slides[i].setStyle('display','block');
      this.currentSlide = i;
      $('previousButton').setStyle('display','block');
      $('nextButton').setStyle('display','block');

      if (i<1) {
        $('previousButton').setStyle('display','none');
      } else if (i == this.slides.length - 1) {
        $('nextButton').setStyle('display','none');
      }

      // Set the page number value under the 'next slide' button
      $('pageNumber').set('html', (this.currentSlide+1) + '/' + this.slides.length)
      
      // TODO
      // Save the current slide to local storage
      // $.jStorage.set(this.slidesTitle, String.from(this.currentSlide));

      // Change slide number in the URL (#x)
      var url = window.location.toString();
      url = url.split("#")[0];
      window.location = url + "#" + (this.currentSlide+1);

      return this.slides[i];
    },

    moveToPreviousSlide: function(){
      var that = this;
      var el = this.slides[this.currentSlide-1];
      var previousSlide = this.slides[this.currentSlide];

      // Config effects
      var durationOfAnimation = 400
      var fx = new Fx.Tween(el, {
        duration: durationOfAnimation,
        transition: Fx.Transitions.Quad.easeOut
      });
      var fx2 = new Fx.Tween(el, {
        duration: durationOfAnimation,
        transition: Fx.Transitions.Quart.easeIn
      });
      var fx3 = new Fx.Tween(previousSlide, {
        duration: durationOfAnimation,
        transition: Fx.Transitions.Quart.easeIn
      });

      // Show the new slide
      this.show(this.currentSlide - 1);

      // Compute and init styles for the coming slide
      var leftPositionToTweenTo = el.getComputedSize().computedLeft + 17;
      el.setStyles({
        'width': el.getComputedSize().width,
        'top': 0,
        'left': -window.getSize().x, // move to the left
        'position': 'absolute',
        'z-index': 10
      });
      var revertStyles = function(){
        el.setStyles({
          'position': 'relative',
          'z-index': 0,
          'top': 0,
          'left': 0,
          //'width': 'auto',
        });
      }

      // Define fx1 - move the slide to the right and then change back the styles
      fx.start('left', el.getStyle('left'), leftPositionToTweenTo).chain(function(){
        that.hideAllSlides();
        that.show(that.currentSlide);
        revertStyles();
      });

      // Define fx3 - fade in the slide and then change back the styles
      fx2.start('opacity', 1, 1).chain(function(){
        that.hideAllSlides();
        that.show(that.currentSlide);
        revertStyles();
      });
    },

    moveToNextSlide: function(){
      var el = this.slides[this.currentSlide];

      // Config effects
      var durationOfAnimation = 500;
      var fx = new Fx.Tween(el, {
        duration: durationOfAnimation
      });
      var fx2 = new Fx.Tween(el, {
        duration: durationOfAnimation,
        transition: Fx.Transitions.Quad.easeInOut
      });

      // Show the new slide
      var newSlide = this.show(this.currentSlide + 1);

      // Compute and init styles for the leaving slide
      el.setStyles({
        'width': el.getComputedSize().width,
        'left': el.getComputedSize().computedLeft + 17,
        'top': 0,
        'position': 'absolute',
        'z-index': 10
      });
      var revertStyles = function(){
        el.setStyles({
          'position': 'relative',
          'z-index': 2,
          'top': 0,
          'left': 0,
          //'width': 'auto',
          'opacity': 1
        });
      }

      // Define fx1 - move the slide to left and then change back the styles
      fx2.start('left', el.getStyle('left'), -window.getSize().x).chain(function(){
        that.hideAllSlides();
        that.show(that.currentSlide);
        revertStyles()
      });

      // Define fx2 - slightly fade away the slide and then change back the styles
      fx.start('opacity', 1, 0.8).chain(function(){
        that.hideAllSlides();
        that.show(that.currentSlide);
        revertStyles()
      });
    }

  });
  
  /* Determines if the document is of DB Slides format */
  DocbookPresentation.isApplicableHere = function() {
    return $$('.foil').length > 0;
  }



  
  if (DocbookPresentation.isApplicableHere()) {
    new DocbookPresentation();
  }


});