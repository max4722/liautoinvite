/**
 * Created by max4722 on 02.05.2016.
 */

var LIAUTONS = {
    init: function (time, debug) {
        LIAUTONS.log('LIAUTONS: # Init()');
        var navBar = document.getElementsByClassName('header-section first-child')[0];
        var navItem = document.createElement('div');
        var button = document.createElement('button');
        var counterUI = document.createElement('input');
        counterUI.size = 1;
        navItem.appendChild(button);
        navItem.appendChild(counterUI);
        navBar.insertBefore(navItem, navBar.firstChild.nextSibling.nextSibling);
        var ns = LIAUTONS;
        button.onclick = function () {
            if (!ns.vars.isRunning) {
                ns.log('LIAUTONS: >>> Starting...');
                ns.initialize();
                ns.vars.isRunning = true;
                ns.vars.button.innerHTML = "STOP";
            } else {
                ns.log('LIAUTONS: >>> Stopping...');
                ns.reset();
            }
        };
        var autoClickTime = typeof time != 'undefined' ? time : 100;
        var debugLoggingEnabled = typeof debug != 'undefined' ? debug : false;
        var c = 0;
        var clicked = [];
        var progressId = '';
        var blackList = [];
        var badIdTimeout = 0;

        var getDebugLoggingEnabled = function () {
            return debugLoggingEnabled;
        };
        var getButton = function () {
            return button;
        };
        var getCounterUI = function () {
            return counterUI;
        };
        var getAutoClickTime = function () {
            return autoClickTime;
        };

        ns.vars = {
            debugLoggingEnabled: getDebugLoggingEnabled(),
            button: getButton(),
            counterUI: getCounterUI(),
            autoClickTime: getAutoClickTime(),
            c: c,
            clicked: clicked,
            progressId: progressId,
            blackList: blackList,
            badIdTimeout: badIdTimeout
        };

        ns.initialize();
        ns.reset();
        ns.addContact();
    },

    vars: {},

    initialize: function () {
        var ns = LIAUTONS;
        var v = ns.vars;
        ns.log('LIAUTONS: # initialize()');
        v.c = 0;
        v.clicked = [];
        v.progressId = '';
        v.blackList = [];
        v.badIdTimeout = 0;
        ns.updateCounter(v.c);
    },

    reset: function () {
        LIAUTONS.log('LIAUTONS: # reset()');
        LIAUTONS.vars.isRunning = false;
        LIAUTONS.vars.button.innerHTML = "RUN";
    },

    updateCounter: function (num) {
        LIAUTONS.vars.c = num;
        LIAUTONS.vars.counterUI.value = num;
    },

    getId: function (buttonElement) {
        return buttonElement.parentNode.parentNode.parentNode.getAttribute('id');
    },

    findItem: function (arr, item, func) {
        func = typeof func != 'undefined' ? func : function (x) {
            return x;
        };
        var found = false;
        [].forEach.call(arr, function (element) {
            if (found) return;
            if (func(element) === item) found = true;
        });
        return found;
    },

    addContact: function () {
        var ns = LIAUTONS;
        var v = ns.vars;
        if (v.isRunning) {
            var cl = document.getElementsByClassName("bt-request-buffed buffed-blue-bkg-1");
            if (cl.length === v.blackList.length) {
                ns.log('LIAUTONS: >>> Done. (blackList.length=' + v.blackList.length + ')');
                ns.reset();
            } else {
                if (v.progressId === '') {
                    var i = -1;
                    do {
                        i = Math.floor(Math.random() * cl.length);
                    }
                    while (ns.findItem(v.blackList, ns.getId(cl[i])));
                    v.progressId = ns.getId(cl[i]);
                    cl[i].click();
                } else {
                    if (!ns.findItem(cl, v.progressId, ns.getId)) {
                        ns.log('LIAUTONS: processed id: ' + v.progressId);
                        v.clicked.push(v.progressId);
                        v.progressId = '';
                        ns.updateCounter(v.c + 1);
                        v.badIdTimeout = 0;
                    } else {
                        if (v.badIdTimeout > 5000) {
                            ns.log('LIAUTONS: ! blacklisting id: ' + v.blackList);
                            v.blackList.push(v.progressId);
                            v.progressId = '';
                        } else
                            v.badIdTimeout += v.autoClickTime;
                    }
                }
            }
        }
        setTimeout(ns.addContact, v.autoClickTime);
    },

    log: function () {
        if (!LIAUTONS.vars.debugLoggingEnabled) return;
        console.log.apply(console, arguments);
    }
};

LIAUTONS.init(100);

