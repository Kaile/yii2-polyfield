<?php

namespace kaile\polyfield\assets;

use yii\web\AssetBundle;

/**
 * @created 08.04.2018 11:37:34
 * @author Mikhail Kornilov <fix-06 at yandex.ru>
 * 
 * @since 1.0
 */
class JqueryAutocompleteAsset extends AssetBundle
{
    public $sourcePath = '@bower/devbridge-autocomplete/dist';
    public $js = [
        'jquery.autocomplete.min.js',
    ];
}