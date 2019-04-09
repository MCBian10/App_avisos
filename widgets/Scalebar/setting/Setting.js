///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/_base/html',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'jimu/portalUtils',
    'dojo/_base/lang',
    'dojo/on',
    "dojo/Deferred",
    "jimu/dijit/RadioBtn"
  ],
  function(
    declare,
    html,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    PortalUtils,
    lang,
    on,
    Deferred) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-scalebar-setting',
      selectUnit: '',
      selectStyle: '',

      startup: function() {
        this.inherited(arguments);
        if (!this.config.scalebar) {
          this.config.scalebar = {};
        }
        this.set('selectUnit', '');
        this.set('selectStyle', '');

        this.own(on(this.englishNode, 'click', lang.hitch(this, function() {
          this.set('selectUnit', 'english');
          this._selectItem('english');
        })));
        this.own(on(this.metricNode, 'click', lang.hitch(this, function() {
          this.set('selectUnit', 'metric');
          this._selectItem('metric');
        })));
        this.own(on(this.dualNode, 'click', lang.hitch(this, function() {
          this.set('selectUnit', 'dual');
          this._selectItem('dual');
          this.set('selectStyle', 'line');
          this._selectItem('line');
        })));

        this.own(on(this.lineNode, 'click', lang.hitch(this, function() {
          this.set('selectStyle', 'line');
          this._selectItem('line');
        })));
        this.own(on(this.rulerNode, 'click', lang.hitch(this, function() {
          this.set('selectStyle', 'ruler');
          this._selectItem('ruler');
        })));

        this.watch('selectUnit', this._updateUnit);
        this.watch('selectStyle', this._updateStyle);
        this.setConfig(this.config);
      },

      _updateUnit: function() {
        var _selectedUnitNode = null;
        var _unit = this.get('selectUnit');
        if (_unit === 'metric') {
          _selectedUnitNode = this.metricNode;
          html.setStyle(this.rulerNode, 'display', 'inline-block');
        } else if (_unit === 'dual') {
          _selectedUnitNode = this.dualNode;
          html.setStyle(this.rulerNode, 'display', 'none');
        } else {
          _selectedUnitNode = this.englishNode;
          html.setStyle(this.rulerNode, 'display', 'inline-block');
        }

        if(_selectedUnitNode && _selectedUnitNode.setChecked){
          _selectedUnitNode.setChecked(true);
        }
      },

      _updateStyle: function() {
        var _selectedStyleNode = null;
        var _style = this.get('selectStyle');
        if (_style === 'ruler') {
          _selectedStyleNode = this.rulerNode;
        } else {
          _selectedStyleNode = this.lineNode;
        }

        if(_selectedStyleNode && _selectedStyleNode.setChecked){
          _selectedStyleNode.setChecked(true);
        }
      },

      _processConfig: function(configJson) {
        var def = new Deferred();
        if (configJson.scalebarUnit && configJson.scalebarStyle) {
          def.resolve(configJson);
        } else {
          PortalUtils.getUnits(this.appConfig.portalUrl).then(lang.hitch(this, function(units) {
            configJson.scalebarUnit = units === 'english' ? 'english' : 'metric';
            def.resolve(configJson);
          }));
        }

        return def.promise;
      },

      setConfig: function(config) {
        this.config = config;

        this._processConfig(config.scalebar).then(lang.hitch(this, function(scalebar) {
          this.set('selectUnit', scalebar.scalebarUnit);
          this._selectItem(scalebar.scalebarUnit);

          var lineStyle = scalebar.scalebarStyle || 'line';
          this.set('selectStyle', lineStyle);
          this._selectItem(lineStyle);
        }));
      },

      getConfig: function() {
        this.config.scalebar.scalebarUnit = this.get('selectUnit');
        this.config.scalebar.scalebarStyle = this.get('selectStyle');
        return this.config;
      },

      _selectItem: function(name) {
        if(this[name] && this[name].setChecked){
          this[name].setChecked(true);
        }
      }
    });
  });