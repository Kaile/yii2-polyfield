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
    public $sourcePath = '@vendor/kaile/yii2-polyfield/web';
    public $js = [
        'js/polyfield.js',
    ];
    public $css = [
        'css/polyfield.min.css',
        'css/autocomplete-styles.min.css',
    ];

    public $depends = [
        'kaile\polyfield\assets\CollapsibleAsset',
        'moonland\tinymce\TinyMCEAsset',
        'trntv\yii\datetime\assets\DateTimeAsset',
    ];
}
