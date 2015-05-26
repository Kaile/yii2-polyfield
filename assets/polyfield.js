var Polyfield;

Polyfield = (function() {
  function Polyfield() {}

  Polyfield.prototype.models = {};

  Polyfield.prototype.push = function(id) {
    var model, selectorId;
    console.log(id);
    selectorId = jQuery('#' + id);
    if (!selectorId.length) {
      return console.log('Bad identifier for polyfield ' + id);
    }
    model = {};
    model.selector = selectorId;
    model.container = [];
    model.name = false;
    model.label = false;
    model.counter = 0;
    model.attribute = [];
    model.attributeLabel = [];
    selectorId.find('span').each(function(index) {
      var span;
      span = $(this);
      if (model.name === false) {
        model.name = span.attr('data-model-name');
      }
      if (model.label === false) {
        model.label = span.attr('data-model-label');
      }
      model.attribute[index] = span.attr('data-attribute-name');
      return model.attributeLabel[index] = span.attr('data-attribute-label');
    });
    this.models[id] = model;
    return this.bindEvent(id);
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
    var model;
    model = this.models[id];
    if (!model.container.length) {
      return;
    }
    return jQuery('.' + id).collapsible('closeAll');
  };

  Polyfield.prototype.appendTemplate = function(id) {
    var collapseFragment, collapsible, container, content, contentBody, div, formGroup, i, input, j, label, model, ref, sectionId;
    model = this.models[id];
    model.counter++;
    sectionId = 'section_' + id + model.counter;
    model.container[model.counter] = sectionId;
    collapsible = document.createElement('div');
    collapsible.setAttribute('id', sectionId);
    collapsible.setAttribute('class', id);
    collapsible.appendChild(document.createTextNode(model.counter + '. ' + model.label));
    container = document.createElement('div');
    container.setAttribute('class', 'container');
    content = document.createElement('div');
    content.setAttribute('class', 'content');
    content.appendChild(document.createElement('div'));
    contentBody = document.createElement('p');
    for (i = j = 0, ref = model.attribute.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      formGroup = document.createElement('div');
      formGroup.setAttribute('class', 'form-group');
      label = document.createElement('label');
      label.setAttribute('class', 'col-lg-3 control-label');
      label.setAttribute('for', model.attribute[i] + model.counter);
      label.appendChild(document.createTextNode(model.attributeLabel[i]));
      div = document.createElement('div');
      div.setAttribute('class', 'col-lg-5');
      input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('id', model.attribute[i] + model.counter);
      input.setAttribute('class', 'form-control');
      input.setAttribute('name', model.name + "[" + model.counter + "][" + model.attribute[i] + "]");
      div.appendChild(input);
      formGroup.appendChild(label);
      formGroup.appendChild(div);
      contentBody.appendChild(formGroup);
    }
    content.appendChild(contentBody);
    container.appendChild(content);
    collapseFragment = document.createDocumentFragment();
    collapseFragment.appendChild(collapsible);
    collapseFragment.appendChild(container);
    document.getElementById('content_' + id).appendChild(collapseFragment);
    return jQuery('#' + sectionId).collapsible({
      defaultOpen: "" + sectionId
    });
  };

  return Polyfield;

})();

window.polyfield = new Polyfield();
