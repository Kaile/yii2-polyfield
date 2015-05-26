<?php

namespace kaile\polyfield\assets;

/**
 * Asset bundle for polyfield.js file
 * 
 * @created 22.05.2015 16:50:28
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 * 
 * @since 1.0
 */
class PolyfieldAsset extends \yii\web\AssetBundle
{
	public $sourcePath = '@vendor/kaile/yii2-polyfield/assets';
	public $js = [
		'polyfield.js',
	];
	public $css = [
		'polyfield.css',
	];
	
	public $depends = [
		'kaile\polyfield\assets\CollapsibleAsset',
	];
}
