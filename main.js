/**
 * Created by max4722 on 02.05.2016.
 */

var LIAUTONS = {
    init: function (time, debug) {
        var ns = LIAUTONS;
        var url = 'linkedin.com/people/pymk';
        ns.log('LIAUTONS: # Init()');
        var classes = document.getElementsByClassName('header-section first-child');
        if (classes.length === 0) {
            ns.log("LIAUTONS: Error: class 'header-section first-child' could not be found.");
            return;
        }
        if (document.URL.indexOf(url) < 0) {
            ns.log('Unappropriated URL');
            return;
        }
        var navBar = classes[0];
        var navItem = document.createElement('div');
        var buttonStartStop = document.createElement('button');
        var buttonPause = document.createElement('button');
        var counterUI = document.createElement('input');
        var totalUI = document.createElement('input');
        var blacklistedUI = document.createElement('input');
        counterUI.size = 1;
        counterUI.readOnly = true;
        totalUI.size = 1;
        totalUI.readOnly = true;
        blacklistedUI.size = 1;
        blacklistedUI.readOnly = true;
        navItem.appendChild(buttonStartStop);
        navItem.appendChild(buttonPause);
        navItem.appendChild(counterUI);
        navItem.appendChild(totalUI);
        navItem.appendChild(blacklistedUI);
        navBar.insertBefore(navItem, navBar.firstChild.nextSibling.nextSibling);
        buttonStartStop.onclick = function () {
            if (!ns.vars.isRunning) {
                ns.log('LIAUTONS: >>> Starting...');
                ns.initialize();
                ns.vars.isRunning = true;
                ns.vars.buttonStartStop.innerHTML = "STOP";
                ns.vars.isPaused = false;
                ns.vars.buttonPause.innerHTML = "PAUSE";
                ns.scheduleUpdate();
            } else {
                ns.log('LIAUTONS: >>> Stopping...');
                ns.reset();
            }
        };
        buttonPause.onclick = function () {
            if (!ns.vars.isRunning) {
                ns.reset();
            } else {
                if (ns.vars.isPaused) {
                    ns.vars.isPaused = false;
                    ns.vars.buttonPause.innerHTML = "PAUSE";
                    ns.scheduleUpdate();
                }
                else {
                    ns.vars.isPaused = true;
                    ns.vars.buttonPause.innerHTML = "RESUME";
                }
            }
        };
        var autoClickTime = typeof time !== 'undefined' ? time : 100;
        var debugLoggingEnabled = typeof debug !== 'undefined' ? debug : false;
        var c = 0;
        var clicked = [];
        var progressId = '';
        var blackList = [];
        var badIdTimeout = 0;
        var cl = [];

        var getDebugLoggingEnabled = function () {
            return debugLoggingEnabled;
        };
        var getButtonStartStop = function () {
            return buttonStartStop;
        };
        var getButtonPause = function () {
            return buttonPause;
        };
        var getCounterUI = function () {
            return counterUI;
        };
        var getTotalUI = function () {
            return totalUI;
        }
        var getBlacklistedUI = function () {
            return blacklistedUI;
        }
        var getAutoClickTime = function () {
            return autoClickTime;
        };

        ns.vars = {
            debugLoggingEnabled: getDebugLoggingEnabled(),
            buttonStartStop: getButtonStartStop(),
            buttonPause: getButtonPause(),
            counterUI: getCounterUI(),
            totalUI: getTotalUI(),
            blacklistedUI: getBlacklistedUI(),
            autoClickTime: getAutoClickTime(),
            c: c,
            clicked: clicked,
            progressId: progressId,
            blackList: blackList,
            badIdTimeout: badIdTimeout,
            cl: cl
        };

        ns.initialize();
        ns.reset();
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
        v.cl = ns.getDocumentElements();
        v.totalUI.value = v.cl.length;
        ns.updateCountersUI();
    },

    reset: function () {
        LIAUTONS.log('LIAUTONS: # reset()');
        LIAUTONS.vars.isRunning = false;
        LIAUTONS.vars.buttonStartStop.innerHTML = "RUN";
        LIAUTONS.vars.isPaused = false;
        LIAUTONS.vars.buttonPause.innerHTML = "PAUSE";
    },

    updateCountersUI: function () {
        LIAUTONS.vars.counterUI.value = LIAUTONS.vars.c;
        LIAUTONS.vars.blacklistedUI.value = LIAUTONS.vars.blackList.length;
    },

    getDocumentElements: function () {
        return document.getElementsByClassName("bt-request-buffed buffed-blue-bkg-1");
    },

    getId: function (buttonElement) {
        return buttonElement.parentNode.parentNode.parentNode.getAttribute('id');
    },

    findItem: function (arr, item, func) {
        func = typeof func != 'undefined' ? func : function (x) {
            return x;
        };
        var isFound = false;
        [].forEach.call(arr, function (element) {
            if (isFound) return;
            if (func(element) === item) isFound = true;
        });
        return isFound;
    },

    addContact: function () {
        var ns = LIAUTONS;
        var v = ns.vars;
        if (v.isRunning) {
            if (v.cl.length === v.blackList.length) {
                ns.log('LIAUTONS: >>> Done. (blackList.length=' + v.blackList.length + ')');
                ns.reset();
            } else {
                if (v.progressId === '') {
                    var i = -1;
                    do {
                        i = Math.floor(Math.random() * v.cl.length);
                    }
                    while (ns.findItem(v.blackList, ns.getId(v.cl[i])));
                    v.progressId = ns.getId(v.cl[i]);
                    v.cl[i].click();
                } else {
                    v.cl = ns.getDocumentElements();
                    if (!ns.findItem(v.cl, v.progressId, ns.getId)) {
                        ns.log('LIAUTONS: processed id: ' + v.progressId);
                        v.clicked.push(v.progressId);
                        v.progressId = '';
                        v.c += 1;
                        v.badIdTimeout = 0;
                        ns.updateCountersUI();
                    } else {
                        if (v.badIdTimeout > 5000) {
                            v.badIdTimeout = 0;
                            ns.log('LIAUTONS: ! blacklisting id: ' + v.blackList);
                            v.blackList.push(v.progressId);
                            v.progressId = '';
                            ns.updateCountersUI();
                        } else
                            v.badIdTimeout += v.autoClickTime;
                    }
                }
            }
        }
        if (v.isRunning && !v.isPaused) {
            ns.scheduleUpdate();
        }
    },

    scheduleUpdate: function () {
        setTimeout(LIAUTONS.addContact, LIAUTONS.vars.autoClickTime);
    },

    log: function () {
        if (!LIAUTONS.vars.debugLoggingEnabled) return;
        console.log.apply(console, arguments);
    }
};

LIAUTONS.init(100);

