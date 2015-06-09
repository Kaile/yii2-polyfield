var Polyfield;

Polyfield = (function() {
  function Polyfield() {
    jQuery('body').on('blur', 'input[type="text"]', function() {
      return jQuery(this).val(jQuery(this).val().trim());
    });
  }

  Polyfield.prototype.models = {};

  Polyfield.prototype.completes = [];

  Polyfield.prototype.push = function(model) {
    if (typeof model !== 'object') {
      return console.log('Bad identifier for polyfield ' + model);
    }
    model.counter = 0;
    model.existsShowen = model.exists ? false : true;
    this.models[model.id] = model;
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
    input.setAttribute('class', 'form-control');
    input.setAttribute('value', value);
    div.appendChild(input);
    formGroup.appendChild(div);
    return formGroup;
  };

  Polyfield.prototype.generateDropdown = function(id, modelName, attribute, counter, label, values) {
    var div, formGroup, i, len, option, select, selectId, value;
    formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');
    formGroup.appendChild(this.generateLabel(attribute + counter, label));
    div = document.createElement('div');
    div.setAttribute('class', 'col-lg-5');
    select = document.createElement('select');
    select.setAttribute('name', modelName + "[" + counter + "][id]");
    for (i = 0, len = values.length; i < len; i++) {
      value = values[i];
      option = document.createElement('option');
      option.setAttribute('value', value.id);
      option.appendChild(document.createTextNode(value[attribute]));
      select.appendChild(option);
    }
    selectId = attribute + id + counter;
    select.setAttribute('id', selectId);
    select.setAttribute('class', 'form-control');
    div.appendChild(select);
    formGroup.appendChild(div);
    return formGroup;
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
    closer.setAttribute('title', 'Удалить элемент');
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
    var attribute, collapseFragment, collapsible, contentBody, index, model, ref, sectionId;
    model = this.models[id];
    model.counter++;
    sectionId = 'section_' + id + model.counter;
    collapsible = this.generateCollapsible(id, model.label, model.counter);
    contentBody = document.createElement('p');
    if (!model.dropdown) {
      ref = model.attributes;
      for (index in ref) {
        attribute = ref[index];
        contentBody.appendChild(this.generateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]));
      }
    } else {
      contentBody.appendChild(this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues));
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

  Polyfield.prototype.bindClose = function(id) {
    return jQuery('body').on('click', '#exit_' + id, (function(_this) {
      return function() {
        if (confirm('Вы уверены, что хотите выполнить удаление?')) {
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
    var i, len, object, ref, selector, url;
    ref = this.completes;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      selector = jQuery('#' + object.id);
      if (typeof selector === 'undefined') {
        console.error('Bad selector identifier gets for input autocomplete');
      }
      url = location.protocol + '//' + location.host + '/content/autocomplete';
      selector.autocomplete({
        serviceUrl: url,
        noSuggestionNotice: 'Результатов нет',
        deferRequestBy: 200,
        params: {
          modelName: object.modelName,
          attributeName: object.attribute
        }
      });
    }
    return this.completes = [];
  };

  return Polyfield;

})();

window.polyfield = new Polyfield();
