/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// (function(document) {
//   'use strict';
//
//   // Grab a reference to our auto-binding template
//   // and give it some initial binding values
//   // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
//   var app = document.querySelector('#app');
//
//   app.displayInstalledToast = function() {
//     // Check to make sure caching is actually enabled—it won't be in the dev environment.
//     if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
//       Polymer.dom(document).querySelector('#caching-complete').show();
//     }
//   };
//
//   // Listen for template bound event to know when bindings
//   // have resolved and content has been stamped to the page
//   app.addEventListener('dom-change', function() {
//     console.log('Our app is ready to rock!');
//   });
//
//   // See https://github.com/Polymer/polymer/issues/1381
//   window.addEventListener('WebComponentsReady', function() {
//     // imports are loaded and elements have been registered
//   });
//
//   // Main area's paper-scroll-header-panel custom condensing transformation of
//   // the appName in the middle-container and the bottom title in the bottom-container.
//   // The appName is moved to top and shrunk on condensing. The bottom sub title
//   // is shrunk to nothing on condensing.
//   window.addEventListener('paper-header-transform', function(e) {
//     var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
//     var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
//     var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
//     var detail = e.detail;
//     var heightDiff = detail.height - detail.condensedHeight;
//     var yRatio = Math.min(1, detail.y / heightDiff);
//     var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
//     var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
//     var scaleBottom = 1 - yRatio;
//
//     // Move/translate middleContainer
//     Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);
//
//     // Scale bottomContainer and bottom sub title to nothing and back
//     Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);
//
//     // Scale middleContainer appName
//     Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
//   });
//
//   // Scroll page to top and expand header
//   app.scrollPageToTop = function() {
//     app.$.headerPanelMain.scrollToTop(true);
//   };
//
// })(document);

(function(){
  Polymer({
    is: 'contestify-app',
    properties: {
      route: {
        type: String,
        notify: true
      },
      meta: {
        type: Object,
        value: {},
        notify: true
      },
      isLoginRegisterCardHidden: {
        type: Boolean,
        value: true
      },
      currentUser: {
        type: Object,
        value: {},
        notify: true
      },
      currentContestInfo: {
        type: Object,
        value: {},
        notify: true
      },
      isLoginRegister: {
        type: Boolean,
        value: false,
        notify: true
      },
      formInfo: {
        type: Object,
        notify: true,
        observer: 'submitForm'
      }
    },
    ready: function() {
    },
    // ui
    scrollPageToTop: function() {
      app.$.headerPanelMain.scrollToTop(true);
    },
    logoutCurrentUser: function () {
      this.$.ajaxLogout.generateRequest();
    },
    toggleLoginRegister: function () {
      this.set('isLoginRegisterCardHidden', !this.isLoginRegisterCardHidden);
    },
    // util
    submitForm: function () {
      if (this.formInfo.firstName !== undefined) {
        this.$.ajaxRegister.generateRequest();
      }
      else {
        this.$.ajaxLogin.generateRequest();
      }
    },
    parse: function(obj) {
      return JSON.stringify(obj);
    },
    hideToast: function () {
      this.$.toast.hide();
    },
    showFailMsg: function (msg) {
      this.$.toast.text = msg;
      this.$.toast.show();
    },
    getCurrentUserDetail: function () {
      this.$.ajaxUserDetail.params = {'id': this.currentUser.userId};
      this.$.ajaxUserDetail.generateRequest();
    },
    getCurrentContestInfo: function () {
      var id = this.currentContestInfo.id;
      this.$.ajaxContestDetail.params = {'id': id};
      this.$.ajaxContestDetail.generateRequest();
    },
    // on ajax received callback
    onLogoutReceived: function (res) {
      var response = res.detail.response;
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      this.set('isLoginRegister', false);
    },
    onUserDetailReceived: function (res) {
      var response = res.detail.response;
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      this.set('currentUser.firstName', response.result.firstName);
      this.set('currentUser.lastName', response.result.LastName);
    },
    onCurrentUserReceived: function (res) {
      var response = res.detail.response;
      console.log(response);
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      var currentId = res.detail.response.result.currentUserId;

      this.set('isLoginRegister', currentId !== null);
      if (currentId) {
        this.set('currentUser.userId', currentId);
        this.getCurrentUserDetail();
      }
    },
    onRegisterReceived: function (res) {
      var response = res.detail.response;
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      this.toggleLoginRegister();
      this.$.ajaxLogin.generateRequest();
    },
    onLoginReceived: function (res) {
      var response = res.detail.response;
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      if (!this.isLoginRegisterCardHidden) {
        this.toggleLoginRegister();
      }
      this.$.ajaxCurrentUser.generateRequest();
    },
    onContestDetailReceived: function (res) {
      var response = res.detail.response;
      if (response.status === 'Failed') {
        return this.showFailMsg(response.msg);
      }
      this.set('currentContestInfo', response.result);
      this.set('meta.title', response.result.title);
      this.set('meta.subtitle', response.result.description);
    }
  });
})();