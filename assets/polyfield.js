var Polyfield;

Polyfield = (function() {
  function Polyfield() {}

  Polyfield.prototype.models = {};

  Polyfield.prototype.push = function(model) {
    console.log(model);
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
    var attribute, collapseFragment, collapsible, container, content, contentBody, div, formGroup, index, input, label, model, ref, sectionId;
    model = this.models[id];
    model.counter++;
    sectionId = 'section_' + id + model.counter;
    collapsible = document.createElement('div');
    collapsible.setAttribute('id', sectionId);
    collapsible.setAttribute('class', id);
    collapsible.appendChild(document.createTextNode(model.counter + '. ' + model.label));
    collapsible.appendChild(document.createElement('span'));
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
      input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('id', attribute + model.counter);
      input.setAttribute('class', 'form-control');
      input.setAttribute('name', model.name + "[" + model.counter + "][" + attribute + "]");
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
