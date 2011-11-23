#
# Main.js
#
# @depend modernizr.js
# @depend mt-core.js
# @depend mt-more.js
#

window.addEvent "domready", ->
  
  
  # URL parser
  #
  # Regex from [url=http://www.netlobo.com/url_query_string_javascript.html]http://www.netlobo.com/url_query_string_javascript.html[/url]
  # Function by Jens Anders Bakke, webfreak.no
  #
  $get = (key, url) ->
    url = location.href  if arguments.length < 2
    if arguments.length > 0 and key isnt ""
      if key is "#"
        regex = new RegExp("[#]([^$]*)")
      else if key is "?"
        regex = new RegExp("[?]([^#$]*)")
      else
        regex = new RegExp("[?&]" + key + "=([^&#]*)")
      results = regex.exec(url)
      (if (not (results?)) then "" else results[1])
    else
      url = url.split("?")
      results = {}
      if url.length > 1
        url = url[1].split("#")
        results["hash"] = url[1]  if url.length > 1
        url[0].split("&").each (item, index) ->
          item = item.split("=")
          results[item[0]] = item[1]
      results
      
      
  # DocbookPresentation Class
  #
  # Makes a butterfly from caterpillar.
  # In other words, transforms a raw document in Docbook Slides format (made
  # by Docbook2html5 tool) into an elegant dynamic presentation
  #
  DocbookPresentation = new Class(
    Binds: [ "hideAllSlides", "slides", "moveToPreviousSlide", "moveToNextSlide", "currentSlide", "slideWidth", "handleResizedWindow", "slidesTitle", "toggleNavBar" ]
    initialize: ->
      @slides = $$("div.titlepage, div.foil, div.foilgroup")
      @slidesTitle = $$("h1.title")[0].get("text")
      @initHTMLBodyForSlides()
      @replaceOriginalSlideToSlideLinks()
      @hideAllSlides()
      @show @currentSlide

    initHTMLBodyForSlides: ->
      document.body.addClass "slidesBody"
      container = new Element("div#mainContainer")
      @mainContainer = container
      container.adopt document.body.getChildren()
      container.inject document.body
      @initNavigationButtons()
      @initNavBar()
      $$("div.logotypes").dispose()
      anchorInt = $get("#")
      if anchorInt isnt "" and anchorInt > 0 and anchorInt <= @slides.length
        @currentSlide = anchorInt - 1
      else
        @currentSlide = 0
      @handleResizedWindow()
      timer = undefined
      temp = this
      window.addEvent "resize", ->
        $clear timer
        timer = (->
          temp.handleResizedWindow()
        ).delay(30)

    initNavBar: ->
      that = this
      navBarList = new Element("ul").inject(document.body)
      @navBar = new Element("div#navBar").wraps(navBarList)
      @isNavBarVisible = false
      @slides.each (slide, index) ->
        link = new Element("a").inject(navBarList)
        new Element("li").wraps link
        link.set "text", slide.getElement("h1.title").get("text")
        link.set "href", "#" + (index + 1)
        link.addEvent "click", (e) ->
          e.stop()
          that.hideAllSlides()
          that.show index

        new Element("div.separator").inject link.getParent(), "after"  if slide.getNext().hasClass("foilgroup")
        new Element("strong").wraps link  if slide.hasClass("foilgroup")

    toggleNavBar: ->
      that = this
      [ @navBar, @mainContainer, $$("div.leftNav")[0] ].each (el) ->
        el.toggleClass "navBarOpened"
        el.morph ".navBarOpened"
        el.morph ".navBarClosed"
        that.isNavBarVisible = not that.isNavBarVisible

    initNavigationButtons: ->
      navigation = Elements.from("<div class=\"leftNav\"><a id=\"previousButton\" class=\"btn\" href=\"#\">Previous Slide</a><a id=\"togglePanelButton\" class=\"btn\" href=\"#\">Toggle Panel</a></div>\n<div class=\"rightNav\"><a id=\"nextButton\" class=\"btn\" href=\"#\">Next Slide</a><div id=\"pageNumber\">0/0</div></div>")
      navigation.inject @mainContainer
      $("previousButton").addEvent "click", @moveToPreviousSlide
      $("nextButton").addEvent "click", @moveToNextSlide
      $("togglePanelButton").addEvent "click", @toggleNavBar
      window.addEvent "keydown:keys(left)", @moveToPreviousSlide
      window.addEvent "keydown:keys(right)", @moveToNextSlide

    replaceOriginalSlideToSlideLinks: ->
      links = $$("a[href^=foil]")
      foilSlides = $$("div.foil")
      that = this
      links.each (link) ->
        hrefString = link.get("href")
        if hrefString.contains("foil")
          hrefString = hrefString.replace(/[a-zA-Z]*/g, "")
          foilNo = hrefString.toInt()
          slide = foilSlides[foilNo - 1]
          slideIndex = that.slides.indexOf(slide)
          slideIndex = (if (slideIndex > -1) then slideIndex else 1)
          link.set "href", "#" + (slideIndex + 1)
          link.addEvent "click", (e) ->
            e.stop()
            that.hideAllSlides()
            that.show slideIndex

    handleResizedWindow: ->
      @slides.setStyle "min-height", window.getSize().y - 80
      $$("div.leftNav, div.rightNav").setStyle "top", window.getSize().y / 2 - 40

    hideAllSlides: ->
      @slides.setStyle "display", "none"

    show: (i) ->
      @slides[i].setStyle "display", "block"
      @currentSlide = i
      $("previousButton").setStyle "display", "block"
      $("nextButton").setStyle "display", "block"
      if i < 1
        $("previousButton").setStyle "display", "none"
      else $("nextButton").setStyle "display", "none"  if i is @slides.length - 1
      $("pageNumber").set "html", (@currentSlide + 1) + "/" + @slides.length
      url = window.location.toString()
      url = url.split("#")[0]
      window.location = url + "#" + (@currentSlide + 1)
      @slides[i]

    moveToPreviousSlide: ->
      that = this
      el = @slides[@currentSlide - 1]
      previousSlide = @slides[@currentSlide]
      durationOfAnimation = 400
      fx = new Fx.Tween(el,
        duration: durationOfAnimation
        transition: Fx.Transitions.Quad.easeOut
      )
      fx2 = new Fx.Tween(el,
        duration: durationOfAnimation
        transition: Fx.Transitions.Quart.easeIn
      )
      fx3 = new Fx.Tween(previousSlide,
        duration: durationOfAnimation
        transition: Fx.Transitions.Quart.easeIn
      )
      @show @currentSlide - 1
      leftPositionToTweenTo = el.getComputedSize().computedLeft + 17
      el.setStyles
        width: el.getComputedSize().width
        top: 0
        left: -window.getSize().x
        position: "absolute"
        "z-index": 10

      revertStyles = ->
        el.setStyles
          position: "relative"
          "z-index": 0
          top: 0
          left: 0

      fx.start("left", el.getStyle("left"), leftPositionToTweenTo).chain ->
        that.hideAllSlides()
        that.show that.currentSlide
        revertStyles()

      fx2.start("opacity", 1, 1).chain ->
        that.hideAllSlides()
        that.show that.currentSlide
        revertStyles()

    moveToNextSlide: ->
      el = @slides[@currentSlide]
      durationOfAnimation = 500
      fx = new Fx.Tween(el,
        duration: durationOfAnimation
      )
      fx2 = new Fx.Tween(el,
        duration: durationOfAnimation
        transition: Fx.Transitions.Quad.easeInOut
      )
      newSlide = @show(@currentSlide + 1)
      el.setStyles
        width: el.getComputedSize().width
        left: el.getComputedSize().computedLeft + 17
        top: 0
        position: "absolute"
        "z-index": 10

      revertStyles = ->
        el.setStyles
          position: "relative"
          "z-index": 2
          top: 0
          left: 0
          opacity: 1

      fx2.start("left", el.getStyle("left"), -window.getSize().x).chain ->
        that.hideAllSlides()
        that.show that.currentSlide
        revertStyles()

      fx.start("opacity", 1, 0.8).chain ->
        that.hideAllSlides()
        that.show that.currentSlide
        revertStyles()
  )
  DocbookPresentation.isApplicableHere = ->
    $$(".foil").length > 0

  new DocbookPresentation()  if DocbookPresentation.isApplicableHere()