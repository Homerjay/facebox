var ProtoFacebox = Class.create({
	initialize: function(options) {
		var defaults = {
			width		 :380,
			opacity      : 0,
			overlay      : false,
			loadingImage : 'loading.gif',
			imageTypes   : [ 'png', 'jpg', 'jpeg', 'gif' ],
			headerHtml	 : " \
					<div id='protofacebox_header'> \
		            <span id='text_header'></span> \
		            </div> \
		           ",
		    closeHtml    :" \
		    		<div id='protofacebox_button_style'> \
		    		<span id='button_text'>Signaler un spam</span> \
		    		</div> \
		    		<div id='protofacebox_close_style'> \
		    		<span id='close_text'>Annuler</span> \
		    		</div>",
			faceboxHtml  : '\
	<div id="protofacebox" style="display:none;"> \
      <div class="popup"> \
            <div id="popup_middle"> \
              <!--<div class="b"></div>--> \
		      <div class="top_bar"> \
		          <div class="tl"></div>\
		          <div class="b"></div> \
		          <div class="tr"></div> \
		      </div>\
		      <div class="side_bar"> \
				  <div id="protofacebox_body"> \
		            <div id="border_block"> \
				        <div id="protofacebox_content"> \
				        </div> \
				        <div class="footer_bar"> \
						    <div class="footer"> \
						    	<div id="buttons"> \
						      <a href="#" id="protofacebox_close"> \
						      </a> \
						      </div> \
						      <div id="buttons"> \
						      <a href="#" id="protofacebox_close"> \
						      </a> \
						      </div> \
						    </div> \
						</div> \
				    </div> \
				  </div> \
              </div> \
              <div id="foot_bar"> \
              	<div class="bl"></div><div class="b"></div><div class="br"></div> \
              </div> \
              <!--<div class="b"></div>--> \
            </div> \
      </div> \
    </div>'	
			
			
			/*'\
	<div id="protofacebox" style="display:none;"> \
      <div class="popup"> \
        <table id="protofacebox_table"> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td id="protofacebox_body"> \
                <div id="border_block"> \
		            <div id="protofacebox_content"> \
		            </div> \
		            <div class="footer"> \
		              <div id="buttons">\
		              <a href="#" id="protofacebox_close"> \
		              </a> \
		              </div> \
		            </div> \
		        </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
        </table> \
      </div> \
    </div>'*/
    };

		this.settings = Object.extend(defaults, options || {});
		this.init();
		if (this.settings) {
			this.loading();
			if (this.settings.ajax) this.fillFaceboxFromAjax(this.settings.ajax);
		    else if (this.settings.image) this.fillFaceboxFromImage(this.settings.image);
		    else if (this.settings.callback && Object.isFunction(this.settings.callback)) this.settings.callback.call(this);
		    else if (this.settings.div) this.reveal($(this.settings.div));
		    else if (this.settings.markup) this.reveal(this.settings.markup);
			else console.log("Data type unknown. Can't display anything");
			this.resetHeader();
		}
	},

	loading: function() {
		if ($('protofacebox_loading') != null) return true;
		this.showOverlay();
		$('protofacebox_content').update();
		$('protofacebox_content').insert('<div id="protofacebox_loading"><img src="' + this.settings.loadingImage + '" /></div>');
		var top = getPageScroll()[1] + (getPageHeight() / 10);
		var left = document.width / 2 - 205;
		$('protofacebox').setStyle({
			'top':	top + 'px',
			'left':	left + 'px'
		}).show();
		
		// $(document).bind('keydown.facebox', function(e) {
		// 	if (e.keyCode == 27) $.facebox.close()
		// 	return true
		// })
		$(document).fire('ProtoFacebox:loading');
	},
	
	
	reveal: function(data) {
		$(document).fire('ProtoFacebox:beforeReveal');
		if (this.settings.class) $('protofacebox_content').addClassName(this.settings.class);
		$('protofacebox_content').insert(data);
		
		if ($('protofacebox_loading'))	$('protofacebox_loading').remove();
		$('protofacebox_body').appear();
		$('protofacebox').setStyle({left: document.width / 2 - ($('protofacebox').getDimensions().width / 2)});
		
		$(document).fire('ProtoFacebox:reveal')
		$(document).fire('ProtoFacebox:afterReveal');
	},
	
	close: function() {
		// $(document).unbind('keydown.facebox')
	    $('protofacebox').fade();
     	this.hideOverlay();
		if ($('protofacebox_loading') != null) $('protofacebox_loading').remove();
		if (this.settings.class) $('protofacebox_content').removeClassName(this.settings.class);
		//$('protofacebox_content').remove
		setTimeout("$('protofacebox').setStyle({visibility:'hidden'})", 600);
		if (this.settings.title) setTimeout("$('text_header').update()",600);
		$(document).fire('ProtoFacebox:close');
      	return false;
	},
	
	init: function(settings) {
		if (this.settings.inited) return true;
    	else this.settings.inited = true;

    	$(document).fire('ProtoFacebox:init');

    	var imageTypes = this.settings.imageTypes.join('|');
    	this.settings.imageTypesRegexp = new RegExp('\.(' + imageTypes + ')$', 'i');

    	if (settings) 
			extend(this.settings, settings);
   		$$('body')[0].insert(this.settings.faceboxHtml);

    	var preload = [ new Image(), new Image() ];
    	preload[0].src = this.settings.closeImage;
    	preload[1].src = this.settings.loadingImage;

    	$$('#protofacebox .b:first', '#protofacebox .bl', '#protofacebox .br', '#protofacebox .tl', '#protofacebox .tr').each(function(e) {
      		preload.push(new Image());
      		preload.slice(-1).src = e.getStyle('background-image').replace(/url\((.+)\)/, '$1');
    	})
		

		this.showCloseButton();
    	$('protofacebox_close').observe('click', this.close.bind(this));
    	
  	},

  	skipOverlay: function() {
    	return this.settings.overlay == false || this.settings.opacity === null
  	},

  	showOverlay: function() {
    	if (this.skipOverlay()) return;
    	if ($('protofacebox_overlay') == null)
      		$$("body")[0].insert('<div id="protofacebox_overlay" class="protofacebox_hide"></div>');

		$('protofacebox_overlay').hide();
    	$('protofacebox_overlay').addClassName("protofacebox_overlayBG")
			.setOpacity(this.settings.opacity)
			.observe('click', function() { $(document).fire('ProtoFacebox:close') })
			.appear({to: this.settings.opacity, duration: 5});
    	return false;
	},
	
	hideOverlay: function() {
		if (this.skipOverlay()) return;

    	$('protofacebox_overlay').fade({duration: 0.2});
   		$("protofacebox_overlay").removeClassName("protofacebox_overlayBG");
   		$("protofacebox_overlay").addClassName("protofacebox_hide");
   		$("protofacebox_overlay").remove();

    	return false;
  	},

  	fillFaceboxFromAjax: function(url) {
		new Ajax.Request(url, {
		  method: 'get',
		  onSuccess: function(transport) {
			this.reveal(transport.responseText);
		  }.bind(this)
		});

  	},

  	fillFaceboxFromImage: function(href) {
    	var image = new Image();
		var f = function() {
      		this.reveal('<div class="image"><img src="' + image.src + '" /></div>');
    	}
    	image.onload = f.bind(this)
    	image.src = href;
  	},

	resetHeader: function(){
		if ($('protofacebox_header')) $('protofacebox_header').remove();		
		if (this.settings.title){ 
			if (this.settings.title != ""){
				$('border_block').insert({before: this.settings.headerHtml});
				console.log($('protofacebox_content').getDimensions().width);
				if ($('protofacebox_content').getDimensions().width > 390){
					setTimeout("$('protofacebox_header').setStyle({width: ($('protofacebox_content').getDimensions().width) - 10 + 'px' })", 500);
				}
				$('protofacebox_content').setStyle({borderTop:'none'});
				$('text_header').insert(this.settings.title);
			}
			else{
				if ($('protofacebox_header')) $('protofacebox_header').remove();
				$('protofacebox_content').setStyle({borderTop:'solid thin #555555'});
			}
		}
		else{
			if ($('protofacebox_header')) $('protofacebox_header').remove();
			$('protofacebox_content').setStyle({borderTop:'solid thin #555555'});		
		}	
		setTimeout("$('protofacebox').setStyle({visibility:'visible'})", 550);
	},

	
	showCloseButton: function(){
		if (this.settings.closeImage){
			$('protofacebox_close').update("<img src='" + this.settings.closeImage + "' title='close' id='protofacebox_close_image' class='close_image'/>");
		}
		else{
			$('protofacebox_close').update(this.settings.closeHtml);
		}
	},
});




// getPageScroll() by quirksmode.com
function getPageScroll() {
  	var xScroll, yScroll;

  	if (self.pageYOffset) {
    	yScroll = self.pageYOffset;
    	xScroll = self.pageXOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
    	yScroll = document.documentElement.scrollTop;
    	xScroll = document.documentElement.scrollLeft;
  	} else if (document.body) {// all other Explorers
		yScroll = document.body.scrollTop;
    	xScroll = document.body.scrollLeft;
  	}

  	return new Array(xScroll,yScroll);
}

// Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
  	var windowHeight;

  	if (self.innerHeight) {	// all except Explorer
    	windowHeight = self.innerHeight;
  	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
    	windowHeight = document.documentElement.clientHeight;
  	} else if (document.body) { // other Explorers
    	windowHeight = document.body.clientHeight;
  	}

  	return windowHeight;
}
