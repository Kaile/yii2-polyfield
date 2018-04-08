<?php

namespace kaile\polyfield\assets;

use yii\web\AssetBundle;

/**
 * Description of CollapsibleAsset
 *
 * @created 25.05.2015 14:09:43
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 *
 * @since 2.0
 */
class CollapsibleAsset extends AssetBundle
{
    public $sourcePath = '@bower/collapsible';
    public $js = [
        'jquery.collapsible.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];
}
