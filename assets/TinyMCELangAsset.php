<?php

namespace kaile\polyfield\assets;

use Yii;
use yii\web\AssetBundle;

/**
 * Asset for languages of TinyMCE editor
 *
 * @author Mikhail Kornilov <mikh.kornilov@gmail.com>
 * @created 27.10.2021 15:00:00
 *
 * @since 1.0.0
 */
class TinyMCELangAsset extends AssetBundle
{
    /**
     * @inheritDoc
     */
    public $sourcePath = '@npm/tinymce-i18n/langs5';

    /**
     * @inheritDoc
     */
    public $depends = [
        TinyMCEAsset::class,
    ];

    public function init()
    {
        parent::init();

        $locale = preg_replace('/-/', '_', Yii::$app->language);
        $lang = explode('_', $locale)[0];
        $langFile = "{$locale}.js'";

        if ( ! file_exists($langFile) ) {
            $langFile = "{$lang}.js";
        }

        $this->js[] = $langFile;
    }
}