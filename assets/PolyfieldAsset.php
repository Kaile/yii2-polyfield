<?php

namespace kaile\polyfield\assets;

use yii\web\AssetBundle;

/**
 * Asset bundle for polyfield.js file
 *
 * @created 22.05.2015 16:50:28
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 *
 * @since 1.0
 */
class PolyfieldAsset extends AssetBundle
{
	public $sourcePath = '@vendor/kaile/yii2-polyfield/assets';
	public $js = [
		'polyfield.js',
        'moment-with-locales.min.js',
        'bootstrap-datetimepicker.min.js',
		'jquery.autocomplete.min.js',
	];
	public $css = [
		'polyfield.css',
        'bootstrap-datetimepicker.min.css',
		'autocomplete-styles.min.css',
	];

	public $depends = [
		'kaile\polyfield\assets\CollapsibleAsset',
	];
}
