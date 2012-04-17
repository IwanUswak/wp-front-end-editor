class FrontEndEditor.hover

	HOVER_BORDER: 2
	HOVER_PADDING: 2

	lock: false,
	timeout: null,

	constructor: ($el, $content) ->
		@border = jQuery('<div>',
			'class': 'fee-hover-border',
			'css': { width: @HOVER_BORDER }
		).hide().appendTo('body')

		@container = jQuery('<div>',
			'class': 'fee-hover-container'
			'html': $content
			'click': (ev) =>
				ev.preventDefault()
				@hide_immediately()
			'mouseover': =>
				@lock = true
			'mouseout': =>
				@lock = false
				@hide()
		).hide().appendTo('body')

		# Webkit really doesn't like block elements inside inline elements
		if $el.width() > $el.parent().width()
			$el.css('display', 'block')

		$el.bind {
			'mouseover': (ev) =>
				@position_vert(ev.pageY)
				@show($el)

			'mousemove': (ev) =>
				@position_vert(ev.pageY)

			'mouseout': jQuery.proxy(this, 'hide')
		}

	position_vert: (mouse_vert_pos) ->
		normal_height = mouse_vert_pos - @container.outerHeight()/2

		@container.css('top', (normal_height - @HOVER_BORDER) + 'px')

	hide_immediately: ->
		@container.hide()
		@border.hide()

	hide: ->
		@timeout = setTimeout =>
			if @lock
				return

			@hide_immediately()
		, 300

	show: ($el) ->
		offset = $el.offset()

		clearTimeout @timeout

		# Position container
		@container.css 'left', (offset.left - @container.outerWidth() - @HOVER_PADDING - 2) + 'px'
		@container.show()

		# Position border
		@border.css(
			'left'  : (offset.left - @HOVER_PADDING - 2) + 'px'
			'top'   : (offset.top  - @HOVER_PADDING - @HOVER_BORDER) + 'px'
			'height': ($el.height() + @HOVER_PADDING * 2) + 'px'
		).show()
