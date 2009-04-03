jQuery(function($) {

$(document).ready(function() {
	var vars = window.frontEd_data;

	// Get element content through AJAX
	get_data = function(el, container, args) {
		var get_data = {
			nonce: vars['nonce'],
			action: 'front-editor',
			callback: 'get',
			name: args[0],
			item_id: el.attr('rel')
		};

		jQuery.post(vars['request'], get_data, function(response) {
			container.val(response);
			
			if (args[1] == 'textarea') {
//				container.wysiwyg();
				container.autogrow();
			}
		});
	}

	// Update element content through AJAX
	send_data = function(el, container, args) {
		var post_data = {
			nonce: vars['nonce'],
			action: 'front-editor',
			callback: 'save',
			name: args[0],
			item_id: el.attr('rel'),
			content: container.val()
		};

		jQuery.post(vars['request'], post_data, function(response) {
			var speed = 'fast';

			if (args[1] == 'textarea') {
				el.css('display', 'block');
				speed = 'normal';
			}

			el.fadeOut(speed, function() {
				el.html(response);
			}).fadeIn(speed);
		});
	}

	form_handler = function(el, args) {
		// Set up form html
		var form_id = 'front-editor-' + el.attr('rel') + '-' + args[0];

		var form_html = '<form id="' + form_id + '" method="post" action="">';
	
		if (args[1] == 'textarea')
			form_html += '<textarea class="front-editor-content"></textarea>';
		else
			form_html += '<input type="text" class="front-editor-content" value="" />';

		form_html +=
			'<input class="front-editor-save" type="submit" value="Save" />' +
			'<button class="front-editor-cancel" title="Cancel">X</button>' +
			'</form>';

		// Add form
		if ( el.parents('a').length == 0 )
			target = el;
		else
			target = el.parents('a');

		el.hide();
		target.after(form_html);

		var form = $('#' + form_id);
		var container = form.find('.front-editor-content');

		get_data(el, container, args);

		remove_form = function() {
			el.show();
			form.remove();
			window.frontEd_trap = false;

			return false;
		}

		form.find('.front-editor-cancel').click(remove_form);

		form.submit(function() {
			send_data(el, container, args);
			remove_form();

			return false;
		});
	}

	first_click_handler = function(el) {
		// Disable parent link
		el.parents('a').click(function() {
			return false;
		});

		setTimeout(function() {
			if ( window.frontEd_trap )
				return;

			if ( typeof(window.frontEd_url) != 'undefined' )
				window.location = window.frontEd_url;
			else if ( el.parents('a').length > 0 )
				window.location = el.parents('a').attr('href');
		}, 400);
	}

	click_handler = function(el, args) {
		// Capture inside link clicks
		el.find('a').each(function() {
			$(this).click(function() {
				window.frontEd_url = $(this).attr('href');
				return true;
			});
		});

		// Fires on the second click
		el.click(function(ev) {
			if (ev.detail == 1) {
				first_click_handler(el);
				return false;
			}

			window.frontEd_trap = true;

			form_handler(el, args);

			return false;
		});
	}

	// Widget text fix: Add rel attr to each element
	$('span.front-ed-widget_text, span.front-ed-widget_title').each(function() {
		id = $(this).parents('.widget_text').attr('id');
		if (id)
			$(this).attr('rel', id);
		else
			$(this).attr('class', '');	//not a text widget
	});

	// Start click handler
	$.each(vars['fields'], function(i, args) {
		$('span.front-ed-' + args[0]).each(function() {
			click_handler($(this), args);
		});
	});
});

});
