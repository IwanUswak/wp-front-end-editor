(function(f){if(FrontEndEditor._loaded){return}FrontEndEditor._loaded=true;(function(){var g=false,h=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){};Class.extend=function(m){var l=this.prototype;g=true;var k=new this();g=false;for(var j in m){k[j]=(typeof m[j]=="function"&&typeof l[j]=="function"&&h.test(m[j]))?(function(n,o){return function(){var q=this._super;this._super=l[n];var p=o.apply(this,arguments);this._super=q;return p}})(j,m[j]):m[j]}function i(){if(!g&&this.init){this.init.apply(this,arguments)}}i.prototype=k;i.constructor=i;i.extend=arguments.callee;return i}})();var b={_event:false,_delayed:false,register:function(g,h){g.bind({click:b.click,dblclick:b.dblclick});g.dblclick(h)},click:function(g){if(b._delayed){return}if(!b.is_regular_link(f(g.target))){return}g.stopImmediatePropagation();g.preventDefault();if(b._event){return}b._event=g;setTimeout(b.resume,300)},is_regular_link:function(g){if(g.is("select, option, input, button")){return false}if(g.attr("onclick")){return false}var h=g.closest("a");if(!h.length){return false}if(h.attr("onclick")||!h.attr("href")||h.attr("href")=="#"){return false}return true},resume:function(){if(!b._event){return}var g=f(b._event.target);var i=f.Event("click");b._delayed=true;g.trigger(i);b._delayed=false;if(i.isDefaultPrevented()){return}var h=g.closest("a");if(h.attr("target")=="_blank"){window.open(h.attr("href"))}else{window.location.href=h.attr("href")}b._event=false},dblclick:function(g){g.stopPropagation();g.preventDefault();b._event=false}};function a(g){var h=f('<div class="fee-loading>').css("background-image","url("+FrontEndEditor.data.spinner+")").hide().prependTo(f("body"));this.show=function(){h.css({width:g.width(),height:g.height()}).css(g.offset()).show()};this.hide=function(){h.hide()}}function e(l,j,k){var i=0,h;function g(){i++;if(2==i){l(h)}}if(!k||e.cache[k]){g()}else{e.cache[k]=f("<script>").attr({type:"text/javascript",src:k,load:g}).prependTo("head")}f.post(FrontEndEditor.data.ajax_url,j,function(m){h=m;g()},"json")}e.cache=[];function c(i,g){var j=FrontEndEditor.data.nicedit;j.maxHeight=f(window).height()-50;var h=new nicEditor(j).panelInstance(i.attr("id"));g.form.find(".nicEdit-main").focus();return h.nicInstances[0]}var d={};d.base=Class.extend({dependency:null,init:function(h,j,i,k){var g=this;g.el=h;g.type=j;g.filter=i;g.data=k;b.register(g.el,f.proxy(g,"dblclick"))},create_input:null,content_to_input:null,content_from_input:null,content_to_front:null,ajax_get_handler:null,ajax_set_handler:null,ajax_args:function(h){var g=this;return f.extend(h,{action:"front-end-editor",nonce:FrontEndEditor.data.nonce,filter:g.filter,data:g.data})},ajax_get:function(){var g=this;var h=g.ajax_args({callback:"get"});e(f.proxy(g,"ajax_get_handler"),h,g.dependency)},ajax_set:function(h){var g=this;var i=g.ajax_args({callback:"save",content:h||g.content_from_input()});f.post(FrontEndEditor.data.ajax_url,i,f.proxy(g,"ajax_set_handler"),"json")}});d.image_base=d.base.extend({button_text:FrontEndEditor.data.image?FrontEndEditor.data.image.change:null,dblclick:function(){var g=this;tb_show(FrontEndEditor.data.image.change,FrontEndEditor.data.admin_url+"/media-upload.php?post_id=0&type=image&TB_iframe=true&width=640&editable_image=1");f("#TB_closeWindowButton img").attr("src",FrontEndEditor.data.image.tb_close);f("#TB_iframeContent").load(f.proxy(g,"replace_button"))},replace_button:function(i){var g=this,h=f(i.target).contents();h.delegate(".media-item","hover",function(){var j=f(this);if(j.data("fee_altered")){return}var k=f('<a href="#" class="button">').text(g.button_text).click(function(l){g.ajax_set(g.content_from_input(j))});j.find(":submit, #go_button").remove();j.find(".del-link").before(k);j.data("fee_altered",true)})},content_from_input:function(g){var h;h=g.find(".urlfile");if(h.length){return h.attr("title")}h=g.find("#embed-src");if(h.length){return h.val()}h=g.find("#src");if(h.length){return h.val()}return false}});d.image_rich=d.image_base.extend({button_text:FrontEndEditor.data.image?FrontEndEditor.data.image.insert:null,init:function(g){this.ne=g;this.dblclick()},ajax_set:function(g){this.ne.nicCommand("insertImage",g);tb_remove()}});d.image=d.image_base.extend({dblclick:function(h){var g=this;g._super(h);f('<a id="fee-img-revert" href="#">').text(FrontEndEditor.data.image.revert).click(function(i){g.ajax_set(-1)}).insertAfter("#TB_ajaxWindowTitle")},ajax_set_handler:function(h){var g=this;if(h==-1){window.location.reload(true)}else{g.el.find("img").attr("src",h);tb_remove()}}});d.thumbnail=d.image.extend({replace_button:function(i){var g=this;var h=f(i.target).contents();h.find("#tab-type_url").remove();g._super(i)},content_from_input:function(g){return g.attr("id").replace("media-item-","")}});d.input=d.base.extend({input_tag:'<input type="text">',init:function(i,j,h,k){var g=this;g._super(i,j,h,k);g.overlay=new a(g.el)},create_input:function(){var g=this;g.input=f(g.input_tag).attr({id:"fee-"+new Date().getTime(),"class":"fee-form-content"});g.input.prependTo(g.form)},content_to_input:function(h){var g=this;g.input.val(h);g.form.trigger("ready.fee",[g.data])},content_from_input:function(){var g=this;return g.input.val()},content_to_front:function(h){var g=this;g.el.html(h);g.form.trigger("saved.fee",[g.data])},ajax_get:function(){var g=this;g.overlay.show();g.create_input();g._super()},ajax_set:function(){var g=this;g.overlay.show();g._super()},ajax_get_handler:function(h){var g=this;var i=g.error_handler(h);if(!i){return}g.el.hide();i.after(g.form);g.content_to_input(h.content);g.input.focus()},ajax_set_handler:function(h){var g=this;var i=g.error_handler(h);if(!i){return}g.content_to_front(h.content);g.el.show()},error_handler:function(h){var g=this;g.overlay.hide();var k=g.el.parents("a"),i=k.length?k:g.el;if(h.error){var j=f('<div class="fee-error">');j.append(f('<span class="fee-message">').html(h.error)).append(f('<span class="fee-dismiss">x</span>').click(function(){j.remove()}));i.before(j);return false}return i},dblclick:function(h){var g=this;g.save_button=f("<button>").addClass("fee-form-save").text(FrontEndEditor.data.save_text).click(f.proxy(g,"form_submit"));g.cancel_button=f("<button>").addClass("fee-form-cancel").text(FrontEndEditor.data.cancel_text).click(f.proxy(g,"form_remove"));g.form=(g.type.indexOf("input")>=0)?f("<span>"):f("<div>");g.form.addClass("fee-form").addClass("fee-type-"+g.type).addClass("fee-filter-"+g.filter).append(g.save_button).append(g.cancel_button);g.form.bind("keypress",f.proxy(g,"keypress"));g.ajax_get()},form_remove:function(h){var g=this;g.remove_form(false);h.stopPropagation();h.preventDefault()},form_submit:function(h){var g=this;g.ajax_set();g.remove_form(true);h.stopPropagation();h.preventDefault()},remove_form:function(g){var h=this;h.form.remove();h.el.show();if(true===g){h.overlay.show()}},keypress:function(j){var g=this;var i={ENTER:13,ESCAPE:27};var h=(j.keyCode||j.which||j.charCode||0);if(h==i.ENTER&&"input"==g.type){g.save_button.click()}if(h==i.ESCAPE){g.cancel_button.click()}}});d.terminput=d.input.extend({dependency:FrontEndEditor.data.suggest?FrontEndEditor.data.suggest.src:null,content_to_input:function(h){var g=this;g._super(h);g.input.suggest(FrontEndEditor.data.ajax_url+"?action=ajax-tag-search&tax="+g.data.taxonomy,{multiple:true,resultsClass:"fee-suggest-results",selectClass:"fee-suggest-over",matchClass:"fee-suggest-match"})}});d.checkbox=d.input.extend({input_tag:'<input type="checkbox">',content_to_input:function(h){var g=this;h=h?"checked":"";g.input.attr("checked",h)},content_from_input:function(){var g=this;return 0+g.input.is(":checked")},content_to_front:function(){var g=this,h=g.data.values[g.content_from_input()];g.el.html(h)}});d.select=d.input.extend({input_tag:"<select>",content_to_input:function(h){var g=this;f.each(g.data.values,function(i,k){var j=f("<option>").attr({html:i,value:i,selected:(h==i)?"selected":""}).html(k);g.input.append(j)})},content_from_input:function(){var g=this;return g.input.find(":selected").val()}});d.textarea=d.input.extend({input_tag:'<textarea rows="10">'});d.rich=d.textarea.extend({dependency:FrontEndEditor.data.nicedit?FrontEndEditor.data.nicedit.src:null,content_to_input:function(h){var g=this;g._super(h);g.editor=c(g.input,g)},content_from_input:function(){var g=this;return g.pre_wpautop(g.input.val())},pre_wpautop:function(h){var i,g;h=h.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g,function(j){j=j.replace(/<br ?\/?>[\r\n]*/g,"<wp_temp>");return j.replace(/<\/?p( [^>]*)?>[\r\n]*/g,"<wp_temp>")});i="blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|div|h[1-6]|p|fieldset";h=h.replace(new RegExp("\\s*</("+i+")>\\s*","g"),"</$1>\n");h=h.replace(new RegExp("\\s*<(("+i+")[^>]*)>","g"),"\n<$1>");h=h.replace(/(<p [^>]+>.*?)<\/p>/g,"$1</p#>");h=h.replace(/<div([^>]*)>\s*<p>/gi,"<div$1>\n\n");h=h.replace(/\s*<p>/gi,"");h=h.replace(/\s*<\/p>\s*/gi,"\n\n");h=h.replace(/\n[\s\u00a0]+\n/g,"\n\n");h=h.replace(/\s*<br ?\/?>\s*/gi,"\n");h=h.replace(/\s*<div/g,"\n<div");h=h.replace(/<\/div>\s*/g,"</div>\n");h=h.replace(/\s*\[caption([^\[]+)\[\/caption\]\s*/gi,"\n\n[caption$1[/caption]\n\n");h=h.replace(/caption\]\n\n+\[caption/g,"caption]\n\n[caption");g="blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|h[1-6]|pre|fieldset";h=h.replace(new RegExp("\\s*<(("+g+") ?[^>]*)\\s*>","g"),"\n<$1>");h=h.replace(new RegExp("\\s*</("+g+")>\\s*","g"),"</$1>\n");h=h.replace(/<li([^>]*)>/g,"\t<li$1>");if(h.indexOf("<object")!=-1){h=h.replace(/<object[\s\S]+?<\/object>/g,function(j){return j.replace(/[\r\n]+/g,"")})}h=h.replace(/<\/p#>/g,"</p>\n");h=h.replace(/\s*(<p [^>]+>[\s\S]*?<\/p>)/g,"\n$1");h=h.replace(/^\s+/,"");h=h.replace(/[\s\u00a0]+$/,"");h=h.replace(/<wp_temp>/g,"\n");return h},ajax_set:function(){var g=this;g.editor.saveContent();g._super()}});d.widget=d.textarea.extend({create_input:function(){},ajax_get:function(){var g=this;g.rich_edit=(0==g.data.widget_id.indexOf("text-")&&FrontEndEditor.data.nicedit);if(g.rich_edit){g.dependency=FrontEndEditor.data.nicedit.src}g._super()},content_to_input:function(h){var g=this;g.input=f(h);g.form.prepend(h);if(g.rich_edit){g.editor=c(g.form.find("textarea"),g)}},content_from_input:function(){return""},ajax_args:function(h){var g=this;h=g._super(h);if("get"==h.callback){return h}if(g.rich_edit){g.editor.saveContent()}var i=g.form.find(":input").serializeArray();f.each(h,function(j,k){i.push({name:j,value:k})});f.each(h.data,function(j,k){i.push({name:"data["+j+"]",value:k})});return i}});FrontEndEditor.fieldTypes=d;f(document).ready(function(i){function g(l){var n={};for(var k=0;k<l.attributes.length;k++){var j=l.attributes.item(k);if(j.specified&&0==j.name.indexOf("data-")){var m=j.value;try{m=i.parseJSON(m)}catch(o){}if(null===m){m=""}n[j.name.substr(5)]=m}}return n}i.each(FrontEndEditor.data.fields,function(j,k){i(".fee-filter-"+k).each(function(){var l=i(this),n=g(this),m=n.type;new d[m](l,m,k,n)})});if(FrontEndEditor.data.controls){var h=[];i.each(FrontEndEditor.data.controls,function(j,k){h.push('<span class="fee-control">'+k+"</span>")});i(".fee-field").qtip({content:h.join('<span class="fee-separator"> | </span>'),show:{effect:"fade"},position:{at:"top center",my:"bottom center"},style:{tip:{corner:"bottom center",width:16,height:10},classes:"ui-tooltip-fee ui-tooltip-rounded"}})}})})(jQuery);