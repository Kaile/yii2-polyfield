# Public: Polyfield widget class that allows to add new model fields
class Polyfield
    types:
        STRING: 'string'
        DROPDOWN: 'dropdown'
        DATE: 'date'
        TEXT_BLOCK: 'editor'

    inputTypes:
        TEXT: 'text'
        DATE: 'date'
        STRING: 'string'
        BOOLEAN: 'boolean'
        DROPDOWN: 'dropdown'
        SELECT2: 'select2'
        HIDDEN: 'hidden'

    constructor: ->
        jQuery('body').on 'blur', 'input[type="text"]', ->
            jQuery(this).val jQuery(this).val().trim()

        @i18n = {}

    # Private: list of active models.
    models: {}

    # Public: array of autocomleting objects.
    completes: []

    # Public: contains statuses of orders listeners
    ordersListener: {}

    # Public: add new model to monitoring by Polyfield
    #
    # * `model` - The JSON {Object}.
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
    # * `id` - The HTML identifier of element as {String}.
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
    # * `id` - The HTML identifier of element as {String}.
    hideExcess: (id) ->
        if jQuery('.' + id).length
            jQuery('.' + id).collapsible('closeAll')

    # Public: Generates label HTML element
    #
    # * `forId` The identifier for what label creates as {String}.
    # * `name`  The label value as {String}.
    #
    # Returns the document element as Node.
    generateLabel: (forId, name, htmlClass) ->
        htmlClass = htmlClass || 'col-xs-4 col-sm-4 col-md-3 col-lg-3'
        label = document.createElement 'label'
        label.setAttribute 'class', "#{htmlClass} control-label"
        label.setAttribute 'for', forId
        label.appendChild document.createTextNode name
        return label

    # Private: Generates input HTML elmenet
    #
    # * `id`        The model unique identifier as {String}.
    # * `modelName` The model name as {String}.
    # * `attribute` The attribute name in model as {String}.
    # * `counter`   The sequence model number as {Number}.
    # * `value`     The value of attribute as {String}.
    # * `type`      The type of input ['text', 'hidden', 'checkbox'] avalable as {String}
    # * `label`     The label for attribute as {String}.
    #
    # Returns the document element as Node.
    generateInput: (id, modelName, attribute, counter, value, type, label, autocomplete) ->
        value = '' if typeof value is 'undefined' or not value
        type  = 'hidden' if typeof type is 'undefined'
        label = off if typeof label is 'undefined'
        autocomplete = true if typeof autocomplete is 'undefined';

        formGroup = document.createElement 'div'
        formGroup.setAttribute 'class', 'form-group'

        unless type is @inputTypes.HIDDEN
            formGroup.appendChild @generateLabel(attribute + counter, label) if label

        div = document.createElement 'div'
        div.setAttribute 'class', 'col-xs-6 col-sm-6 col-md-7 col-lg-7'

        input = document.createElement 'input'
        input.setAttribute 'type', type
        input.setAttribute 'name', "#{modelName}[#{counter}][#{attribute}]"
        unless type is @inputTypes.HIDDEN
            inputId = attribute + id + counter;
            input.setAttribute 'id', inputId

            if autocomplete is on
                @addToAutocomplete inputId, modelName, attribute

        if type is 'checkbox' and value then input.setAttribute 'checked', 'checked'

        input.setAttribute 'class', 'form-control'
        unless type is 'checkbox'
            input.setAttribute 'value', value
        else
            input.setAttribute 'value', '1'

        div.appendChild input
        formGroup.appendChild div
        formGroup

    # Private: Generates textarea editor elmenet
    #
    # * `id`        The model unique identifier as {String}.
    # * `modelName` The model name as {String}.
    # * `attribute` The attribute name in model as {String}.
    # * `counter`   The sequence model number as {Number}.
    # * `value`     The value of attribute as {String}.
    # * `type`        The type of input ['text', 'hidden'] avalable as {String}
    # * `label`     The label for attribute as {String}.
    #
    # Returns the document element as Node.
    generateEditor: (id, modelName, attribute, counter, value, type, label, editorConfig) ->
        value = '' if typeof value is 'undefined'
        type  = 'hidden' if typeof type is 'undefined'
        label = off if typeof label is 'undefined'

        formGroup = document.createElement 'div'
        formGroup.setAttribute 'class', 'form-group'

        formGroup.appendChild @generateLabel(attribute + counter, label, 'col-xs-1') if label

        div = document.createElement 'div'
        div.setAttribute 'class', 'col-xs-9'

        input = document.createElement 'textarea'
        input.setAttribute 'name', "#{modelName}[#{counter}][#{attribute}]"

        inputId = attribute + id + counter;
        input.setAttribute 'id', inputId
        input.setAttribute 'class', 'form-control'
        input.appendChild document.createTextNode value

        div.appendChild input

        script = document.createElement 'script'

        editorConfig = editorConfig.replace(/^\{/, "{\"selector\": \"##{inputId}\",");
        script.appendChild document.createTextNode "tinymce.init(JSON.parse('#{editorConfig}'));"
        div.appendChild script

        formGroup.appendChild div
        formGroup

    # Private: Generates option tags for select list
    #
    # * `values`      The options values as {Array}
    # * `attribute`   The attribute value of what takes as {String}
    # * `selected`    The selected element identifier as {Number}
    # * `sortAttr`  The option for add attribute in accordance with which options sorted
    # * `attributePrefix` The option add attribute values as prefix for current attribute values
    # * `valueAttribute`  The attribute name value of it will be seted in options values
    # * `exists`    The data with existing values
    # * `template`  Template for showed attributes
    # * `excludeExistingValues` enable/disable show in list existing values
    #
    # Returns the document element as Node
    generateOptions: (values, attribute, selected, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues, emptyFirstOption) ->
        attributePrefix = '' if typeof attributePrefix is 'undefined'
        filter = off if typeof filter is 'undefined'
        sortAttr = sortAttr or attribute
        valueAttribute = 'id' unless valueAttribute
        exists = [] unless exists
        options = document.createDocumentFragment()
        emptyFirstOption = yes if emptyFirstOption is 'undefined'

        if emptyFirstOption
            # Set empty option
            options.appendChild document.createElement 'option'

            # Set empty option is selected if not sets exists values
            unless exists
                options[0].setAttribute 'selected', yes

        if values.sort
            values = values.sort (a, b) ->
                unless a[sortAttr]
                    return -1
                unless b[sortAttr]
                    return 1
                first = a[sortAttr].toUpperCase()
                second = b[sortAttr].toUpperCase()
                if first > second then return 1
                if first < second then return -1
                0

            existingValues = exists.map (value) ->
                value['id']

            if excludeExistingValues
                values = values.filter (value) ->
                    existingValues.indexOf(value['id']) is -1

            for value in values
                optionValue = template;

                for k, v of value
                    optionValue = optionValue.replace("{#{k}}", v)

                if attributePrefix.length
                    optionValue = value[attributePrefix] + ' - ' + optionValue
                option = document.createElement 'option'
                option.setAttribute 'value', value[valueAttribute]
                option.appendChild document.createTextNode optionValue
                if String(value[valueAttribute]) is String(selected)
                    option.setAttribute 'selected', true
                options.appendChild option
        else
            for key, value of values
                optionValue = value
                option = document.createElement 'option'
                option.setAttribute 'value', key
                option.appendChild document.createTextNode optionValue
                if String(key) is String(selected)
                    option.setAttribute 'selected', true
                options.appendChild option
        return options

    # Private: Generates select HTML element
    #
    # * `id`        The model unique identifier as {String}.
    # * `modelName` The model name as {string}.
    # * `attribute` The attribute name in model as {String}.
    # * `counter`   The sequence model number as {Number}.
    # * `label`     The label for attribute as {String}.
    # * `values`    The select option values as {Array}.
    # * `selected`  The option value that is selected as {String}.
    # * `filterAttr` The option for add filter dropdown element
    # * `sortAttr`  The option for add attribute in accordance with which options sorted
    # * `attributePrefix` The option add attribute values as prefix for current attribute values
    # * `valueAttribute`  The attribute name value of it will be seted in options values
    # * `exists`    The data with existing values
    # * `template`  Template for showed attributes
    # * `excludeExistingValues` enable/disable show in list existing values
    #
    # Returns the document element as Node.
    generateDropdown: (id, modelName, attribute, counter, label, values, selected, filterAttr, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues, emptyFirstOption) ->
        attributePrefix = '' if typeof attributePrefix is 'undefined'
        selected = no if typeof selected is 'undefined'
        filterAttr = off if typeof filterAttr is 'undefined'
        formGroup = document.createElement 'div'
        ddFragment = document.createDocumentFragment()
        selectId = attribute + id + counter;
        emptyFirstOption= yes if typeof emptyFirstOption is 'undefined'

        formGroup.setAttribute 'class', 'form-group'
        formGroup.appendChild @generateLabel(selectId, label)

        div = document.createElement 'div'
        div.setAttribute 'class', 'col-xs-6 col-sm-6 col-md-7 col-lg-7'

        select = document.createElement 'select'
        select.setAttribute 'name', "#{modelName}[#{counter}][#{valueAttribute}]"

        select.appendChild @generateOptions(values, attribute, selected, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues, emptyFirstOption)
        select.setAttribute 'id', selectId
        select.setAttribute 'class', 'form-control select2'

        if filterAttr
            filterFormGroup = document.createElement 'div'
            filterFormGroup.setAttribute 'class', 'form-group'
            filterFormGroup.appendChild @generateLabel("filter#{counter}", @translate('filter'))
            filterSelect = document.createElement 'select'
            filterSelect.setAttribute 'id', "filter#{counter}"
            filterValues = values.filter (value, index, array) -> not value[filterAttr]

            if emptyFirstOption
                emptyOption = document.createElement 'option'
                emptyOption.setAttribute 'value', 0
                emptyOption.appendChild document.createTextNode @translate 'noFilter'
                filterSelect.appendChild emptyOption

            filterSelect.appendChild @generateOptions(filterValues, attribute, null, sortAttr, attributePrefix, valueAttribute, null, template, excludeExistingValues, emptyFirstOption)
            filterSelect.setAttribute 'class', 'form-control'
            filterDiv = div.cloneNode()
            filterDiv.appendChild filterSelect
            filterFormGroup.appendChild filterDiv

            ddFragment.appendChild filterFormGroup

            jQuery(filterSelect).on 'change', =>
                filterValues = (filterVal, values, filterAttr) ->
                    filterVal = Number(filterVal)
                    if filterVal is 0
                        return values
                    else
                        filtered = values.filter (value) ->
                            if filterVal is Number(value[filterAttr])
                                yes
                            else
                                no
                        if filtered.length
                            for item in filtered
                                filtered = filtered.concat(filterValues(item.id, values, filterAttr))
                        return filtered

                $filter = jQuery filterSelect
                $select = jQuery select
                $select.empty()

                filteredValues = filterValues($filter.val(), values, filterAttr)
                select.appendChild @generateOptions(filteredValues, attribute, selected, sortAttr, attributePrefix, valueAttribute, null, template, excludeExistingValues, emptyFirstOption)

        div.appendChild select
        formGroup.appendChild div

        ddFragment.appendChild formGroup
        return ddFragment

    # Private: Generates the datepicker input field
    #
    # * `id`        The model unique identifier as {String}.
    # * `modelName` The model name as {String}.
    # * `attribute` The attribute name in model as {String}.
    # * `counter`   The sequence model number as {Number}.
    # * `value`     The value of attribute as {String}.
    # * `type`      The type of input ['text', 'hidden'] avalable as {String}
    # * `label`     The label for attribute as {String}.
    #
    # Returns the document element as Node.
    generateDateInput: (id, modelName, attribute, counter, value, type, label) ->
        value = '' if typeof value is 'undefined'
        type  = 'hidden' if typeof type is 'undefined'
        label = off if typeof label is 'undefined'

        formGroup = document.createElement 'div'
        formGroup.setAttribute 'class', 'form-group'

        formGroup.appendChild @generateLabel(attribute + counter, label) if label

        divDate = document.createElement 'div'
        divDate.setAttribute 'class', 'col-lg-5 input-group date'

        input = document.createElement 'input'
        input.setAttribute 'class', 'form-control'
        input.setAttribute 'type', type
        input.setAttribute 'name', "#{modelName}[#{counter}][#{attribute}]"
        input.setAttribute 'value', value

        spanAddon = document.createElement 'span'
        spanAddon.setAttribute 'class', 'input-group-addon'

        spanIcon = document.createElement 'span'
        spanIcon.setAttribute 'class', 'glyphicon glyphicon-calendar'

        spanAddon.appendChild spanIcon
        divDate.appendChild input
        divDate.appendChild spanAddon
        formGroup.appendChild divDate

        $(divDate).datetimepicker(
            locale: 'ru'
            viewMode: 'years'
            format: 'YYYY-MM-DD'
            keepInvalid: on
        )

        formGroup

    # Private: Generates order dropdwn list
    #
    # * `modelId`   The model unique identifier as {String}.
    # * `modelName` The model name as {String}.
    # * `counter`   The sequence model number as {Number}.
    #
    # Returns the document element as Node.
    generateOrder: (modelId, modelName, counter) ->
        formGroup = document.createElement 'div'
        ddFragment = document.createDocumentFragment()
        classSelector = "order-#{modelName}"

        formGroup.setAttribute 'class', 'form-group'
        formGroup.appendChild @generateLabel(modelName + modelId + counter, @translate('order'))

        div = document.createElement 'div'
        div.setAttribute 'class', 'col-lg-offset-1 col-lg-3 text-center'

        select = document.createElement 'select'
        select.setAttribute 'name', "#{modelName}[#{counter}][order]"

        select.appendChild @orderOptions counter
        @updateOrder classSelector, counter

        selectId = modelName + modelId + counter;
        select.setAttribute 'id', selectId
        select.setAttribute 'class', "form-control #{classSelector}"

        div.appendChild select
        formGroup.appendChild div

        ddFragment.appendChild formGroup

        @bindOrderListener classSelector

        ddFragment

    orderOptions: (counter) ->
        fragment = document.createDocumentFragment()
        for i in [1..counter]
            option = document.createElement 'option'
            if i is counter
                option.setAttribute 'selected', 'selected'
            option.setAttribute 'value', i
            option.appendChild document.createTextNode i
            fragment.appendChild option
        fragment

    updateOrder: (classSelector, counter) ->
        $selects = $(".#{classSelector}");

        $selects.each ->
            $this = $(this)
            optLen = $this.children('option').length
            if optLen < counter
                for i in [(optLen + 1)..counter]
                    $this.append "<option>#{i}</option>"
        return

    bindOrderListener: (classSelector) ->
        if typeof @ordersListener[classSelector] is 'undefined'
            $('body').on 'focus click', ".#{classSelector}", (e) =>
                @ordersListener[classSelector] = e.target.value

            $('body').on 'change', ".#{classSelector}", (e) =>
                self = $(e.target)
                freeValue = @ordersListener[classSelector]
                unless freeValue is self.val()
                    $(".#{classSelector}").each ->
                        $this = $(this)
                        if $this.val() is e.target.value and not $this.is(self)
                            $this.val(freeValue)
        true

    # Private: Generates the header of collapse HTML data
    #
    # * `id`          The identifier of model as {String}.
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
        closer.setAttribute 'title', @translate('deleteElement')
        collapsible.appendChild closer
        @bindClose relativeId
        return collapsible

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
        container.setAttribute 'class', ''
        container.appendChild content
        return container

    # Public: generates template for a model
    #
    # * `id` - unique identifier in model view scope {String}.
    appendTemplate: (id) ->
        model = @models[id]
        model.counter++
        sectionId = 'section_' + id + model.counter

        collapsible = @generateCollapsible id, model.label, model.counter

        contentBody = document.createElement 'p'

        if model.order
            contentBody.appendChild @generateOrder id, model.name, model.counter

        if typeof model.attributeTypes.length is 'undefined'
            for attribute, attrType of model.attributeTypes
                attrValues = null;
                if typeof attrType is 'object'
                    attrValues = attrType.data
                    attrType = attrType.type
                inputElement = switch
                    when attrType is @inputTypes.STRING then @generateInput id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.autocomplete
                    when attrType is @inputTypes.DATE then @generateDateInput id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]
                    when attrType is @inputTypes.TEXT then @generateEditor id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.editorConfig
                    when attrType is @inputTypes.HIDDEN then @generateInput id, model.name, attribute, model.counter, '', 'hidden', model.attributeLabels[attribute]
                    when attrType is @inputTypes.BOOLEAN then @generateInput id, model.name, attribute, model.counter, '', 'checkbox', model.attributeLabels[attribute]
                    when attrType is @inputTypes.DROPDOWN then @generateDropdown id, model.name, attribute, model.counter, model.attributeLabels[attribute], attrValues ||model.dropdownValues, '', model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, attribute, (if model.dropdownUnique then model.exists else []), model.dropdownAttributeTemplate, model.excludeExistingValues, model.dropdownEmptyFirstOption
                    else document.createElement 'div'
                contentBody.appendChild inputElement
        else
            if model.type is @types.STRING or model.type is @types.DATE
                for index, attribute of model.attributes
                    if attribute in model.dateAttributes
                        contentBody.appendChild @generateDateInput id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]
                        continue
                    else
                        contentBody.appendChild @generateInput id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.autocomplete
            else if model.type is @types.DROPDOWN
                contentBody.appendChild @generateDropdown id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, '', model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, model.dropdownValueAttribute, (if model.dropdownUnique then model.exists else []), model.dropdownAttributeTemplate, model.excludeExistingValues, model.dropdownEmptyFirstOption

        collapseFragment = document.createDocumentFragment()
        collapseFragment.appendChild collapsible
        collapseFragment.appendChild @generateContainer contentBody

        content_ = document.getElementById('content_' + id)
        content_.appendChild collapseFragment
        jQuery('#' + sectionId).collapsible
            defaultOpen: "#{sectionId}"
        @createSelect2(sectionId, model, model.dropdownFocus)
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

            if model.order
                contentBody.appendChild @generateOrder id, model.name, model.counter

            if typeof model.attributeTypes.length is 'undefined'
                for attribute, attrType of model.attributeTypes
                    attrValues = null;
                    dropdownValueAttribute = model.dropdownValueAttribute;
                    if typeof attrType is 'object'
                        attrValues = attrType.data
                        dropdownValueAttribute = attribute
                        attrType = attrType.type
                    inputElement = switch
                        when attrType is @inputTypes.STRING then @generateInput id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.autocomplete
                        when attrType is @inputTypes.DATE then @generateDateInput id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]
                        when attrType is @inputTypes.TEXT then @generateEditor id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.editorConfig
                        when attrType is @inputTypes.HIDDEN then @generateInput id, model.name, attribute, model.counter, object[attribute], 'hidden', model.attributeLabels[attribute]
                        when attrType is @inputTypes.BOOLEAN then @generateInput id, model.name, attribute, model.counter, object[attribute], 'checkbox', model.attributeLabels[attribute]
                        when attrType is @inputTypes.DROPDOWN then @generateDropdown id, model.name, attribute, model.counter, model.attributeLabels[attribute], attrValues || model.dropdownValues, object[dropdownValueAttribute], model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, attribute, [], model.dropdownAttributeTemplate, model.excludeExistingValues, model.dropdownEmptyFirstOption
                        else document.createElement 'div'
                    contentBody.appendChild inputElement
            else
                if model.type is @types.STRING or model.type is @types.DATE or model.type is @types.TEXT_BLOCK
                    for index, attribute of model.attributes
                        if attribute in model.dateAttributes
                            contentBody.appendChild @generateDateInput id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]
                            continue
                        else if model.type is @types.TEXT_BLOCK
                            contentBody.appendChild @generateEditor id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.editorConfig
                        else
                            contentBody.appendChild @generateInput id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.autocomplete
                else if model.type is @types.DROPDOWN
                    contentBody.appendChild @generateDropdown id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, object[model.dropdownValueAttribute], model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, model.dropdownValueAttribute, [], model.dropdownAttributeTemplate, model.excludeExistingValues, model.dropdownEmptyFirstOption

            collapsibleFragment = document.createDocumentFragment()
            collapsibleFragment.appendChild collapsible
            collapsibleFragment.appendChild @generateContainer contentBody

            content_ = document.getElementById('content_' + id)
            content_.appendChild collapsibleFragment
            jQuery('#' + sectionId).collapsible
                defaultOpen: sectionId
            @createSelect2(sectionId, model)
            @bindAutocomplete()
        model.existsShowen = on

    # Public: bind close event to element by identifier
    #
    # * `id` - The identifier of element as {String}.
    bindClose: (id) ->
        jQuery('body').on 'click', '#exit_' + id, =>
            if confirm(@translate('deleteConfirmation'))
                jQuery('#section_' + id).next().remove()
                jQuery('#section_' + id).remove()

    # Public: adds to autocompleting input elements
    #
    # * `inputId`   - The html identifier of input as {Number}.
    # * `modelName` - The model's name as {String}.
    # * `attribute` - The attribute's name as {String}.
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
                noSuggestionNotice: @translate('noResults')
                deferRequestBy: 200
                params:
                    modelName: object.modelName
                    attributeName: object.attribute
                triggerSelectOnValidInput: false
        @completes = []

    createSelect2: (sectionId, model, opened = false) ->
        selector = jQuery("##{sectionId}").next().contents().find('select.select2')

        select2Params =
            allowClear: true

        if model.dropdownDataUrl
            select2Params.ajax =
                url: model.dropdownDataUrl
                delay: 400
                dataType: 'json'
                data: (params) ->
                    [model.dropdownDataUrlSearchParam]: params.term
                    page: params.page || 1
                    prefix: model.dropdownPrefixAttribute if model.dropdownPrefixAttribute
                    template: model.dropdownAttributeTemplate if model.dropdownAttributeTemplate

        select2 = selector.select2 select2Params
        select2.on('select2:open', () => document.querySelector('.select2-search__field').focus())

        if opened
            selector.select2('open')

    # Public: sets translation parameters for polyfield widget
    #
    # * `translation` - The plain object with param keys as variables and values
    #                 as translations as {Object}
    setTranslation: (translation) ->
        @i18n = translation

    # Private: translates given parameter in language text
    #
    # * `textParam` - key by what searchs the transled text
    # Returns translation if it exists and `textParam` value else as String
    translate: (textParam) ->
        unless typeof @i18n[textParam] is 'undefined'
            @i18n[textParam]
        else
            textParam

window.polyfield = new Polyfield()