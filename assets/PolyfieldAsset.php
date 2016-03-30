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
    public $sourcePath = '@vendor/kaile/yii2-polyfield';
    public $js = [
        'js/tinymce/tinymce.min.js',
        'js/polyfield.js',
        'js/moment-with-locales.min.js',
        'js/bootstrap-datetimepicker.min.js',
        'js/jquery.autocomplete.min.js',
    ];
    public $css = [
        'css/polyfield.min.css',
        'css/bootstrap-datetimepicker.min.css',
        'css/autocomplete-styles.min.css',
    ];

    public $depends = [
        'kaile\polyfield\assets\CollapsibleAsset',
    ];
}
