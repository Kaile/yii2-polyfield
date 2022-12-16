<?php
namespace kaile\polyfield\assets;

use yii\web\AssetBundle;

class TinyMCEAsset extends AssetBundle
{
	public $sourcePath = '@npm/tinymce';
	
	public $css = [];
	
	public $js = [
		'tinymce.min.js',
	];
}