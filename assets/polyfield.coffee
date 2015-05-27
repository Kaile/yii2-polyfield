# Public: Polyfield widget class that allows to add new model fields
class Polyfield
	# Private: list of active models.
	models: {}

	# Public: add new model to monitoring by Polyfield
	#
	# id - The HTML identifier of element as {String}.
	#
	# Returns the void.
	push: (id) ->
		console.log id
		selectorId = jQuery('#' + id);
		unless selectorId.length
			return console.log 'Bad identifier for polyfield ' + id

		model = {}
		model.selector = selectorId
		# jQuery selector where model will be rendered
		model.container = []
		# String name of model
		model.name = no
		# String human-readeable name of model
		model.label = no
		# Number counter for model
		model.counter = 0
		# Array attribute list of model
		model.attribute = []
		# Array template for attribute
		model.attributeLabel = []

		selectorId
			.find('span')
			.each( (index) ->
				span =  $(this)
				model.name = span.attr('data-model-name') if model.name is no
				model.label = span.attr('data-model-label') if model.label is no
				model.attribute[index] = span.attr('data-attribute-name')
				model.attributeLabel[index] = span.attr('data-attribute-label')
			)
		@models[id] = model
		@bindEvent(id)

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
		model = @models[id]
		return unless model.container.length
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
		model.container[model.counter] = sectionId

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

		for i in [0..model.attribute.length-1]
			formGroup = document.createElement 'div'
			formGroup.setAttribute 'class', 'form-group'

			label = document.createElement 'label'
			label.setAttribute 'class', 'col-lg-3 control-label'
			label.setAttribute 'for', model.attribute[i] + model.counter
			label.appendChild document.createTextNode model.attributeLabel[i]

			div = document.createElement 'div'
			div.setAttribute 'class', 'col-lg-5'

			input = document.createElement 'input'
			input.setAttribute 'type', 'text'
			input.setAttribute 'id', model.attribute[i] + model.counter
			input.setAttribute 'class', 'form-control'
			input.setAttribute 'name', "#{model.name}[#{model.counter}][#{model.attribute[i]}]"

			div.appendChild input
			formGroup.appendChild label
			formGroup.appendChild div
			contentBody.appendChild formGroup

		content.appendChild contentBody
		container.appendChild content

		collapseFragment = document.createDocumentFragment()
		collapseFragment.appendChild collapsible
		collapseFragment.appendChild container

		document.getElementById('content_' + id).appendChild collapseFragment
		jQuery('#' + sectionId).collapsible
			defaultOpen: "#{sectionId}"

window.polyfield = new Polyfield()
