# Public: Polyfield widget class that allows to add new model fields
class Polyfield

	constructor: ->
		jQuery('body').on 'blur', 'input[type="text"]', ->
			jQuery(this).val jQuery(this).val().trim()

	# Private: list of active models.
	models: {}

	# Public: array of autocomleting objects.
	completes: []

	# Public: add new model to monitoring by Polyfield
	#
	# model - The JSON {Object}.
	#
	# Returns the void.
	push: (model) ->
		unless typeof model is 'object'
			return console.log 'Bad identifier for polyfield ' + model

		# Number counter for model
		model.counter = 0
		# Tells if existing models are showen
		model.existsShowen = if model.exists then off else on

		@models[model.id] = model
		@appendExists(model.id)
		@bindEvent(model.id)

	# Public: binds event for a HEML element
	#
	# id - The HTML identifier of element as {String}.
	#
	# Returns the void as.
	bindEvent: (id) ->
		if typeof @models[id] is 'undefined'
			return console.log 'Can not find object for what need to bind event'
		button = jQuery('#button_' + id)
		button.on 'click', =>
			@hideExcess(id)
			@appendTemplate(id)

	# Public: hides excess models
	#
	# id - The HTML identifier of element as {String}.
	hideExcess: (id) ->
		if jQuery('.' + id).length
			jQuery('.' + id).collapsible('closeAll')

	# Public: Generates label HTML element
	#
	# * `forId` The identifier for what label creates as {String}.
	# * `name`  The label value as {String}.
	#
	# Returns the document element as Node.
	generateLabel: (forId, name) ->
		label = document.createElement 'label'
		label.setAttribute 'class', 'col-lg-3 control-label'
		label.setAttribute 'for', forId
		label.appendChild document.createTextNode name
		label

	# Private: Generates input HTML elmenet
	#
	# * `id`        The model unique identifier as {String}.
	# * `modelName` The model name as {String}.
	# * `attribute` The attribute name in model as {String}.
	# * `counter`   The sequence model number as {Number}.
	# * `value`     The value of attribute as {String}.
	# * `type`		The type of input ['text', 'hidden'] avalable as {String}
	# * `label`     The label for attribute as {String}.
	#
	# Returns the document element as Node.
	generateInput: (id, modelName, attribute, counter, value, type, label) ->
		value = '' if typeof value is 'undefined'
		type  = 'hidden' if typeof type is 'undefined'
		label = off if typeof label is 'undefined'

		formGroup = document.createElement 'div'
		formGroup.setAttribute 'class', 'form-group'

		formGroup.appendChild @generateLabel(attribute + counter, label) if label

		div = document.createElement 'div'
		div.setAttribute 'class', 'col-lg-5'

		input = document.createElement 'input'
		input.setAttribute 'type', type
		input.setAttribute 'name', "#{modelName}[#{counter}][#{attribute}]"
		unless type is 'hidden'
			inputId = attribute + id + counter;
			input.setAttribute 'id', inputId
			@addToAutocomplete inputId, modelName, attribute
		input.setAttribute 'class', 'form-control'
		input.setAttribute 'value', value

		div.appendChild input
		formGroup.appendChild div
		formGroup


	# Private: Generates select HTML element
	#
	# * `id`        The model unique identifier as {String}.
	# * `modelName` The model name as {string}.
	# * `attribute` The attribute name in model as {String}.
	# * `counter`   The sequence model number as {Number}.
	# * `label`     The label for attribute as {String}.
	# * `values`    The select option values as {Array}.
	# * `selected`  The option value that is selected as {String}.
	#
	# Returns the document element as Node.
	generateDropdown: (id, modelName, attribute, counter, label, values, selected) ->
		selected = false if typeof selected is 'undefined'
		formGroup = document.createElement 'div'
		formGroup.setAttribute 'class', 'form-group'

		formGroup.appendChild @generateLabel(attribute + counter, label)

		div = document.createElement 'div'
		div.setAttribute 'class', 'col-lg-5'

		select = document.createElement 'select'
		select.setAttribute 'name', "#{modelName}[#{counter}][id]"

		for value in values
			option = document.createElement 'option'
			option.setAttribute 'value', value.id
			option.appendChild document.createTextNode value[attribute]
			if Number(value.id) is Number(selected)
				option.setAttribute 'selected', true
			select.appendChild option

		selectId = attribute + id + counter;
		select.setAttribute 'id', selectId
		select.setAttribute 'class', 'form-control'

		div.appendChild select
		formGroup.appendChild div
		formGroup

	# Private: Generates the header of collapse HTML data
	#
	# * `id` 	     The identifier of model as {String}.
	# * `label`      The model caption as {String}.
	# * `counter`    The sequence number among models {Number}
	#
	# Returns the document element as Node.
	generateCollapsible: (id, label, counter) ->
		relativeId = id + counter;
		sectionId = 'section_' + relativeId

		collapsible = document.createElement 'div'
		collapsible.setAttribute 'id', sectionId
		collapsible.setAttribute 'class', id
		collapsible.appendChild document.createTextNode counter + '. ' + label
		collapsible.appendChild document.createElement 'span'

		closer = document.createElement 'div'
		closer.appendChild document.createTextNode 'x'
		closer.setAttribute 'id', 'exit_' + relativeId
		closer.setAttribute 'class', 'polyfield-exit'
		closer.setAttribute 'title', 'Удалить элемент'
		collapsible.appendChild closer
		@bindClose relativeId
		collapsible

	# Private: Generates container for collapsible structure
	#
	# * `contentBody` The set of attributes as {Node}.
	#
	# Returns the document element as Node.
	generateContainer: (contentBody) ->
		content = document.createElement 'div'
		content.setAttribute 'class', 'content'
		content.appendChild document.createElement 'div'
		content.appendChild contentBody

		container = document.createElement 'div'
		container.setAttribute 'class', 'container'
		container.appendChild content
		container

	# Public: generates template for a model
	#
	# id - unique identifier in model view scope {String}.
	appendTemplate: (id) ->
		model = @models[id]
		model.counter++
		sectionId = 'section_' + id + model.counter

		collapsible = @generateCollapsible id, model.label, model.counter

		contentBody = document.createElement 'p'

		unless model.dropdown
			for index, attribute of model.attributes
				contentBody.appendChild @generateInput id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]
		else
			contentBody.appendChild @generateDropdown id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues

		collapseFragment = document.createDocumentFragment()
		collapseFragment.appendChild collapsible
		collapseFragment.appendChild @generateContainer contentBody

		document.getElementById('content_' + id).appendChild collapseFragment
		jQuery('#' + sectionId).collapsible
			defaultOpen: "#{sectionId}"
		@bindAutocomplete()

	# Public: generates existing models structure in view
	#
	# * `id` The model unique identifier as {String}.
	appendExists: (id) ->
		model = @models[id]
		if model.existsShowen
			return
		for object in model.exists
			model.counter++
			sectionId = 'section_' + id + model.counter

			collapsible = @generateCollapsible id, model.label, model.counter
			contentBody = document.createElement 'p'

			unless model.dropdown
				for index, attribute of model.attributes
					contentBody.appendChild @generateInput id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]
			else
				contentBody.appendChild @generateDropdown id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, object['id']

			collapsibleFragment = document.createDocumentFragment()
			collapsibleFragment.appendChild collapsible
			collapsibleFragment.appendChild @generateContainer contentBody

			document.getElementById('content_' + id).appendChild collapsibleFragment
			jQuery('#' + sectionId).collapsible
				defaultOpen: "#{sectionId}"
			@bindAutocomplete()
		model.existsShowen = on

	# Public: bind close event to element by identifier
	#
	# id - The identifier of element as {String}.
	bindClose: (id) ->
		jQuery('body').on 'click', '#exit_' + id, =>
			if confirm('Вы уверены, что хотите выполнить удаление?')
				jQuery('#section_' + id).next().remove()
				jQuery('#section_' + id).remove()

	# Public: adds to autocompleting input elements
	#
	# inputId   - The html identifier of input as {Number}.
	# modelName - The model's name as {String}.
	# attribute - The attribute's name as {String}.
	addToAutocomplete: (inputId, modelName, attribute) ->
		@completes.push
			id: inputId
			modelName: modelName
			attribute: attribute

	# Public: binds autocomplete jQuery plugin for model input attribute
	bindAutocomplete: ->
		for object in @completes
			selector = jQuery '#' + object.id
			if typeof selector is 'undefined'
				console.error 'Bad selector identifier gets for input autocomplete'
			url = location.protocol + '//' + location.host + '/content/autocomplete'
			selector.autocomplete
				serviceUrl: url
				noSuggestionNotice: 'Результатов нет'
				deferRequestBy: 200
				params:
					modelName: object.modelName
					attributeName: object.attribute
		@completes = []

window.polyfield = new Polyfield()
