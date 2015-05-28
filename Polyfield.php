<?php

namespace kaile\polyfield;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use kaile\polyfield\assets\PolyfieldAsset;
use yii\helpers\Json;

/**
 * Widget that generates form with dynamic fields and dictionary filters for 
 * fill while user typing
 * 
 * @created 19.05.2015 13:10:47
 * @author Mihail Kornilov <fix-06 at yandex.ru>
 * 
 * @since 1.0
 */
class Polyfield extends Widget
{
	/**
	 *
	 * @var \yii\widgets\ActiveForm need for ActiveField
	 */
	public $form = null;
	/**
	 * Model for what attributes to be rendered
	 * 
	 * @var \yii\base\Model
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
	 * @inheritdoc
	 */
	public function init()
	{
		$this->attributes = array_keys($this->model->getAttributes());
		if (YII_DEBUG) {
			\Yii::$app->assetManager->forceCopy = true;
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
		
		$modelId = $this->model->formName() . $this->getId();
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
			'label' => ($this->displayName) ? $this->displayName : $this->model->formName(),
			'attributes' => $this->attributes,
			'attributeLabels' => $labels,
		];
		
		echo Html::endTag('fieldset');
		
		echo Html::beginTag('div', [
			'class' => 'row',
		]);
		
		echo Html::button(($this->buttonCaption) ? $this->buttonCaption : Yii::t('app', 'Добавить поле'), [
			'id' => 'button_' . $modelId,
			'class' => 'btn btn-success center-block'
		]);
		
		echo Html::endTag('div');
		
		$this->getView()->registerJs('polyfield.push(' . Json::encode($model) . ')');
	}
}
