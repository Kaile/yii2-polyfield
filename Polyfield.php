<?php

namespace kaile\polyfield;

use kaile\polyfield\assets\PolyfieldAsset;
use kaile\polyfield\assets\Select2BootstrapThemeAsset;
use moonland\tinymce\TinyMCELangAsset;
use Yii;
use yii\base\Widget;
use yii\db\ActiveRecord;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\web\BadRequestHttpException;

/**
 * Widget that generates form with dynamic fields and dictionary filters for
 * fill while user typing
 *
 * @created 19.05.2015 13:10:47
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 *
 * @since 1.2
 */
class Polyfield extends Widget
{
    /**
     * Types constants for [[type]] property
     */
    const TYPE_STRING = 'string';
    const TYPE_DROPDOWN = 'dropdown';
    /**
     * Data for Select2 field.
     * Format of data:
     * ```php
     * ['id' => 'name'];
     * ```
     */
    const TYPE_SELECT2 = 'select2';
    const TYPE_DATE = 'date';
    const TYPE_TEXT = 'text';
    const TYPE_BOOL = 'boolean';
    /**
     * Hidden text field
     */
    const TYPE_HIDDEN = 'hidden';

    /**
     * @deprecated 1.2
     */
    const TYPE_TEXT_BLOCK = 'editor'; //Оставлено пока для совместимости

    /**
     * Class of model
     *
     * @var string
     */
    public $modelClass = null;

    /**
     * Model for what attributes to be rendered
     *
     * @var ActiveRecord
     */
    public $model = null;

    /**
     * Model attributes that be rendered. By default all attributes of model
     * will be rendered
     *
     * @var array
     */
    public $attributes = [];

    /**
     * Model attributes that be excluded from rendering
     *
     * @var array
     */
    public $excludeAttributes = [];

    /**
     * Class of fields that will be rendered
     *
     * @var string
     */
    public $fieldClass = 'yii\bootstrap\ActiveField';

    /**
     * Fields configuration
     *
     * @var array
     */
    public $fieldConfig = [];

    /**
     * Name that be shown in fieldset's header
     *
     * @var string
     */
    public $displayName;

    /**
     * Displayed name of button
     *
     * @var string
     */
    public $buttonCaption;

    /**
     * Attribute what data will be selected by user.
     *
     * @var string|array
     *
     * @deprecated 1.2 replaced with [[dropdownAttibuteTemplate]] property
     */
    public $dropdownAttribute = 'name';

    /**
     * Attribute that shows as prefix in dropdown list.
     *
     * @var string name of attriubte
     *
     * @deprecated 1.2 replaced with [[dropdownAttributeTemplate]] property
     */
    public $dropdownPrefixAttribute = '';

    /**
     * Attribute that will be inserted to dropdown value.
     *
     * @var string
     */
    public $dropdownValueAttribute = 'id';

    /**
     * Selecting from list only unique values.
     *
     * @var bool
     */
    public $dropdownUnique = true;

    /**
     * Contains existing models. It could need when perform editing of model
     * and its attributes
     *
     * @var array
     */
    public $exists = [];

    /**
     * Filter attribute that sets parent element of attribute. It's may be need
     * when dropdown list contain many elements. It works only with dropdown
     * lists.
     *
     * @var string attribute of model
     */
    public $filterAttribute = '';

    /**
     * Name of attribute in depends with will be sorted dropdown values.
     *
     * @var string
     */
    public $sortAttribute = '';

    /**
     * Type of field. In depends of [[type]] view of field will be built
     *
     * @var string
     */
    public $type = 'string';

    /**
     * Attributes that contains date attributes
     *
     * @var array
     */
    public $dateAttributes = ['date'];

    /**
     * Key value pairs where key is attribute name and value is type.
     * For HTML elements that needs a prepared data (e.t. dropdown or select2)
     * value can be sets as array with keys as param name and values as param values:
     * ```php
     * [
     *      'name' => Polyfield::TYPE_STRING,
     *      'status' => [
     *          'type' => Polyfield::TYPE_SELECT2,
     *          'data' => Statuses::find()->all(),
     *      ]
     * ];
     * ```
     *
     * @var array
     */
    public $attributeTypes = [];

    /**
     * Order is the property that contains data for sequence of model list.
     * It include in models view in format same as Order[model->formName][model->id].
     *
     * @var string
     */
    public $order = false;

    /**
     * Render select2 with bootstrap theme
     *
     * @var bool
     */
    public $select2BootstrapTheme = true;

    /**
     * Autocompletition for string input types
     *
     * @var bool
     */
    public $autocomplete = true;

    /**
     * Dropdown attrubte template for options. This is [[dropdownAttribute]] analog, but
     * has more functionality.
     * If set it value for example to '{id} - {name}' then options will be shown as '102 - option name'
     * and dropdown attribute value will be ignored
     *
     * @var string
     */
    public $dropdownAttributeTemplate = '{__dropdownAttribute}';

    /**
     * Exclude from dropdown list existing values
     *
     * @var bool
     */
    public $excludeExistingValues = true;

    /**
     * TinyMCE editor configuration
     *
     * @var array
     */
    public $editorConfig = [];

    /**
     * TinyMCE default editor configuration;
     *
     * @var array
     */
    public $defaultEditorConfig = [
        'language' => 'ru',
        'relative_urls' => false,
        'remove_script_host' => false,
        'height' => 300,
        'fontsize_formats' => '6pt 7pt 8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 24pt 28pt 36pt 40pt 48pt',
        'plugins' => [
            'advlist autolink lists link image charmap preview anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code fullscreen',
            'insertdatetime media nonbreaking save table directionality',
            'emoticons template'
        ],
        'toolbar' => [
            'undo redo | fontsizeselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            'forecolor backcolor | print preview media | blockquote',
        ],
    ];

    /**
     * Generate configuration for TinyMCE editor in string format to set it via client script
     *
     * @return string
     */
    protected function generateEditorConfig()
    {
        return json_encode($this->editorConfig);
    }

    protected function getTinyMceLanguageUrl()
    {
        $asset = new TinyMCELangAsset();

        return Yii::$app->assetManager->getPublishedUrl($asset->js[0]);
    }

    /**
     * Check types of attributes and returns true if editor is used or false otherwise
     *
     * @return bool
     */
    protected function isNeedEditor()
    {
        if ($this->type === static::TYPE_TEXT || $this->type === static::TYPE_TEXT_BLOCK) {
            return true;
        }

        foreach ($this->attributeTypes as $attrType) {
            if (is_array($attrType) && array_key_exists('type', $attrType) && ($attrType['type'] === static::TYPE_TEXT || $attrType['type'] === static::TYPE_TEXT_BLOCK)) {
                return true;
            } elseif ($attrType === static::TYPE_TEXT || $attrType === static::TYPE_TEXT_BLOCK) {
                return true;
            }
        }

        return false;
    }

    /**
     * @inheritdoc
     */
    public function init()
    {
        if ( ! $this->model && $this->modelClass ) {
            $this->model = new $this->modelClass;
        } elseif ( ! $this->model && ! $this->modelClass ) {
            throw new BadRequestHttpException(Yii::t('app', 'Не указан необходимый параметр model (modelClass) для работы виджета Polyfield'));
        }

        if (empty($this->attributes)) {
            $this->attributes = $this->model->attributes();
        }

        $this->dropdownAttributeTemplate = str_replace('__dropdownAttribute', $this->dropdownAttribute, $this->dropdownAttributeTemplate);

        PolyfieldAsset::register($this->getView());

        $this->defaultEditorConfig['language_url'] = $this->getTinyMceLanguageUrl();

        $this->editorConfig = ArrayHelper::merge($this->defaultEditorConfig, $this->editorConfig);
        $this->editorConfig['plugins'] = implode(' ', $this->editorConfig['plugins']);
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        if ( ! empty($this->excludeAttributes) ) {
            $this->attributes = array_diff($this->attributes, $this->excludeAttributes);
        }

        $modelId = $this->model->formName();
        $labels = $this->model->attributeLabels();

        echo Html::beginTag('fieldset', [
            'id' => 'content_' . $modelId,
        ]);

        if ($this->displayName) {
            echo Html::tag('legend', $this->displayName);
        }

        $model = [
            'id' => $modelId,
            'name' => $this->model->formName(),
            'label' => $this->displayName ? $this->displayName : $this->model->formName(),
            'attributes' => $this->attributes,
            'attributeLabels' => $labels,
            'type' => $this->type,
            'exists' => empty($this->exists) ? false : $this->exists,
            'dateAttributes' => $this->dateAttributes,
            'attributeTypes' => $this->attributeTypes,
            'order' => $this->order,
            'dropdownAttribute' => $this->dropdownAttribute,
            'dropdownValueAttribute' => $this->dropdownValueAttribute,
            'dropdownPrefixAttribute' => $this->dropdownPrefixAttribute,
            'dropdownAttributeTemplate' => $this->dropdownAttributeTemplate,
            'dropdownUnique' => $this->dropdownUnique,
            'filterAttribute' => $this->filterAttribute,
            'sortAttribute' => $this->sortAttribute,
            'autocomplete' => $this->autocomplete,
            'excludeExistingValues' => $this->excludeExistingValues,
        ];

        if ($this->isNeedEditor()) {
            $model['editorConfig'] = $this->generateEditorConfig();
        }

        echo Html::endTag('fieldset');

        if ($this->type === self::TYPE_DROPDOWN) {
            $tmp = $this->model->find();
            if ($this->filterAttribute) {
                $tmp->orderBy($this->filterAttribute);
            }
            $model['dropdownValues'] = $tmp->all();
            if (empty($model['dropdownValues'])) {
                echo Html::tag('div', Yii::t('app', 'Данные для выбора отсутствуют'), [
                    'class' => 'alert alert-info',
                ]);
                return;
            }
        }

        echo Html::beginTag('div', [
            'class' => 'row',
        ]);


        echo Html::button(($this->buttonCaption) ? $this->buttonCaption : Yii::t('app', 'Добавить поле'), [
            'id' => 'button_' . $modelId,
            'class' => 'btn btn-success center-block',
            'data-loading-text' => Yii::t('app', 'Идет загрузка...'),
        ]);

        echo Html::endTag('div');

        /**
         * Сделано конечно костыльно, но все же интернационализация достигается
         * стандартными средствами Yii2 и не приходится запиливать ничего
         * сложного на клиентской стороне.
         */
        $i18n = [
            'deleteElement' => Yii::t('app', 'Удалить элемент'),
            'deleteConfirmation' => Yii::t('app', 'Вы уверены, что хотите выполнить удаление?'),
            'noResults' => Yii::t('app', 'Результатов нет'),
            'filter' => Yii::t('app', 'Фильтр'),
            'noFilter' => Yii::t('app', '--- Нет ---'),
            'order' => Yii::t('app', 'Позиция'),
        ];

        Select2BootstrapThemeAsset::register($this->getView());

        $this->getView()->registerJs('polyfield.setTranslation(' . Json::encode($i18n) . ')');
        $this->getView()->registerJs('polyfield.push(' . Json::encode($model) . ')');
        $this->getView()->registerJs('$.fn.select2.defaults.set("theme", "bootstrap");');
        $this->getView()->registerJs('$.fn.select2.defaults.set("allowClear", true);');
        $this->getView()->registerJs('$.fn.select2.defaults.set("language", "' . mb_strcut(Yii::$app->language, 0, 2, 'utf-8') . '");');
        $this->getView()->registerJs('$.fn.select2.defaults.set("placeholder", "' . Yii::t('app', 'Выберите элемент из списка') . '");');
    }
}
