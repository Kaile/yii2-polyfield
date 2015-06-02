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

  Polyfield.prototype.appendTemplate = function(id) {
    var attribute, closer, collapseFragment, collapsible, container, content, contentBody, div, dropdownValue, formGroup, i, index, input, inputId, label, len, model, option, ref, ref1, sectionId;
    model = this.models[id];
    model.counter++;
    sectionId = 'section_' + id + model.counter;
    collapsible = document.createElement('div');
    collapsible.setAttribute('id', sectionId);
    collapsible.setAttribute('class', id);
    collapsible.appendChild(document.createTextNode(model.counter + '. ' + model.label));
    collapsible.appendChild(document.createElement('span'));
    closer = document.createElement('div');
    closer.appendChild(document.createTextNode('x'));
    closer.setAttribute('id', 'exit_' + id + model.counter);
    closer.setAttribute('class', 'polyfield-exit');
    closer.setAttribute('title', 'Удалить элемент');
    collapsible.appendChild(closer);
    this.bindClose(id + model.counter);
    container = document.createElement('div');
    container.setAttribute('class', 'container');
    content = document.createElement('div');
    content.setAttribute('class', 'content');
    content.appendChild(document.createElement('div'));
    contentBody = document.createElement('p');
    ref = model.attributes;
    for (index in ref) {
      attribute = ref[index];
      formGroup = document.createElement('div');
      formGroup.setAttribute('class', 'form-group');
      label = document.createElement('label');
      label.setAttribute('class', 'col-lg-3 control-label');
      label.setAttribute('for', attribute + model.counter);
      label.appendChild(document.createTextNode(model.attributeLabels[attribute]));
      div = document.createElement('div');
      div.setAttribute('class', 'col-lg-5');
      if (model.dropdown === true) {
        input = document.createElement('select');
        input.setAttribute('name', model.name + "[" + model.counter + "][id]");
        ref1 = model.dropdownValues;
        for (i = 0, len = ref1.length; i < len; i++) {
          dropdownValue = ref1[i];
          option = document.createElement('option');
          option.setAttribute('value', dropdownValue.id);
          option.appendChild(document.createTextNode(dropdownValue[model.dropdownAttribute]));
          input.appendChild(option);
        }
      } else {
        input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('name', model.name + "[" + model.counter + "][" + attribute + "]");
      }
      inputId = attribute + id + model.counter;
      input.setAttribute('id', inputId);
      input.setAttribute('class', 'form-control');
      div.appendChild(input);
      formGroup.appendChild(label);
      formGroup.appendChild(div);
      contentBody.appendChild(formGroup);
      if (model.dropdown === 'yes') {
        break;
      } else {
        this.addToAutocomplete(inputId, model.name, attribute);
      }
    }
    content.appendChild(contentBody);
    container.appendChild(content);
    collapseFragment = document.createDocumentFragment();
    collapseFragment.appendChild(collapsible);
    collapseFragment.appendChild(container);
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
    var i, len, object, ref, results, selector, url;
    ref = this.completes;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      selector = jQuery('#' + object.id);
      if (typeof selector === 'undefined') {
        console.error('Bad selector identifier gets for input autocomplete');
      }
      url = location.protocol + '//' + location.host + '/content/autocomplete';
      results.push(selector.autocomplete({
        serviceUrl: url,
        noSuggestionNotice: 'Результатов нет',
        deferRequestBy: 200,
        params: {
          modelName: object.modelName,
          attributeName: object.attribute
        }
      }));
    }
    return results;
  };

  return Polyfield;

})();

window.polyfield = new Polyfield();
