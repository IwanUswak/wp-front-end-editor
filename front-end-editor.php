<?php
/*
Plugin Name: Front-end Editor
Version: 0.9.6a
Description: Allows you to edit your posts without going through the admin interface
Author: scribu
Author URI: http://scribu.net/
Plugin URI: http://scribu.net/wordpress/front-end-editor
Text Domain: front-end-editor

Copyright (C) 2009 scribu.net (scribu AT gmail DOT com)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// Init
require_once dirname(__FILE__) . '/inc/scb-check.php';
if ( !scb_check(__FILE__) ) return;

_fee_init();

function _fee_init() 
{
	// Load translations
	$plugin_dir = basename(dirname(__FILE__));
	load_plugin_textdomain('front-end-editor', "wp-content/plugins/$plugin_dir/lang", "$plugin_dir/lang");

	// Load files
	foreach ( array('core', 'fields') as $path )
		require_once(dirname(__FILE__) . "/$path.php");

	// Load options
	$options = new scbOptions('front-end-editor', __FILE__, array(
		'disable' => array(),
		'rich' => true
	));

	frontEditor::init($options, '0.9.6');

	if ( is_admin() )
	{
		require_once(dirname(__FILE__) . '/admin.php');
		new frontEditorAdmin(__FILE__, $options);
	}
}

