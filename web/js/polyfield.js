var Polyfield,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Polyfield = (function() {
  Polyfield.prototype.types = {
    STRING: 'string',
    DROPDOWN: 'dropdown',
    DATE: 'date',
    TEXT_BLOCK: 'editor'
  };

  Polyfield.prototype.inputTypes = {
    TEXT: 'text',
    DATE: 'date',
    STRING: 'string',
    BOOLEAN: 'boolean',
    DROPDOWN: 'dropdown'
  };

  function Polyfield() {
    jQuery('body').on('blur', 'input[type="text"]', function() {
      return jQuery(this).val(jQuery(this).val().trim());
    });
    this.i18n = {};
  }

  Polyfield.prototype.models = {};

  Polyfield.prototype.completes = [];

  Polyfield.prototype.ordersListener = {};

  Polyfield.prototype.push = function(model) {
    if (typeof model !== 'object') {
      return console.log('Bad identifier for polyfield ' + model);
    }
    model.counter = 0;
    model.existsShowen = model.exists ? false : true;
    this.models[model.id] = model;
    this.appendExists(model.id);
    return this.bindEvent(model.id);
  };

  Polyfield.prototype.bindEvent = function(id) {
    var button;
    if (typeof this.models[id] === 'undefined') {
      return console.log('Can not find object for what need to bind event');
    }
    button = jQuery('#button_' + id);
    return button.on('click', (function(_this) {
      return function() {
        _this.hideExcess(id);
        return _this.appendTemplate(id);
      };
    })(this));
  };

  Polyfield.prototype.hideExcess = function(id) {
    if (jQuery('.' + id).length) {
      return jQuery('.' + id).collapsible('closeAll');
    }
  };

  Polyfield.prototype.generateLabel = function(forId, name) {
    var label;
    label = document.createElement('label');
    label.setAttribute('class', 'col-lg-3 control-label');
    label.setAttribute('for', forId);
    label.appendChild(document.createTextNode(name));
    return label;
  };

  Polyfield.prototype.generateInput = function(id, modelName, attribute, counter, value, type, label) {
    var div, formGroup, input, inputId;
    if (typeof value === 'undefined') {
      value = '';
    }
    if (typeof type === 'undefined') {
      type = 'hidden';
    }
    if (typeof label === 'undefined') {
      label = false;
    }
    formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');
    if (label) {
      formGroup.appendChild(this.generateLabel(attribute + counter, label));
    }
    div = document.createElement('div');
    div.setAttribute('class', 'col-lg-5');
    input = document.createElement('input');
    input.setAttribute('type', type);
    input.setAttribute('name', modelName + "[" + counter + "][" + attribute + "]");
    if (type !== 'hidden') {
      inputId = attribute + id + counter;
      input.setAttribute('id', inputId);
      this.addToAutocomplete(inputId, modelName, attribute);
    }
    if (type === 'checkbox' && value) {
      input.setAttribute('checked', 'checked');
    }
    input.setAttribute('class', 'form-control');
    if (type !== 'checkbox') {
      input.setAttribute('value', value);
    } else {
      input.setAttribute('value', '1');
    }
    div.appendChild(input);
    formGroup.appendChild(div);
    return formGroup;
  };

  Polyfield.prototype.generateEditor = function(id, modelName, attribute, counter, value, type, label) {
    var div, formGroup, input, inputId, script, tinymceLang, tinymceScript;
    if (typeof value === 'undefined') {
      value = '';
    }
    if (typeof type === 'undefined') {
      type = 'hidden';
    }
    if (typeof label === 'undefined') {
      label = false;
    }
    formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');
    if (label) {
      formGroup.appendChild(this.generateLabel(attribute + counter, label));
    }
    div = document.createElement('div');
    div.setAttribute('class', 'col-lg-7');
    input = document.createElement('textarea');
    input.setAttribute('name', modelName + "[" + counter + "][" + attribute + "]");
    inputId = attribute + id + counter;
    input.setAttribute('id', inputId);
    input.setAttribute('class', 'form-control');
    input.appendChild(document.createTextNode(value));
    div.appendChild(input);
    if (typeof tinymce === 'undefined') {
      tinymceScript = document.createElement('script');
      tinymceScript.setAttribute('src', 'tinymce/timymce.min.js');
      body.appendChild(tinymceScript);
      tinymceLang = document.createElement('script');
      tinymceLang.setAttribute('src', 'tinymce/langs/ru.js');
      body.appendChild(tinymceLang);
    }
    script = document.createElement('script');
    script.appendChild(document.createTextNode("tinymce.init({selector: '#" + inputId + "', language: 'ru', plugins: [ 'advlist autolink lists link image charmap print preview hr anchor pagebreak', 'searchreplace wordcount visualblocks visualchars code fullscreen', 'insertdatetime media nonbreaking save table contextmenu directionality', 'emoticons template paste textcolor'], toolbar: ['undo redo | fontsizeselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor | print preview media']});"));
    div.appendChild(script);
    formGroup.appendChild(div);
    return formGroup;
  };

  Polyfield.prototype.generateOptions = function(values, attribute, selected) {
    var filter, j, len, option, options, value;
    if (typeof filter === 'undefined') {
      filter = false;
    }
    options = document.createDocumentFragment();
    values = values.sort(function(a, b) {
      var first, second;
      first = a[attribute].toUpperCase();
      second = b[attribute].toUpperCase();
      if (first > second) {
        return 1;
      }
      if (first < second) {
        return -1;
      }
      return 0;
    });
    for (j = 0, len = values.length; j < len; j++) {
      value = values[j];
      option = document.createElement('option');
      option.setAttribute('value', value.id);
      option.appendChild(document.createTextNode(value[attribute]));
      if (Number(value.id) === Number(selected)) {
        option.setAttribute('selected', true);
      }
      options.appendChild(option);
    }
    return options;
  };

  Polyfield.prototype.generateDropdown = function(id, modelName, attribute, counter, label, values, selected, filterAttr) {
    var ddFragment, div, emptyOption, filterDiv, filterFormGroup, filterSelect, filterValues, formGroup, select, selectId;
    if (typeof selected === 'undefined') {
      selected = false;
    }
    if (typeof filterAttr === 'undefined') {
      filterAttr = false;
    }
    formGroup = document.createElement('div');
    ddFragment = document.createDocumentFragment();
    formGroup.setAttribute('class', 'form-group');
    formGroup.appendChild(this.generateLabel(attribute + counter, label));
    div = document.createElement('div');
    div.setAttribute('class', 'col-lg-5');
    select = document.createElement('select');
    select.setAttribute('name', modelName + "[" + counter + "][id]");
    select.appendChild(this.generateOptions(values, attribute, selected));
    selectId = attribute + id + counter;
    select.setAttribute('id', selectId);
    select.setAttribute('class', 'form-control');
    if (filterAttr) {
      filterFormGroup = document.createElement('div');
      filterFormGroup.setAttribute('class', 'form-group');
      filterFormGroup.appendChild(this.generateLabel("filter" + counter, this.translate('filter')));
      filterSelect = document.createElement('select');
      filterSelect.setAttribute('id', "filter" + counter);
      filterValues = values.filter(function(value, index, array) {
        return !value[filterAttr];
      });
      emptyOption = document.createElement('option');
      emptyOption.setAttribute('value', 0);
      emptyOption.appendChild(document.createTextNode(this.translate('noFilter')));
      filterSelect.appendChild(emptyOption);
      filterSelect.appendChild(this.generateOptions(filterValues, attribute));
      filterSelect.setAttribute('class', 'form-control');
      filterDiv = div.cloneNode();
      filterDiv.appendChild(filterSelect);
      filterFormGroup.appendChild(filterDiv);
      ddFragment.appendChild(filterFormGroup);
      jQuery(filterSelect).on('change', (function(_this) {
        return function() {
          var $filter, $select, filteredValues;
          $filter = jQuery(filterSelect);
          $select = jQuery(select);
          $select.empty();
          filteredValues = values.filter(function(value, index, array) {
            if ($filter.val() === '0') {
              return true;
            }
            if (Number($filter.val()) === Number(value[filterAttr])) {
              return true;
            } else {
              return false;
            }
          });
          return select.appendChild(_this.generateOptions(filteredValues, attribute, selected));
        };
      })(this));
    }
    div.appendChild(select);
    formGroup.appendChild(div);
    ddFragment.appendChild(formGroup);
    return ddFragment;
  };

  Polyfield.prototype.generateDateInput = function(id, modelName, attribute, counter, value, type, label) {
    var divDate, formGroup, input, spanAddon, spanIcon;
    if (typeof value === 'undefined') {
      value = '';
    }
    if (typeof type === 'undefined') {
      type = 'hidden';
    }
    if (typeof label === 'undefined') {
      label = false;
    }
    formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');
    if (label) {
      formGroup.appendChild(this.generateLabel(attribute + counter, label));
    }
    divDate = document.createElement('div');
    divDate.setAttribute('class', 'col-lg-5 input-group date');
    input = document.createElement('input');
    input.setAttribute('class', 'form-control');
    input.setAttribute('type', type);
    input.setAttribute('name', modelName + "[" + counter + "][" + attribute + "]");
    input.setAttribute('value', value);
    spanAddon = document.createElement('span');
    spanAddon.setAttribute('class', 'input-group-addon');
    spanIcon = document.createElement('span');
    spanIcon.setAttribute('class', 'glyphicon glyphicon-calendar');
    spanAddon.appendChild(spanIcon);
    divDate.appendChild(input);
    divDate.appendChild(spanAddon);
    formGroup.appendChild(divDate);
    $(divDate).datetimepicker({
      locale: 'ru',
      viewMode: 'years',
      format: 'YYYY-MM-DD'
    });
    return formGroup;
  };

  Polyfield.prototype.generateOrder = function(modelId, modelName, counter) {
    var classSelector, ddFragment, div, formGroup, select, selectId;
    formGroup = document.createElement('div');
    ddFragment = document.createDocumentFragment();
    classSelector = "order-" + modelName;
    formGroup.setAttribute('class', 'form-group');
    formGroup.appendChild(this.generateLabel(modelName + modelId + counter, this.translate('order')));
    div = document.createElement('div');
    div.setAttribute('class', 'col-lg-offset-1 col-lg-3 text-center');
    select = document.createElement('select');
    select.setAttribute('name', modelName + "[" + counter + "][order]");
    select.appendChild(this.orderOptions(counter));
    this.updateOrder(classSelector, counter);
    selectId = modelName + modelId + counter;
    select.setAttribute('id', selectId);
    select.setAttribute('class', "form-control " + classSelector);
    div.appendChild(select);
    formGroup.appendChild(div);
    ddFragment.appendChild(formGroup);
    this.bindOrderListener(classSelector);
    return ddFragment;
  };

  Polyfield.prototype.orderOptions = function(counter) {
    var fragment, i, j, option, ref;
    fragment = document.createDocumentFragment();
    for (i = j = 1, ref = counter; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      option = document.createElement('option');
      if (i === counter) {
        option.setAttribute('selected', 'selected');
      }
      option.setAttribute('value', i);
      option.appendChild(document.createTextNode(i));
      fragment.appendChild(option);
    }
    return fragment;
  };

  Polyfield.prototype.updateOrder = function(classSelector, counter) {
    var $selects;
    $selects = $("." + classSelector);
    $selects.each(function() {
      var $this, i, j, optLen, ref, ref1, results;
      $this = $(this);
      optLen = $this.children('option').length;
      if (optLen < counter) {
        results = [];
        for (i = j = ref = optLen + 1, ref1 = counter; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
          results.push($this.append("<option>" + i + "</option>"));
        }
        return results;
      }
    });
  };

  Polyfield.prototype.bindOrderListener = function(classSelector) {
    if (typeof this.ordersListener[classSelector] === 'undefined') {
      $('body').on('focus click', "." + classSelector, (function(_this) {
        return function(e) {
          return _this.ordersListener[classSelector] = e.target.value;
        };
      })(this));
      $('body').on('change', "." + classSelector, (function(_this) {
        return function(e) {
          var freeValue, self;
          self = $(e.target);
          freeValue = _this.ordersListener[classSelector];
          if (freeValue !== self.val()) {
            return $("." + classSelector).each(function() {
              var $this;
              $this = $(this);
              if ($this.val() === e.target.value && !$this.is(self)) {
                return $this.val(freeValue);
              }
            });
          }
        };
      })(this));
    }
    return true;
  };

  Polyfield.prototype.generateCollapsible = function(id, label, counter) {
    var closer, collapsible, relativeId, sectionId;
    relativeId = id + counter;
    sectionId = 'section_' + relativeId;
    collapsible = document.createElement('div');
    collapsible.setAttribute('id', sectionId);
    collapsible.setAttribute('class', id);
    collapsible.appendChild(document.createTextNode(counter + '. ' + label));
    collapsible.appendChild(document.createElement('span'));
    closer = document.createElement('div');
    closer.appendChild(document.createTextNode('x'));
    closer.setAttribute('id', 'exit_' + relativeId);
    closer.setAttribute('class', 'polyfield-exit');
    closer.setAttribute('title', this.translate('deleteElement'));
    collapsible.appendChild(closer);
    this.bindClose(relativeId);
    return collapsible;
  };

  Polyfield.prototype.generateContainer = function(contentBody) {
    var container, content;
    content = document.createElement('div');
    content.setAttribute('class', 'content');
    content.appendChild(document.createElement('div'));
    content.appendChild(contentBody);
    container = document.createElement('div');
    container.setAttribute('class', 'container');
    container.appendChild(content);
    return container;
  };

  Polyfield.prototype.appendTemplate = function(id) {
    var attrType, attribute, collapseFragment, collapsible, contentBody, index, inputElement, model, ref, ref1, sectionId;
    model = this.models[id];
    model.counter++;
    sectionId = 'section_' + id + model.counter;
    collapsible = this.generateCollapsible(id, model.label, model.counter);
    contentBody = document.createElement('p');
    if (model.order) {
      contentBody.appendChild(this.generateOrder(id, model.name, model.counter));
    }
    if (model.attributeTypes) {
      ref = model.attributeTypes;
      for (attrType in ref) {
        attribute = ref[attrType];
        inputElement = (function() {
          switch (false) {
            case attrType !== this.inputTypes.STRING:
              return this.generateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]);
            case attrType !== this.inputTypes.DATE:
              return this.generateDateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]);
            case attrType !== this.inputTypes.TEXT:
              return this.generateEditor(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]);
            case attrType !== this.inputTypes.BOOLEAN:
              return this.generateInput(id, model.name, attribute, model.counter, '', 'checkbox', model.attributeLabels[attribute]);
            case attrType !== this.inputTypes.DROPDOWN:
              return this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, '', model.filterAttribute);
            default:
              return document.createElement('div');
          }
        }).call(this);
        contentBody.appendChild(inputElement);
      }
    } else {
      if (model.type === this.types.STRING || model.type === this.types.DATE) {
        ref1 = model.attributes;
        for (index in ref1) {
          attribute = ref1[index];
          if (indexOf.call(model.dateAttributes, attribute) >= 0) {
            contentBody.appendChild(this.generateDateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]));
            continue;
          } else {
            contentBody.appendChild(this.generateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]));
          }
        }
      } else if (model.type === this.types.DROPDOWN) {
        contentBody.appendChild(this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, '', model.filterAttribute));
      }
    }
    collapseFragment = document.createDocumentFragment();
    collapseFragment.appendChild(collapsible);
    collapseFragment.appendChild(this.generateContainer(contentBody));
    document.getElementById('content_' + id).appendChild(collapseFragment);
    jQuery('#' + sectionId).collapsible({
      defaultOpen: "" + sectionId
    });
    return this.bindAutocomplete();
  };

  Polyfield.prototype.appendExists = function(id) {
    var attrType, attribute, collapsible, collapsibleFragment, contentBody, index, inputElement, j, len, model, object, ref, ref1, ref2, sectionId;
    model = this.models[id];
    if (model.existsShowen) {
      return;
    }
    ref = model.exists;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      model.counter++;
      sectionId = 'section_' + id + model.counter;
      collapsible = this.generateCollapsible(id, model.label, model.counter);
      contentBody = document.createElement('p');
      if (model.order) {
        contentBody.appendChild(this.generateOrder(id, model.name, model.counter));
      }
      if (model.attributeTypes) {
        ref1 = model.attributeTypes;
        for (attrType in ref1) {
          attribute = ref1[attrType];
          inputElement = (function() {
            switch (false) {
              case attrType !== this.inputTypes.STRING:
                return this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]);
              case attrType !== this.inputTypes.DATE:
                return this.generateDateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]);
              case attrType !== this.inputTypes.TEXT:
                return this.generateEditor(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]);
              case attrType !== this.inputTypes.BOOLEAN:
                return this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'checkbox', model.attributeLabels[attribute]);
              case attrType !== this.inputTypes.DROPDOWN:
                return this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, object['id'], model.filterAttribute);
              default:
                return document.createElement('div');
            }
          }).call(this);
          contentBody.appendChild(inputElement);
        }
      } else {
        if (model.type === this.types.STRING || model.type === this.types.DATE || model.type === this.types.TEXT_BLOCK) {
          ref2 = model.attributes;
          for (index in ref2) {
            attribute = ref2[index];
            if (indexOf.call(model.dateAttributes, attribute) >= 0) {
              contentBody.appendChild(this.generateDateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]));
              continue;
            } else if (model.type === this.types.TEXT_BLOCK) {
              contentBody.appendChild(this.generateEditor(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]));
            } else {
              contentBody.appendChild(this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]));
            }
          }
        } else if (model.type === this.types.DROPDOWN) {
          contentBody.appendChild(this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, object['id'], model.filterAttribute));
        }
      }
      collapsibleFragment = document.createDocumentFragment();
      collapsibleFragment.appendChild(collapsible);
      collapsibleFragment.appendChild(this.generateContainer(contentBody));
      document.getElementById('content_' + id).appendChild(collapsibleFragment);
      jQuery('#' + sectionId).collapsible({
        defaultOpen: sectionId
      });
      this.bindAutocomplete();
    }
    return model.existsShowen = true;
  };

  Polyfield.prototype.bindClose = function(id) {
    return jQuery('body').on('click', '#exit_' + id, (function(_this) {
      return function() {
        if (confirm(_this.translate('deleteConfirmation'))) {
          jQuery('#section_' + id).next().remove();
          return jQuery('#section_' + id).remove();
        }
      };
    })(this));
  };

  Polyfield.prototype.addToAutocomplete = function(inputId, modelName, attribute) {
    return this.completes.push({
      id: inputId,
      modelName: modelName,
      attribute: attribute
    });
  };

  Polyfield.prototype.bindAutocomplete = function() {
    var j, len, object, ref, selector, url;
    ref = this.completes;
    for (j = 0, len = ref.length; j < len; j++) {
      object = ref[j];
      selector = jQuery('#' + object.id);
      if (typeof selector === 'undefined') {
        console.error('Bad selector identifier gets for input autocomplete');
      }
      url = location.protocol + '//' + location.host + '/content/autocomplete';
      selector.autocomplete({
        serviceUrl: url,
        noSuggestionNotice: this.translate('noResults'),
        deferRequestBy: 200,
        params: {
          modelName: object.modelName,
          attributeName: object.attribute
        }
      });
    }
    return this.completes = [];
  };

  Polyfield.prototype.setTranslation = function(translation) {
    return this.i18n = translation;
  };

  Polyfield.prototype.translate = function(textParam) {
    if (typeof this.i18n[textParam] !== 'undefined') {
      return this.i18n[textParam];
    } else {
      return textParam;
    }
  };

  return Polyfield;

})();

window.polyfield = new Polyfield();
