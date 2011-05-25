FrontEndEditor.define_field( 'rich', 'textarea', {

	lastActiveEditable: null,

	create_input: jQuery.noop,

	/**
	 * Handle the response for the content loading
	 */
	ajax_get_handler: function (response) {
		var $el = this.error_handler(response);

		if ( !$el ) {
			return;
		}

		// Replace the displayed content with the raw content from the database
		this.el.html(response.content);

		// Activate Aloha
		this.el.aloha();
		this.el.focus();
		GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableDeactivated", jQuery.proxy(this, 'save_editable') );
	},

	/**
	 * Callback that gets called when the editable gets deactivated.
	 */
	save_editable: function (event, editableDiv) {
		// unsubscribe from the event because we only want to handle it once
		jQuery(GENTICS.Aloha).unbind("editableDeactivated");

		// blur the currently active editable
		if (GENTICS.Aloha.activeEditable) {
			this.el.unbind('click');
			this.el.unbind('mousedown');
			this.el.unbind('focus');
			this.el.unbind('dblclick');
			this.el.removeClass('GENTICS_editable');
			this.lastActiveEditable = GENTICS.Aloha.activeEditable;
			GENTICS.Aloha.activeEditable.blur();
  		    GENTICS.Aloha.activeEditable.disable();
		}

		this.ajax_set(editableDiv.editable.getContents());
	},

//	// Copied from wp-admin/js/editor.dev.js
//	pre_wpautop: function (content) {
//		var blocklist1, blocklist2;
//
//		// Protect pre|script tags
//		content = content.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function (a) {
//			a = a.replace(/<br ?\/?>[\r\n]*/g, '<wp_temp>');
//			return a.replace(/<\/?p( [^>]*)?>[\r\n]*/g, '<wp_temp>');
//		});
//
//		// Pretty it up for the source editor
//		blocklist1 = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|div|h[1-6]|p|fieldset';
//		content = content.replace(new RegExp('\\s*</('+blocklist1+')>\\s*', 'g'), '</$1>\n');
//		content = content.replace(new RegExp('\\s*<(('+blocklist1+')[^>]*)>', 'g'), '\n<$1>');
//
//		// Mark </p> if it has any attributes.
//		content = content.replace(/(<p [^>]+>.*?)<\/p>/g, '$1</p#>');
//
//		// Sepatate <div> containing <p>
//		content = content.replace(/<div([^>]*)>\s*<p>/gi, '<div$1>\n\n');
//
//		// Remove <p> and <br />
//		content = content.replace(/\s*<p>/gi, '');
//		content = content.replace(/\s*<\/p>\s*/gi, '\n\n');
//		content = content.replace(/\n[\s\u00a0]+\n/g, '\n\n');
//		content = content.replace(/\s*<br ?\/?>\s*/gi, '\n');
//
//		// Fix some block element newline issues
//		content = content.replace(/\s*<div/g, '\n<div');
//		content = content.replace(/<\/div>\s*/g, '</div>\n');
//		content = content.replace(/\s*\[caption([^\[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n');
//		content = content.replace(/caption\]\n\n+\[caption/g, 'caption]\n\n[caption');
//
//		blocklist2 = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|h[1-6]|pre|fieldset';
//		content = content.replace(new RegExp('\\s*<(('+blocklist2+') ?[^>]*)\\s*>', 'g'), '\n<$1>');
//		content = content.replace(new RegExp('\\s*</('+blocklist2+')>\\s*', 'g'), '</$1>\n');
//		content = content.replace(/<li([^>]*)>/g, '\t<li$1>');
//
//		if ( content.indexOf('<object') != -1 ) {
//			content = content.replace(/<object[\s\S]+?<\/object>/g, function (a) {
//				return a.replace(/[\r\n]+/g, '');
//			});
//		}
//
//		// Unmark special paragraph closing tags
//		content = content.replace(/<\/p#>/g, '</p>\n');
//		content = content.replace(/\s*(<p [^>]+>[\s\S]*?<\/p>)/g, '\n$1');
//
//		// Trim whitespace
//		content = content.replace(/^\s+/, '');
//		content = content.replace(/[\s\u00a0]+$/, '');
//
//		// put back the line breaks in pre|script
//		content = content.replace(/<wp_temp>/g, '\n');
//
//		return content;
//	}
});
