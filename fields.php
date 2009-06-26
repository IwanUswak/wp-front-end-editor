<?php

// All field classes should extend from this one
class frontEd_field
{
	// Mark the field as editable
	function wrap($content, $filter = '', $id = '')
	{
		if ( is_feed() )
			return $content;

		if ( empty($filter) )
			$filter = current_filter();

		if ( empty($id) )
			$id = $GLOBALS['post']->ID;

		$class = 'front-ed-' . $filter . ' front-ed';

		return "<span rel='{$id}' class='{$class}'>{$content}</span>";
	}

	// Retrieve the current data for the field
	function get($post_id, $name, $args)
	{
		trigger_error("This method must be implemented in a subclass", E_USER_ERROR);
	}

	// Save the data retrieved from the field
	function save($post_id, $content, $name, $args)
	{
		trigger_error("This method must be implemented in a subclass", E_USER_ERROR);
	}

	function check()
	{
		return current_user_can('edit_posts') or current_user_can('edit_pages');
	}
}


// Handles the_title and the_content fields
class frontEd_basic extends frontEd_field
{
	function wrap($content, $filter = '')
	{
		if ( ! self::post_check($GLOBALS['post']->ID) )
			return $content;

		if ( empty($filter) )
			$filter = current_filter();

		return parent::wrap($content, $filter);
	}

	function get($id, $filter)
	{
		$field = self::get_col($filter);

		return get_post_field($field, $id);
	}

	function save($id, $content, $filter)
	{
		$field = self::get_col($filter);

		wp_update_post(array(
			'ID' => $id,
			$field => $content
		));

		return $content;
	}

	// To be called only from self::wrap()
	protected function post_check($id)
	{
		if ( !in_the_loop() )
			return false;

		$type = get_post_field('post_type', $id);

		return current_user_can("edit_$type", $id);
	}

	// Get wp_posts column
	protected function get_col($filter)
	{
		return str_replace('the_', 'post_', $filter);
	}
}

// Handles <p> in the_content
class frontEd_chunks extends frontEd_basic
{
	const delim = "\n\n";

	function wrap($content, $filter = '')
	{
		if ( ! self::post_check($GLOBALS['post']->ID) )
			return $content;

		if ( empty($filter) )
			$filter = current_filter();

		$id = $GLOBALS['post']->ID;

		$chunks = self::split($content);

		foreach ( $chunks as $i => $chunk )
			$chunks[$i] = '<p>' . frontEd_field::wrap($chunk, $filter, "$id#$i") . '</p>';

		return implode('', $chunks);
	}

	function get($id, $filter)
	{
		list($post_id, $chunk_id) = explode('#', $id);

		$field = get_post_field('post_content', $post_id);

		$chunks = self::split($field, true);

		return $chunks[$chunk_id];
	}

	function save($id, $content, $filter)
	{
		list($post_id, $chunk_id) = explode('#', $id);

		$field = get_post_field('post_content', $post_id);

		$chunks = self::split($field, true);

		$content = trim($content);

		if ( empty($content) )
			unset($chunks[$chunk_id]);
		else
			$chunks[$chunk_id] = $content;

		$new_content = implode(self::delim, $chunks);

		wp_update_post(array(
			'ID' => $id,
			'post_content' => $new_content
		));

		// Refresh the page if a new chunk is added
		if ( empty($content) || FALSE !== strpos($content, self::delim) )
			self::force_refresh();

		return $content;
	}

	// Split content into chunks
	protected function split($content, $autop = false)
	{
		if ( $autop )
			$content = wpautop($content);

		$chunks = explode('<p>', $content);

		$new_content = array();
		foreach ( $chunks as $chunk )
		{
			$chunk = trim(str_replace('</p>', '', $chunk));

			if ( !empty($chunk) )
				$new_content[] = $chunk . "\n";
		}

		return $new_content;
	}

	protected function force_refresh()
	{
		die("<script language='javascript'>location.reload(true)</script>");	
	}
}

// Handles the_excerpt field
class frontEd_excerpt extends frontEd_basic
{
	function get($id)
	{
		$post = get_post($id);

		$excerpt = $post->post_excerpt;

		if ( empty($excerpt) )
			$excerpt = self::trim_excerpt($post->post_content);

		return $excerpt;
	}

	function save($id, $excerpt)
	{
		$default_excerpt = self::get($id);

		if ( $excerpt == $default_excerpt )
			return $excerpt;

		wp_update_post(array(
			'ID' => $id,
			$field => $content
		));

		if ( empty($excerpt) )
			return $default_excerpt;

		return $excerpt;
	}

	// Copy-paste from wp_trim_excerpt()
	private function trim_excerpt($text)
	{
		$text = apply_filters('the_content', $text);
		$text = str_replace(']]>', ']]&gt;', $text);
		$text = strip_tags($text);
		$excerpt_length = apply_filters('excerpt_length', 55);
		$words = explode(' ', $text, $excerpt_length + 1);
		if (count($words) > $excerpt_length)
		{
			array_pop($words);
			array_push($words, '[...]');
			$text = implode(' ', $words);
		}

		return apply_filters('get_the_excerpt', $text);
	}
}


// Handles the_tags field
class frontEd_tags extends frontEd_basic
{
	function wrap($content, $before, $sep, $after)
	{
		if ( empty($content) )
			$content = __('[none]', 'front-end-editor');

		if ( version_compare($GLOBALS['wp_version'], '2.7.1', '<') )
		{
			// Figure out $before arg
			$before = substr($content, 0, strpos($content, '<a'));

			// Figure out $after arg
			$tmp = explode('</a>', $content);
			$after = $tmp[count($tmp)-1];
		}

		$content = str_replace(array($before, $after), '', $content);

		return $before . parent::wrap($content, current_filter()) . $after;
	}

	function get($id)
	{
		$tags = get_the_tags($id);

		if ( empty($tags) )
			return;

		foreach ( $tags as &$tag )
			$tag = $tag->name;

		return implode(', ', $tags);
	}

	function save($id, $tags)
	{
		wp_set_post_tags($id, $tags);

		return get_the_term_list($id, 'post_tag', '', ', ');
	}
}


// Handles comment_text field
class frontEd_comment extends frontEd_field
{
	function wrap($content)
	{
		global $comment;
		return parent::wrap($content, current_filter(), $comment->comment_ID);
	}

	function get($id)
	{
		$comment = get_comment($id);
		return $comment->comment_content;
	}

	function save($id, $content, $filter)
	{
		wp_update_comment(array(
			'comment_ID' => $id,
			'comment_content' => $content
		));

		return $content;
	}

	function check()
	{
		return current_user_can('moderate_comments');
	}
}


// Handles widget_text
class frontEd_widget extends frontEd_field
{
	function get($id, $filter)
	{
		$id = self::get_id($id);
		$field = self::get_col($filter);

		$widgets = get_option('widget_text');

		return $widgets[$id][$field];
	}

	function save($id, $content, $filter)
	{
		$id = self::get_id($id);
		$field = self::get_col($filter);

		$widgets = get_option('widget_text');
		$widgets[$id][$field] = $content;

		update_option('widget_text', $widgets);

		return $content;
	}

	protected function get_id($id)
	{
		return str_replace('text-', '', $id);
	}

	protected function get_col($filter)
	{
		return str_replace('widget_', '', $filter);
	}

	function check()
	{
		return current_user_can('edit_themes');
	}
}

class frontEd_meta extends frontEd_field
{
	function wrap($content, $post_id, $key, $type)
	{
		if ( ! isset($post_id) )
			$post_id = $GLOBALS['post']->ID;

		$id = implode('#', array($post_id, $key, $type));

		return parent::wrap($content, current_filter(), $id);
	}

	function get($id)
	{
		list($post_id, $key) = explode('#', $id);

		return get_post_meta($post_id, $key, true);
	}

	function save($id, $content, $filter)
	{
		list($post_id, $key) = explode('#', $id);

		update_post_meta($post_id, $key, $content);

		return $content;
	}
}

function editable_post_meta($post_id, $key, $type = 'input')
{
	$data = get_post_meta($post_id, $key, true);

	echo apply_filters('post_meta', $data, $post_id, $key, $type);
}

add_action('plugins_loaded', 'fee_register_defaults');
function fee_register_defaults()
{
	$fields = array(
		'the_title' => array(
			'class' => 'frontEd_basic',
			'type' => 'input',
			'title' => __('Post/page title', 'front-end-editor')
		),
		
		'the_content' => array(
			'class' => frontEditor::$options->chunks ? 'frontEd_chunks' : 'frontEd_basic',
			'type' => frontEditor::$options->rich ? 'rich' : 'textarea',
			'title' => __('Post/page content', 'front-end-editor')
		),

		'the_excerpt' => array(
			'class' => 'frontEd_excerpt',
			'type' => 'textarea',
			'title' => __('Post/page excerpt', 'front-end-editor')
		),

		'the_tags' => array(
			'class' => 'frontEd_tags',
			'argc' => 4,
			'title' => __('Post tags', 'front-end-editor')
		),

		'post_meta' => array(
			'class' => 'frontEd_meta',
			'argc' => 4,
			'title' => __('Post/page custom fields', 'front-end-editor')
		),

		'comment_text' => array(
			'class' => 'frontEd_comment',
			'type' => 'textarea',
			'title' => __('Comment text', 'front-end-editor')
		),

		'widget_text' => array(
			'class' => 'frontEd_widget',
			'type' => 'textarea',
			'title' => __('Text widget content', 'front-end-editor')
		),

		'widget_title' => array(
			'class' => 'frontEd_widget',
			'title' => __('Text widget title', 'front-end-editor')
		),
	);

	foreach ( $fields as $filter => $args )
		register_fronted_field($filter, $args);

	// Safe hook for new editable fields to be registered
	do_action('front_ed_fields');
}

