<?php

namespace kaile\polyfield;

use kaile\polyfield\assets\PolyfieldAsset;
use Yii;
use yii\base\Widget;
use yii\db\ActiveRecord;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\BadRequestHttpException;
use yii\widgets\ActiveForm;

//TODO: Сделать для каждого атрибута отображение в соответствии с его типом

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
    const TYPE_DATE = 'date';
    const TYPE_TEXT = 'text';
    const TYPE_BOOL = 'boolean';
    const TYPE_TEXT_BLOCK = 'editor'; //Оставлено пока для совместимости

    /**
     *
     * @var ActiveForm need for ActiveField
     */
    public $form = null;

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
     * Attribute what data will be selected by user
     *
     * @var string
     */
    public $dropdownAttribute = 'name';

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
     * Key value pairs where key it is type name and value is attribute name.
     * Value also can be an array with list of attributes that is a same type.
     *
     * @var array
     */
    public $attributeTypes = null; // Потом переделать и другие типы на использование данного свойства

    /**
     * Order is the property that contains data for sequence of model list.
     * It include in models view in format same as Order[<model->formName>][<model->id>].
     *
     * @var string
     */
    public $order = false;

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
            $model['filterAttribute'] = $this->filterAttribute;
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

        $this->getView()->registerJs('polyfield.push(' . Json::encode($model) . ')');

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
            'order' => Yii::t('app', 'Порядок'),
        ];
        $this->getView()->registerJs('polyfield.setTranslation(' . Json::encode($i18n) . ')');
    }
}
