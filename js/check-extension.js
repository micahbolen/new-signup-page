 var _extensionFound = false;
        
        function _setStatus(status) {
            $('.status').text(status);
        }
        
        function _loadImageDetect(path, lastCheck, callback) {
            var testImage = $('<img style="display: none;" />');
            testImage.load(function () {
                $(this).remove();
                callback(true);
            });

            testImage.error(function () {
                $(this).remove();
                callback(false);
            });

            testImage.attr('src', path);
        }

        function _checkChromeExtensionPresent(uuid, lastCheck, callback) {
            _loadImageDetect('chrome-extension://' + uuid + '/images/icon128.png', lastCheck, callback);
        }

        function _setupCheckChromeExtension(callback) {
            _checkChromeExtensionPresent('fmmgljeemhhajnponhffhpjioiclpmbh', false, function (foundStable) {
                if (foundStable) {
                    _setStatus('Stable extension found');
                    callback(foundStable);
                } else {
                    _checkChromeExtensionPresent('mfpmpdmlcclbeibhdpeckobhpeeldidd', false, function (foundBeta) {
                        if (foundBeta) {
                            _setStatus('Beta extension found');
                            callback(foundBeta);
                        } else {
                            _checkChromeExtensionPresent('gfajmginpemgmhclfobkejbbekibnnia', callback, function (foundDev) {
                                if (foundDev) {
                                    _setStatus('Dev extension found');
                                    callback(foundDev);
                                } else {
                                    _checkChromeExtensionPresent('dkjfhfonpoffpcodhdecpiahiofhaajd', true, function (foundLocal) {
                                        if (foundLocal)
                                            _setStatus('Local extension found');

                                        callback(foundLocal);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        function _onExtensionFound(found, force) {
            // We already found one version of the extension, do not proceed to the next step more than once
            if (_extensionFound)
                return;

            if (!found) {
                // Show the download button
                _extensionFound = false;
                 console.log('extension not found');
                _setStatus('Extension not found');
                return;
            }

            // Show message telling the user they already have the extension
            if (force) {
                // On Firefox, we can detect synchronously and show the status on page load
               _extensionFound = true;
                console.log('extension found');
            } else {
                // On Chrome, detection is asynchronous so the page would have been displayed by the time we are done doing the check
                _extensionFound = true;
                console.log('extension found');
            }
        }

        function getBrowser() {
            // TODO: Replace by server side browser detection if already present (either via ua-parser or relying on framework API)
            if (window.UAParser) {
                var parser = new window.UAParser();
                var result = parser.getResult();
                
                return result.browser.name.toLowerCase();
            } else {
                // Fallback to user agent detection (copied from jquery.browser)
                // FIXME: Do not use this in your code. If you must rely on doing detection this way,
                // use jquery-migrate (https://github.com/jquery/jquery-migrate/#readme)
                // Note that IE11/Win8.1 might will not be detected properly as they stopped having msie in the user agent
                var uaMatch = function( ua ) {
                    ua = ua.toLowerCase();

                    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                        /(msie) ([\w.]+)/.exec( ua ) ||
                        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                        [];

                    return {
                        browser: match[ 1 ] || "",
                        version: match[ 2 ] || "0"
                    };
                };
                
                var matched = uaMatch(navigator.userAgent);

                return matched.browser;
            }
        }
    
        function _checkExtension() {
            var browser = getBrowser();
            $('.browser').text('Running under ' + browser);
        
            switch (browser) {
                // IE: use global object exposed by plugin
                case "ie":
                    _onExtensionFound(!!window.PowerInboxBHOObject);
                    break;

                // Chrome: Check extensions one by one
                case "chrome":
                    _setupCheckChromeExtension(function (found) { _onExtensionFound(found, false); });
                    break;

                // Firefox: use fast path via navigator property if present or fallback to image detection
                case "firefox":
                    // Firefox: fast detection path via exposed property on navigator object (needs plugin > 1.13)
                    if (window.navigator.powerinbox) {
                        _onExtensionFound(true, true);
                        return;
                    }
                    
                    // Old Firefox extensions with no navigator object
                    _loadImageDetect('chrome://powerinbox/content/images/icon48.png', true, _onExtensionFound);
                    break;

                // Note: We have no way to detect installation on Safari
                default:
                    break;
            }
        }
        
        $(function() {
            _checkExtension();
        });