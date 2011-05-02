FrontEndEditor.fieldTypes['rich'] = FrontEndEditor.fieldTypes['textarea'].extend({
	dependency: FrontEndEditor.data.nicedit ? FrontEndEditor.data.nicedit.src : null,

	init_cleditor: function($el) {
		var self = this;

		$el.cleditor({
			controls: FrontEndEditor.data.cleditor.controls,
			width: self.form.width(),
			height: FrontEndEditor.data.cleditor.height,
			bodyStyle: 'cursor:text; margin:4px; ' + FrontEndEditor.data.cleditor.css.replace(/"/g, "'")
		});
	},

	content_to_input: function (content) {
		var self = this;

		self._super(content);

		self.init_cleditor( self.input );
	},

	content_from_input: function () {
		var self = this;

		return self.pre_wpautop(self.input.val());
	},

	// Copied from wp-admin/js/editor.dev.js
	pre_wpautop: function (content) {
		var blocklist1, blocklist2;

		// Protect pre|script tags
		content = content.replace(/<(pre|script)[^>]*>[\s\S]+?<\/\1>/g, function (a) {
			a = a.replace(/<br ?\/?>[\r\n]*/g, '<wp_temp>');
			return a.replace(/<\/?p( [^>]*)?>[\r\n]*/g, '<wp_temp>');
		});

		// Pretty it up for the source editor
		blocklist1 = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|div|h[1-6]|p|fieldset';
		content = content.replace(new RegExp('\\s*</('+blocklist1+')>\\s*', 'g'), '</$1>\n');
		content = content.replace(new RegExp('\\s*<(('+blocklist1+')[^>]*)>', 'g'), '\n<$1>');

		// Mark </p> if it has any attributes.
		content = content.replace(/(<p [^>]+>.*?)<\/p>/g, '$1</p#>');

		// Sepatate <div> containing <p>
		content = content.replace(/<div([^>]*)>\s*<p>/gi, '<div$1>\n\n');

		// Remove <p> and <br />
		content = content.replace(/\s*<p>/gi, '');
		content = content.replace(/\s*<\/p>\s*/gi, '\n\n');
		content = content.replace(/\n[\s\u00a0]+\n/g, '\n\n');
		content = content.replace(/\s*<br ?\/?>\s*/gi, '\n');

		// Fix some block element newline issues
		content = content.replace(/\s*<div/g, '\n<div');
		content = content.replace(/<\/div>\s*/g, '</div>\n');
		content = content.replace(/\s*\[caption([^\[]+)\[\/caption\]\s*/gi, '\n\n[caption$1[/caption]\n\n');
		content = content.replace(/caption\]\n\n+\[caption/g, 'caption]\n\n[caption');

		blocklist2 = 'blockquote|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|h[1-6]|pre|fieldset';
		content = content.replace(new RegExp('\\s*<(('+blocklist2+') ?[^>]*)\\s*>', 'g'), '\n<$1>');
		content = content.replace(new RegExp('\\s*</('+blocklist2+')>\\s*', 'g'), '</$1>\n');
		content = content.replace(/<li([^>]*)>/g, '\t<li$1>');

		if ( content.indexOf('<object') != -1 ) {
			content = content.replace(/<object[\s\S]+?<\/object>/g, function (a) {
				return a.replace(/[\r\n]+/g, '');
			});
		}

		// Unmark special paragraph closing tags
		content = content.replace(/<\/p#>/g, '</p>\n');
		content = content.replace(/\s*(<p [^>]+>[\s\S]*?<\/p>)/g, '\n$1');

		// Trim whitespace
		content = content.replace(/^\s+/, '');
		content = content.replace(/[\s\u00a0]+$/, '');

		// put back the line breaks in pre|script
		content = content.replace(/<wp_temp>/g, '\n');

		return content;
	}
});

