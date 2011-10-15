window.addEvent('domready', function() {

	
	/*
	Credits:
			Regex from [url=http://www.netlobo.com/url_query_string_javascript.html]http://www.netlobo.com/url_query_string_javascript.html[/url]
			Function by Jens Anders Bakke, webfreak.no
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
	
	
	
	var DocbookPresentation = new Class({
 
		Binds: ['hideAllSlides', 'slides', 'moveToPreviousSlide', 'moveToNextSlide', 'currentSlide', 'slideWidth', 'handleResizedWindow', 'slidesTitle'],
	
	    initialize: function(){
	        this.slides = $$('div.titlepage, div.foil, div.foilgroup');
			this.slidesTitle = $$('h1.title')[0].get('text');
			this.initHTMLBodyForSlides();
			this.hideAllSlides();
			this.show(this.currentSlide);
	    },
 

	    initHTMLBodyForSlides: function(){
        	document.body.addClass('slidesBody');

			// Load CSS assets
			Asset.css('css/db-slides.css');
			
			// Create and init navigation elements
			var navigation = Elements.from('<div class="leftNav"><a id="previousButton" class="btn" href="#">Previous Slide</a><a id="togglePanelButton" class="btn" href="#">Toggle Panel</a></div>\n<div class="rightNav"><a id="nextButton" class="btn" href="#">Next Slide</a><div id="pageNumber">0/0</div></div>');
			navigation.inject(document.body);
			
			$('previousButton').addEvent('click', this.moveToPreviousSlide);
			$('nextButton').addEvent('click', this.moveToNextSlide);
			
			window.addEvent('keydown:keys(left)', this.moveToPreviousSlide);
			window.addEvent('keydown:keys(right)', this.moveToNextSlide);
			
			
			// Move logotypes to separate slide
			$$('div.logotypes').dispose();
			
			
			// If the slides were once loaded before, find out what page should it restore to
			var anchorInt = $get("#");
			if (anchorInt != "" && anchorInt > 0 && anchorInt <= this.slides.length) {
				this.currentSlide = anchorInt-1;
			} else {
				// TODO
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
			//window.addEvent('keydown:keys(left)', this.moveToPreviousSlide);
			//window.addEvent('keydown:keys(right)', this.moveToNextSlide);
			
			if (i<1) {
				$('previousButton').setStyle('display','none');
				//window.removeEvent('keydown:keys(left)', this.moveToPreviousSlide);
			} else if (i == this.slides.length - 1) {
				$('nextButton').setStyle('display','none');
				//window.removeEvent('keydown:keys(right)', this.moveToNextSlide);
			}
			
			// Set the page number value under the 'next slide' button
			$('pageNumber').set('html', (this.currentSlide+1) + '/' + this.slides.length)
			
			// Save the current slide to local storage
			// TODO
			// $.jStorage.set(this.slidesTitle, String.from(this.currentSlide));
			
			// Change the anchor in URL
			var url = window.location.toString();
			url = url.split("#")[0];
			window.location = url + "#" + (this.currentSlide+1);
			
	    },

		moveToPreviousSlide: function(){
			var el = this.slides[this.currentSlide-1];
			var previousSlide = this.slides[this.currentSlide];
			
			//this.hideAllSlides();
			//this.show(this.currentSlide-1);
			
			var fx = new Fx.Tween(el, {
			    duration: 400
			});
			var fx2 = new Fx.Tween(el, {
			    duration: 400,
			    transition: Fx.Transitions.Quart.easeIn
			});
			var fx3 = new Fx.Tween(previousSlide, {
			    duration: 400,
			    transition: Fx.Transitions.Quart.easeIn
			});
			
	        this.show(this.currentSlide - 1);
	
			var leftPos = -window.getSize().x;
			el.setStyles({
				'width': this.slideWidth,
				'top': 0,
				'left': leftPos,
				'position': 'absolute',
				'z-index': 10
			});
			
			fx.start('left', leftPos, 0).chain(function(){
				this.hideAllSlides();
				this.show(this.currentSlide);
			});
			
			fx2.start('opacity', 1, 1).chain(function(){
			    el.setStyles({
					'position': 'relative',
					'z-index': 0,
					'top': 0,
					'width': 'auto'
				});
						this.hideAllSlides();
						this.show(this.currentSlide);
			});
			
			fx3.start('opacity', 0.7).chain(function(){
				previousSlide.setStyle('opacity', 1);
					this.hideAllSlides();
					this.show(this.currentSlide);
			});
	    },

		moveToNextSlide: function(){
			var el = this.slides[this.currentSlide];
			
			var fx = new Fx.Tween(el, {
			    duration: 400
			});
			var fx2 = new Fx.Tween(el, {
			    duration: 400,
			    transition: Fx.Transitions.Quad.easeOut
			});
			
	        this.show(this.currentSlide + 1);
	
			this.slideWidth = el.getComputedSize().width;
			
			el.setStyles({
				'width': this.slideWidth,
				'top': 0,
				'position': 'absolute',
				'z-index': 10
			});
			
			var tempMainObj = this;
			fx2.start('left', 0, -window.getSize().x).chain(function(){
			    el.setStyles({
					'display': 'none',
					'left': 0
				});
				//tempMainObj.hideAllSlides();
				//tempMainObj.show(this.currentSlide);
			});
			
			fx.start('opacity', 1, 0.8).chain(function(){
			    el.setStyles({
					'position': 'relative',
					'z-index': 2,
					'top': 0,
					'width': 'auto',
					'opacity': 1
				});
			});
	    }
 
	});


	if ($$('.foil').length > 0) { // Determine if the document is of DB Slides format
		new DocbookPresentation();
	}


});