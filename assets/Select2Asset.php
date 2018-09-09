<?php

namespace kaile\polyfield\assets;

use yii\web\AssetBundle;

/**
 * Description of CollapsibleAsset
 *
 * @created 25.05.2015 14:09:43
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 *
 * @since 1.0
 */
class Select2Asset extends AssetBundle
{
    public $sourcePath = '@bower/select2/dist';
    public $js = [
        'js/select2.min.js',
    ];
    public $css = [
        'css/select2.min.css',
    ];
    public $depends = [
        'yii\web\JqueryAsset',
    ];
}