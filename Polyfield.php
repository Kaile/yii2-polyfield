<?php

namespace kaile\polyfield;

use kaile\polyfield\assets\PolyfieldAsset;
use kaile\polyfield\assets\Select2Asset;
use kaile\polyfield\assets\Select2BootstrapThemeAsset;
use Yii;
use yii\base\Widget;
use yii\db\ActiveRecord;
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
 * @since 1.1
 */
class Polyfield extends Widget
{
    /**
     * Types constants for [[type]] property
     */
    const TYPE_STRING = 'string';
    const TYPE_DROPDOWN = 'dropdown';
    const TYPE_SELECT2 = 'select2';
    const TYPE_DATE = 'date';
    const TYPE_TEXT = 'text';
    const TYPE_BOOL = 'boolean';
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
     */
    public $dropdownAttribute = 'name';

    /**
     * Attribute that shows as prefix in dropdown list.
     *
     * @var string name of attriubte
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
     * ['status' => [
     *      'type' => Polyfield::TYPE_SELECT2,
     *      'data' => Statuses::find()->all(),
     * ]];
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
     * Data for Select2 field.
     * Format of data:
     * ```php
     * ['id' => 'name']
     * ```
     *
     * @var array
     */
    public $select2Data = [];

    /**
     * Render select2 with bootstrap theme
     *
     * @var bool
     */
    public $select2BootstrapTheme = true;

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
            $this->attributes = array_keys($this->model->getAttributes());
        }
        PolyfieldAsset::register($this->getView());
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
            'select2Data' => $this->select2Data,
        ];

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
            $model['dropdownAttribute'] = $this->dropdownAttribute;
            $model['dropdownValueAttribute'] = $this->dropdownValueAttribute;
            $model['dropdownPrefixAttribute'] = $this->dropdownPrefixAttribute;
            $model['dropdownUnique'] = $this->dropdownUnique;
            $model['filterAttribute'] = $this->filterAttribute;
            $model['sortAttribute'] = $this->sortAttribute;
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

        if ($this->type === static::TYPE_SELECT2 || in_array(static::TYPE_SELECT2, $this->attributeTypes)) {
            if ($this->select2BootstrapTheme) {
                Select2BootstrapThemeAsset::register($this->getView());
                $this->getView()->registerJs('$.fn.select2.defaults.set( "theme", "bootstrap" );');
            } else {
                Select2Asset::register($this->getView());
            }
        }

        $this->getView()->registerJs('polyfield.setTranslation(' . Json::encode($i18n) . ')');
        $this->getView()->registerJs('polyfield.push(' . Json::encode($model) . ')');
    }
}
