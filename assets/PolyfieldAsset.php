<?php

namespace kaile\polyfield\assets;

use moonland\tinymce\TinyMCEAsset;
use moonland\tinymce\TinyMCELangAsset;
use trntv\yii\datetime\assets\DateTimeAsset;
use yii\web\AssetBundle;

/**
 * Asset bundle for polyfield.js file
 *
 * @created 22.05.2015 16:50:28
 * @author Mikhail Kornilov <fix-06 at yandex.ru>
 *
 * @since 1.0
 */
class PolyfieldAsset extends AssetBundle
{
    public $sourcePath = '@vendor/kaile/yii2-polyfield/web';
    public $js = [
        'js/polyfield.min.js',
    ];
    public $css = [
        'css/polyfield.min.css',
        'css/autocomplete-styles.min.css',
    ];

    public $depends = [
        CollapsibleAsset::class,
        JqueryAutocompleteAsset::class,
        TinyMCEAsset::class,
        TinyMCELangAsset::class,
        DateTimeAsset::class,
    ];
}
