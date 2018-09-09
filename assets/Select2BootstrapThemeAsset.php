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
class Select2BootstrapThemeAsset extends AssetBundle
{
    public $sourcePath = '@bower/select2-bootstrap-theme/dist';
    public $css = [
        'select2-bootstrap.min.css',
    ];
    public $depends = [
        'Select2Asset',
    ];
}