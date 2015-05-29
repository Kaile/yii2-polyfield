# Public: Polyfield widget class that allows to add new model fields
class Polyfield

	constructor: ->
		jQuery('div').on 'blur', 'input[type="text"]', ->
			jQuery(this).val jQuery(this).val().trim()

	# Private: list of active models.
	models: {}

	# Public: add new model to monitoring by Polyfield
	#
	# model - The JSON {Object}.
	#
	# Returns the void.
	push: (model) ->
		console.log model
		unless typeof model is 'object'
			return console.log 'Bad identifier for polyfield ' + model

		# Number counter for model
		model.counter = 0

		@models[model.id] = model
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
	#
	# Returns the void as.
	hideExcess: (id) ->
		if jQuery('.' + id).length
			jQuery('.' + id).collapsible('closeAll')

	# Public: generates template for a model
	#
	# id - The HTML identifier as {String}.
	#
	# Returns the void as.
	appendTemplate: (id) ->
		model = @models[id]
		model.counter++

		sectionId = 'section_' + id + model.counter

		collapsible = document.createElement 'div'
		collapsible.setAttribute 'id', sectionId
		collapsible.setAttribute 'class', id
		collapsible.appendChild document.createTextNode model.counter + '. ' + model.label
		collapsible.appendChild document.createElement 'span'

		container = document.createElement 'div'
		container.setAttribute 'class', 'container'

		content = document.createElement 'div'
		content.setAttribute 'class', 'content'
		content.appendChild(
			document.createElement('div')
		)
		contentBody = document.createElement 'p'

		for index, attribute of model.attributes
			formGroup = document.createElement 'div'
			formGroup.setAttribute 'class', 'form-group'

			label = document.createElement 'label'
			label.setAttribute 'class', 'col-lg-3 control-label'
			label.setAttribute 'for', attribute + model.counter
			label.appendChild document.createTextNode model.attributeLabels[attribute]

			div = document.createElement 'div'
			div.setAttribute 'class', 'col-lg-5'

			if model.dropdown is yes
				input = document.createElement 'select'
				for dropdownValue in model.dropdownValues
					option = document.createElement 'option'
					option.setAttribute 'value', dropdownValue.id
					option.appendChild document.createTextNode dropdownValue[model.dropdownAttribute]
					input.appendChild option
			else
				input = document.createElement 'input'
				input.setAttribute 'type', 'text'
			input.setAttribute 'id', attribute + model.counter
			input.setAttribute 'class', 'form-control'
			input.setAttribute 'name', "#{model.name}[#{model.counter}][#{attribute}]"

			div.appendChild input
			formGroup.appendChild label
			formGroup.appendChild div
			contentBody.appendChild formGroup

			if model.dropdown then break

		content.appendChild contentBody
		container.appendChild content

		collapseFragment = document.createDocumentFragment()
		collapseFragment.appendChild collapsible
		collapseFragment.appendChild container

		document.getElementById('content_' + id).appendChild collapseFragment
		jQuery('#' + sectionId).collapsible
			defaultOpen: "#{sectionId}"


window.polyfield = new Polyfield()
