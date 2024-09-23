'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  // Public: Polyfield widget class that allows to add new model fields
  var Polyfield,
      indexOf = [].indexOf;

  Polyfield = function () {
    var Polyfield = function () {
      function Polyfield() {
        _classCallCheck(this, Polyfield);

        jQuery('body').on('blur', 'input[type="text"]', function () {
          return jQuery(this).val(jQuery(this).val().trim());
        });
        this.i18n = {};
      }

      // Public: add new model to monitoring by Polyfield

      // * `model` - The JSON {Object}.

      // Returns the void.


      _createClass(Polyfield, [{
        key: 'push',
        value: function push(model) {
          if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
            return console.log('Bad identifier for polyfield ' + model);
          }
          // Number counter for model
          model.counter = 0;
          // Tells if existing models are showen
          model.existsShowen = model.exists ? false : true;
          this.models[model.id] = model;
          this.appendExists(model.id);
          return this.bindEvent(model.id);
        }

        // Public: binds event for a HEML element

        // * `id` - The HTML identifier of element as {String}.

        // Returns the void as.

      }, {
        key: 'bindEvent',
        value: function bindEvent(id) {
          var _this = this;

          var button;
          if (typeof this.models[id] === 'undefined') {
            return console.log('Can not find object for what need to bind event');
          }
          button = jQuery('#button_' + id);
          return button.on('click', function () {
            _this.hideExcess(id);
            return _this.appendTemplate(id);
          });
        }

        // Public: hides excess models

        // * `id` - The HTML identifier of element as {String}.

      }, {
        key: 'hideExcess',
        value: function hideExcess(id) {
          if (jQuery('.' + id).length) {
            return jQuery('.' + id).collapsible('closeAll');
          }
        }

        // Public: Generates label HTML element

        // * `forId` The identifier for what label creates as {String}.
        // * `name`  The label value as {String}.

        // Returns the document element as Node.

      }, {
        key: 'generateLabel',
        value: function generateLabel(forId, name, htmlClass) {
          var label;
          htmlClass = htmlClass || 'col-xs-4 col-sm-4 col-md-3 col-lg-3';
          label = document.createElement('label');
          label.setAttribute('class', htmlClass + ' control-label');
          label.setAttribute('for', forId);
          label.appendChild(document.createTextNode(name));
          return label;
        }

        // Private: Generates input HTML elmenet

        // * `id`        The model unique identifier as {String}.
        // * `modelName` The model name as {String}.
        // * `attribute` The attribute name in model as {String}.
        // * `counter`   The sequence model number as {Number}.
        // * `value`     The value of attribute as {String}.
        // * `type`      The type of input ['text', 'hidden', 'checkbox'] avalable as {String}
        // * `label`     The label for attribute as {String}.

        // Returns the document element as Node.

      }, {
        key: 'generateInput',
        value: function generateInput(id, modelName, attribute, counter, value, type, label, autocomplete) {
          var div, formGroup, input, inputId;
          if (typeof value === 'undefined' || !value) {
            value = '';
          }
          if (typeof type === 'undefined') {
            type = 'hidden';
          }
          if (typeof label === 'undefined') {
            label = false;
          }
          if (typeof autocomplete === 'undefined') {
            autocomplete = true;
          }
          formGroup = document.createElement('div');
          formGroup.setAttribute('class', 'form-group');
          if (type !== this.inputTypes.HIDDEN) {
            if (label) {
              formGroup.appendChild(this.generateLabel(attribute + counter, label));
            }
          }
          div = document.createElement('div');
          div.setAttribute('class', 'col-xs-6 col-sm-6 col-md-7 col-lg-7');
          input = document.createElement('input');
          input.setAttribute('type', type);
          input.setAttribute('name', modelName + '[' + counter + '][' + attribute + ']');
          if (type !== this.inputTypes.HIDDEN) {
            inputId = attribute + id + counter;
            input.setAttribute('id', inputId);
            if (autocomplete === true) {
              this.addToAutocomplete(inputId, modelName, attribute);
            }
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
        }

        // Private: Generates textarea editor elmenet

        // * `id`        The model unique identifier as {String}.
        // * `modelName` The model name as {String}.
        // * `attribute` The attribute name in model as {String}.
        // * `counter`   The sequence model number as {Number}.
        // * `value`     The value of attribute as {String}.
        // * `type`        The type of input ['text', 'hidden'] avalable as {String}
        // * `label`     The label for attribute as {String}.

        // Returns the document element as Node.

      }, {
        key: 'generateEditor',
        value: function generateEditor(id, modelName, attribute, counter, value, type, label, editorConfig) {
          var div, formGroup, input, inputId, script;
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
            formGroup.appendChild(this.generateLabel(attribute + counter, label, 'col-xs-1'));
          }
          div = document.createElement('div');
          div.setAttribute('class', 'col-xs-9');
          input = document.createElement('textarea');
          input.setAttribute('name', modelName + '[' + counter + '][' + attribute + ']');
          inputId = attribute + id + counter;
          input.setAttribute('id', inputId);
          input.setAttribute('class', 'form-control');
          input.appendChild(document.createTextNode(value));
          div.appendChild(input);
          script = document.createElement('script');
          editorConfig = editorConfig.replace(/^\{/, '{"selector": "#' + inputId + '",');
          script.appendChild(document.createTextNode('tinymce.init(JSON.parse(\'' + editorConfig + '\'));'));
          div.appendChild(script);
          formGroup.appendChild(div);
          return formGroup;
        }

        // Private: Generates option tags for select list

        // * `values`      The options values as {Array}
        // * `attribute`   The attribute value of what takes as {String}
        // * `selected`    The selected element identifier as {Number}
        // * `sortAttr`  The option for add attribute in accordance with which options sorted
        // * `attributePrefix` The option add attribute values as prefix for current attribute values
        // * `valueAttribute`  The attribute name value of it will be seted in options values
        // * `exists`    The data with existing values
        // * `template`  Template for showed attributes
        // * `excludeExistingValues` enable/disable show in list existing values

        // Returns the document element as Node

      }, {
        key: 'generateOptions',
        value: function generateOptions(values, attribute, selected, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues) {
          var existingValues, filter, j, k, key, len, option, optionValue, options, v, value;
          if (typeof attributePrefix === 'undefined') {
            attributePrefix = '';
          }
          if (typeof filter === 'undefined') {
            filter = false;
          }
          sortAttr = sortAttr || attribute;
          if (!valueAttribute) {
            valueAttribute = 'id';
          }
          if (!exists) {
            exists = [];
          }
          options = document.createDocumentFragment();
          // Set empty option
          options.appendChild(document.createElement('option'));
          // Set empty option is selected if not sets exists values
          if (!exists) {
            options[0].setAttribute('selected', true);
          }
          if (values.sort) {
            values = values.sort(function (a, b) {
              var first, second;
              if (!a[sortAttr]) {
                return -1;
              }
              if (!b[sortAttr]) {
                return 1;
              }
              first = a[sortAttr].toUpperCase();
              second = b[sortAttr].toUpperCase();
              if (first > second) {
                return 1;
              }
              if (first < second) {
                return -1;
              }
              return 0;
            });
            existingValues = exists.map(function (value) {
              return value['id'];
            });
            if (excludeExistingValues) {
              values = values.filter(function (value) {
                return existingValues.indexOf(value['id']) === -1;
              });
            }
            for (j = 0, len = values.length; j < len; j++) {
              value = values[j];
              optionValue = template;
              for (k in value) {
                v = value[k];
                optionValue = optionValue.replace('{' + k + '}', v);
              }
              if (attributePrefix.length) {
                optionValue = value[attributePrefix] + ' - ' + optionValue;
              }
              option = document.createElement('option');
              option.setAttribute('value', value[valueAttribute]);
              option.appendChild(document.createTextNode(optionValue));
              if (String(value[valueAttribute]) === String(selected)) {
                option.setAttribute('selected', true);
              }
              options.appendChild(option);
            }
          } else {
            for (key in values) {
              value = values[key];
              optionValue = value;
              option = document.createElement('option');
              option.setAttribute('value', key);
              option.appendChild(document.createTextNode(optionValue));
              if (String(key) === String(selected)) {
                option.setAttribute('selected', true);
              }
              options.appendChild(option);
            }
          }
          return options;
        }

        // Private: Generates select HTML element

        // * `id`        The model unique identifier as {String}.
        // * `modelName` The model name as {string}.
        // * `attribute` The attribute name in model as {String}.
        // * `counter`   The sequence model number as {Number}.
        // * `label`     The label for attribute as {String}.
        // * `values`    The select option values as {Array}.
        // * `selected`  The option value that is selected as {String}.
        // * `filterAttr` The option for add filter dropdown element
        // * `sortAttr`  The option for add attribute in accordance with which options sorted
        // * `attributePrefix` The option add attribute values as prefix for current attribute values
        // * `valueAttribute`  The attribute name value of it will be seted in options values
        // * `exists`    The data with existing values
        // * `template`  Template for showed attributes
        // * `excludeExistingValues` enable/disable show in list existing values

        // Returns the document element as Node.

      }, {
        key: 'generateDropdown',
        value: function generateDropdown(id, modelName, attribute, counter, label, values, selected, filterAttr, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues) {
          var _this2 = this;

          var ddFragment, div, emptyOption, filterDiv, filterFormGroup, filterSelect, _filterValues, formGroup, select, selectId;
          if (typeof attributePrefix === 'undefined') {
            attributePrefix = '';
          }
          if (typeof selected === 'undefined') {
            selected = false;
          }
          if (typeof filterAttr === 'undefined') {
            filterAttr = false;
          }
          formGroup = document.createElement('div');
          ddFragment = document.createDocumentFragment();
          selectId = attribute + id + counter;
          formGroup.setAttribute('class', 'form-group');
          formGroup.appendChild(this.generateLabel(selectId, label));
          div = document.createElement('div');
          div.setAttribute('class', 'col-xs-6 col-sm-6 col-md-7 col-lg-7');
          select = document.createElement('select');
          select.setAttribute('name', modelName + '[' + counter + '][' + valueAttribute + ']');
          select.appendChild(this.generateOptions(values, attribute, selected, sortAttr, attributePrefix, valueAttribute, exists, template, excludeExistingValues));
          select.setAttribute('id', selectId);
          select.setAttribute('class', 'form-control select2');
          if (filterAttr) {
            filterFormGroup = document.createElement('div');
            filterFormGroup.setAttribute('class', 'form-group');
            filterFormGroup.appendChild(this.generateLabel('filter' + counter, this.translate('filter')));
            filterSelect = document.createElement('select');
            filterSelect.setAttribute('id', 'filter' + counter);
            _filterValues = values.filter(function (value, index, array) {
              return !value[filterAttr];
            });
            emptyOption = document.createElement('option');
            emptyOption.setAttribute('value', 0);
            emptyOption.appendChild(document.createTextNode(this.translate('noFilter')));
            filterSelect.appendChild(emptyOption);
            filterSelect.appendChild(this.generateOptions(_filterValues, attribute, null, sortAttr, attributePrefix, valueAttribute, null, template, excludeExistingValues));
            filterSelect.setAttribute('class', 'form-control');
            filterDiv = div.cloneNode();
            filterDiv.appendChild(filterSelect);
            filterFormGroup.appendChild(filterDiv);
            ddFragment.appendChild(filterFormGroup);
            jQuery(filterSelect).on('change', function () {
              var $filter, $select, filteredValues;
              _filterValues = function filterValues(filterVal, values, filterAttr) {
                var filtered, item, j, len;
                filterVal = Number(filterVal);
                if (filterVal === 0) {
                  return values;
                } else {
                  filtered = values.filter(function (value) {
                    if (filterVal === Number(value[filterAttr])) {
                      return true;
                    } else {
                      return false;
                    }
                  });
                  if (filtered.length) {
                    for (j = 0, len = filtered.length; j < len; j++) {
                      item = filtered[j];
                      filtered = filtered.concat(_filterValues(item.id, values, filterAttr));
                    }
                  }
                  return filtered;
                }
              };
              $filter = jQuery(filterSelect);
              $select = jQuery(select);
              $select.empty();
              filteredValues = _filterValues($filter.val(), values, filterAttr);
              return select.appendChild(_this2.generateOptions(filteredValues, attribute, selected, sortAttr, attributePrefix, valueAttribute, null, template, excludeExistingValues));
            });
          }
          div.appendChild(select);
          formGroup.appendChild(div);
          ddFragment.appendChild(formGroup);
          return ddFragment;
        }

        // Private: Generates the datepicker input field

        // * `id`        The model unique identifier as {String}.
        // * `modelName` The model name as {String}.
        // * `attribute` The attribute name in model as {String}.
        // * `counter`   The sequence model number as {Number}.
        // * `value`     The value of attribute as {String}.
        // * `type`      The type of input ['text', 'hidden'] avalable as {String}
        // * `label`     The label for attribute as {String}.

        // Returns the document element as Node.

      }, {
        key: 'generateDateInput',
        value: function generateDateInput(id, modelName, attribute, counter, value, type, label) {
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
          input.setAttribute('name', modelName + '[' + counter + '][' + attribute + ']');
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
            format: 'YYYY-MM-DD',
            keepInvalid: true
          });
          return formGroup;
        }

        // Private: Generates order dropdwn list

        // * `modelId`   The model unique identifier as {String}.
        // * `modelName` The model name as {String}.
        // * `counter`   The sequence model number as {Number}.

        // Returns the document element as Node.

      }, {
        key: 'generateOrder',
        value: function generateOrder(modelId, modelName, counter) {
          var classSelector, ddFragment, div, formGroup, select, selectId;
          formGroup = document.createElement('div');
          ddFragment = document.createDocumentFragment();
          classSelector = 'order-' + modelName;
          formGroup.setAttribute('class', 'form-group');
          formGroup.appendChild(this.generateLabel(modelName + modelId + counter, this.translate('order')));
          div = document.createElement('div');
          div.setAttribute('class', 'col-lg-offset-1 col-lg-3 text-center');
          select = document.createElement('select');
          select.setAttribute('name', modelName + '[' + counter + '][order]');
          select.appendChild(this.orderOptions(counter));
          this.updateOrder(classSelector, counter);
          selectId = modelName + modelId + counter;
          select.setAttribute('id', selectId);
          select.setAttribute('class', 'form-control ' + classSelector);
          div.appendChild(select);
          formGroup.appendChild(div);
          ddFragment.appendChild(formGroup);
          this.bindOrderListener(classSelector);
          return ddFragment;
        }
      }, {
        key: 'orderOptions',
        value: function orderOptions(counter) {
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
        }
      }, {
        key: 'updateOrder',
        value: function updateOrder(classSelector, counter) {
          var $selects;
          $selects = $('.' + classSelector);
          $selects.each(function () {
            var $this, i, j, optLen, ref, ref1, results;
            $this = $(this);
            optLen = $this.children('option').length;
            if (optLen < counter) {
              results = [];
              for (i = j = ref = optLen + 1, ref1 = counter; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
                results.push($this.append('<option>' + i + '</option>'));
              }
              return results;
            }
          });
        }
      }, {
        key: 'bindOrderListener',
        value: function bindOrderListener(classSelector) {
          var _this3 = this;

          if (typeof this.ordersListener[classSelector] === 'undefined') {
            $('body').on('focus click', '.' + classSelector, function (e) {
              return _this3.ordersListener[classSelector] = e.target.value;
            });
            $('body').on('change', '.' + classSelector, function (e) {
              var freeValue, self;
              self = $(e.target);
              freeValue = _this3.ordersListener[classSelector];
              if (freeValue !== self.val()) {
                return $('.' + classSelector).each(function () {
                  var $this;
                  $this = $(this);
                  if ($this.val() === e.target.value && !$this.is(self)) {
                    return $this.val(freeValue);
                  }
                });
              }
            });
          }
          return true;
        }

        // Private: Generates the header of collapse HTML data

        // * `id`          The identifier of model as {String}.
        // * `label`      The model caption as {String}.
        // * `counter`    The sequence number among models {Number}

        // Returns the document element as Node.

      }, {
        key: 'generateCollapsible',
        value: function generateCollapsible(id, label, counter) {
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
        }

        // Private: Generates container for collapsible structure

        // * `contentBody` The set of attributes as {Node}.

        // Returns the document element as Node.

      }, {
        key: 'generateContainer',
        value: function generateContainer(contentBody) {
          var container, content;
          content = document.createElement('div');
          content.setAttribute('class', 'content');
          content.appendChild(document.createElement('div'));
          content.appendChild(contentBody);
          container = document.createElement('div');
          container.setAttribute('class', '');
          container.appendChild(content);
          return container;
        }

        // Public: generates template for a model

        // * `id` - unique identifier in model view scope {String}.

      }, {
        key: 'appendTemplate',
        value: function appendTemplate(id) {
          var attrType, attrValues, attribute, collapseFragment, collapsible, contentBody, content_, index, inputElement, model, ref, ref1, sectionId;
          model = this.models[id];
          model.counter++;
          sectionId = 'section_' + id + model.counter;
          collapsible = this.generateCollapsible(id, model.label, model.counter);
          contentBody = document.createElement('p');
          if (model.order) {
            contentBody.appendChild(this.generateOrder(id, model.name, model.counter));
          }
          if (typeof model.attributeTypes.length === 'undefined') {
            ref = model.attributeTypes;
            for (attribute in ref) {
              attrType = ref[attribute];
              attrValues = null;
              if ((typeof attrType === 'undefined' ? 'undefined' : _typeof(attrType)) === 'object') {
                attrValues = attrType.data;
                attrType = attrType.type;
              }
              inputElement = function () {
                switch (false) {
                  case attrType !== this.inputTypes.STRING:
                    return this.generateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.autocomplete);
                  case attrType !== this.inputTypes.DATE:
                    return this.generateDateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute]);
                  case attrType !== this.inputTypes.TEXT:
                    return this.generateEditor(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.editorConfig);
                  case attrType !== this.inputTypes.HIDDEN:
                    return this.generateInput(id, model.name, attribute, model.counter, '', 'hidden', model.attributeLabels[attribute]);
                  case attrType !== this.inputTypes.BOOLEAN:
                    return this.generateInput(id, model.name, attribute, model.counter, '', 'checkbox', model.attributeLabels[attribute]);
                  case attrType !== this.inputTypes.DROPDOWN:
                    return this.generateDropdown(id, model.name, attribute, model.counter, model.attributeLabels[attribute], attrValues || model.dropdownValues, '', model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, attribute, model.dropdownUnique ? model.exists : [], model.dropdownAttributeTemplate, model.excludeExistingValues);
                  default:
                    return document.createElement('div');
                }
              }.call(this);
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
                  contentBody.appendChild(this.generateInput(id, model.name, attribute, model.counter, '', 'text', model.attributeLabels[attribute], model.autocomplete));
                }
              }
            } else if (model.type === this.types.DROPDOWN) {
              contentBody.appendChild(this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, '', model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, model.dropdownValueAttribute, model.dropdownUnique ? model.exists : [], model.dropdownAttributeTemplate, model.excludeExistingValues));
            }
          }
          collapseFragment = document.createDocumentFragment();
          collapseFragment.appendChild(collapsible);
          collapseFragment.appendChild(this.generateContainer(contentBody));
          content_ = document.getElementById('content_' + id);
          content_.appendChild(collapseFragment);
          jQuery('#' + sectionId).collapsible({
            defaultOpen: '' + sectionId
          });
          this.createSelect2(sectionId, model);
          return this.bindAutocomplete();
        }

        // Public: generates existing models structure in view

        // * `id` The model unique identifier as {String}.

      }, {
        key: 'appendExists',
        value: function appendExists(id) {
          var attrType, attrValues, attribute, collapsible, collapsibleFragment, contentBody, content_, dropdownValueAttribute, index, inputElement, j, len, model, object, ref, ref1, ref2, sectionId;
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
            if (typeof model.attributeTypes.length === 'undefined') {
              ref1 = model.attributeTypes;
              for (attribute in ref1) {
                attrType = ref1[attribute];
                attrValues = null;
                dropdownValueAttribute = model.dropdownValueAttribute;
                if ((typeof attrType === 'undefined' ? 'undefined' : _typeof(attrType)) === 'object') {
                  attrValues = attrType.data;
                  dropdownValueAttribute = attribute;
                  attrType = attrType.type;
                }
                inputElement = function () {
                  switch (false) {
                    case attrType !== this.inputTypes.STRING:
                      return this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.autocomplete);
                    case attrType !== this.inputTypes.DATE:
                      return this.generateDateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute]);
                    case attrType !== this.inputTypes.TEXT:
                      return this.generateEditor(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.editorConfig);
                    case attrType !== this.inputTypes.HIDDEN:
                      return this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'hidden', model.attributeLabels[attribute]);
                    case attrType !== this.inputTypes.BOOLEAN:
                      return this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'checkbox', model.attributeLabels[attribute]);
                    case attrType !== this.inputTypes.DROPDOWN:
                      return this.generateDropdown(id, model.name, attribute, model.counter, model.attributeLabels[attribute], attrValues || model.dropdownValues, object[dropdownValueAttribute], model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, attribute, [], model.dropdownAttributeTemplate, model.excludeExistingValues);
                    default:
                      return document.createElement('div');
                  }
                }.call(this);
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
                    contentBody.appendChild(this.generateEditor(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.editorConfig));
                  } else {
                    contentBody.appendChild(this.generateInput(id, model.name, attribute, model.counter, object[attribute], 'text', model.attributeLabels[attribute], model.autocomplete));
                  }
                }
              } else if (model.type === this.types.DROPDOWN) {
                contentBody.appendChild(this.generateDropdown(id, model.name, model.dropdownAttribute, model.counter, model.attributeLabels[model.dropdownAttribute], model.dropdownValues, object[model.dropdownValueAttribute], model.filterAttribute, model.sortAttribute, model.dropdownPrefixAttribute, model.dropdownValueAttribute, [], model.dropdownAttributeTemplate, model.excludeExistingValues));
              }
            }
            collapsibleFragment = document.createDocumentFragment();
            collapsibleFragment.appendChild(collapsible);
            collapsibleFragment.appendChild(this.generateContainer(contentBody));
            content_ = document.getElementById('content_' + id);
            content_.appendChild(collapsibleFragment);
            jQuery('#' + sectionId).collapsible({
              defaultOpen: sectionId
            });
            this.createSelect2(sectionId, model);
            this.bindAutocomplete();
          }
          return model.existsShowen = true;
        }

        // Public: bind close event to element by identifier

        // * `id` - The identifier of element as {String}.

      }, {
        key: 'bindClose',
        value: function bindClose(id) {
          var _this4 = this;

          return jQuery('body').on('click', '#exit_' + id, function () {
            if (confirm(_this4.translate('deleteConfirmation'))) {
              jQuery('#section_' + id).next().remove();
              return jQuery('#section_' + id).remove();
            }
          });
        }

        // Public: adds to autocompleting input elements

        // * `inputId`   - The html identifier of input as {Number}.
        // * `modelName` - The model's name as {String}.
        // * `attribute` - The attribute's name as {String}.

      }, {
        key: 'addToAutocomplete',
        value: function addToAutocomplete(inputId, modelName, attribute) {
          return this.completes.push({
            id: inputId,
            modelName: modelName,
            attribute: attribute
          });
        }

        // Public: binds autocomplete jQuery plugin for model input attribute

      }, {
        key: 'bindAutocomplete',
        value: function bindAutocomplete() {
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
              },
              triggerSelectOnValidInput: false
            });
          }
          return this.completes = [];
        }
      }, {
        key: 'createSelect2',
        value: function createSelect2(sectionId, model) {
          var select2Params;
          select2Params = {
            allowClear: true
          };
          if (model.dropdownDataUrl) {
            select2Params.ajax = {
              url: model.dropdownDataUrl,
              data: function data(params) {
                return _defineProperty({}, model.dropdownDataUrlSearchParam, params.term);
              },
              delay: 400,
              dataType: 'json'
            };
          }
          return jQuery('#' + sectionId).next().contents().find('select.select2').select2(select2Params);
        }

        // Public: sets translation parameters for polyfield widget

        // * `translation` - The plain object with param keys as variables and values
        //                 as translations as {Object}

      }, {
        key: 'setTranslation',
        value: function setTranslation(translation) {
          return this.i18n = translation;
        }

        // Private: translates given parameter in language text

        // * `textParam` - key by what searchs the transled text
        // Returns translation if it exists and `textParam` value else as String

      }, {
        key: 'translate',
        value: function translate(textParam) {
          if (typeof this.i18n[textParam] !== 'undefined') {
            return this.i18n[textParam];
          } else {
            return textParam;
          }
        }
      }]);

      return Polyfield;
    }();

    ;

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
      DROPDOWN: 'dropdown',
      SELECT2: 'select2',
      HIDDEN: 'hidden'
    };

    // Private: list of active models.
    Polyfield.prototype.models = {};

    // Public: array of autocomleting objects.
    Polyfield.prototype.completes = [];

    // Public: contains statuses of orders listeners
    Polyfield.prototype.ordersListener = {};

    return Polyfield;
  }.call(this);

  window.polyfield = new Polyfield();
}).call(undefined);