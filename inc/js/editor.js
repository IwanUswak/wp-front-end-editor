jQuery(function($) {

$(document).ready(function() {
	var vars = window.frontEd_data;

	// AJAX handling
	get_data = function(el, container) {
		var get_data = {
			nonce: vars['nonce'],
			action: 'front-editor',
			callback: 'get',
			name: el.frontEdArgs[0],
			item_id: $(el).attr('rel')
		};

		jQuery.post(vars['request'], get_data, function(response) {
			container.val(response);

			var type = el.frontEdArgs[1];

			if (type == 'rich')
				container.wysiwyg({
					controls : {
						separator04         : { visible : true },
						insertOrderedList   : { visible : true },
						insertUnorderedList : { visible : true },
						html				: { visible : true }
					}
				});
			else if (type == 'textarea')
				container.autogrow({lineHeight: 16});
		});
	}

	send_data = function(el, container) {
		var post_data = {
			nonce: vars['nonce'],
			action: 'front-editor',
			callback: 'save',
			name: el.frontEdArgs[0],
			item_id: $(el).attr('rel'),
			content: container.val()
		};

		jQuery.post(vars['request'], post_data, function(response) {
			var speed = 'fast';

			if (el.frontEdArgs[1] != 'input') {
				$(el).css('display', 'block');
				speed = 'normal';
			}

			$(el).fadeOut(speed, function() {
				$(el).html(response);
			}).fadeIn(speed);
		});
	}


	// Form handling
	form_handler = function(el) {
		// Set up data container
		if (el.frontEdArgs[1] != 'input')
			container = $('<textarea>');
		else
			container = $('<input type="text">');

		container.attr('class', 'front-editor-content');

		// Set up form buttons
		var save_button = $('<button>').attr({'class': 'front-editor-save', 'title': vars.save_text}).text(vars.save_text);
		var cancel_button = $('<button>').attr({'class': 'front-editor-cancel', 'title': vars.cancel_text}).text('X');

		// Create form
		var form = $('<div>').attr('class', 'front-editor-container')
			.append(container)
			.append(save_button)
			.append(cancel_button);

		// Add form
		var target = $(el).parents('a');
		if ( target.length == 0 )
			target = $(el);

		$(el).hide();
		target.after(form);

		get_data(el, container);

		remove_form = function(ev) {
			ev.preventDefault();

			window.frontEd_trap = false;

			$(el).show();
			form.remove();
		}

		cancel_button.click(remove_form);

		save_button.click(function(ev) {
			ev.preventDefault();

			send_data(el, container);
			remove_form();
		});
	}

	// Click handling
	single_click = function(ev) {
		ev.stopPropagation();
		ev.preventDefault();

		el = this;

		setTimeout(function() {
			if ( window.frontEd_trap )
				return;

			if ( typeof(window.frontEd_url) != 'undefined' )
				window.location = window.frontEd_url;
			else if ( $(el).parents('a').length > 0 )
				window.location = $(el).parents('a').attr('href');
		}, 300);
	}

	double_click = function(ev) {
		ev.stopPropagation();
		ev.preventDefault();

		window.frontEd_trap = true;

		form_handler(this);
	}

	click_handler = function(el) {
		$(el)
			.click(single_click)
			.dblclick(double_click);

		// Handle child links

		lightbox_check = function() {
			return $(this).attr("rel").indexOf('lightbox') == -1;
		}

		child_single_click = function(ev) {
			ev.stopPropagation();
			ev.preventDefault();

			window.frontEd_url = $(this).attr('href');

			$(el).click();
		}

		child_double_click = function(ev) {
			ev.stopPropagation();
			ev.preventDefault();

			$(el).dblclick();
		}

		$(el).find('a')
			.filter(lightbox_check)
			.click(child_single_click)
			.dblclick(child_double_click);
	}

	// Widget text fix: Add rel attr to each element
	$('span.front-ed-widget_text, span.front-ed-widget_title').each(function() {
		id = $(this).parents('.widget_text').attr('id');
		if (id)
			$(this).attr('rel', id);
		else
			$(this).attr('class', '');	// not a text widget
	});

	// Start click handling
	$.each(vars['fields'], function(i, args) {
		$('span.front-ed-' + args[0]).each(function() {
			this.frontEdArgs = args;
			click_handler(this, args);
		});
	});
});

});
