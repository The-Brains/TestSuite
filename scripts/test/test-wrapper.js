define([
        'jquery',
        'lodash',
    ], function($, _) {

    var FindGetParam = function(parameterName, url = null) {
        var result = null;
        var tmp = [];

        var url = url ? url : location.search;

        url
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) {
                    result = tmp[1] ? decodeURIComponent(tmp[1]) : true;
                }
            });
        return result;
    };

    var testWrapper = function() {
        this.currentTest = '';
        this.startTime = 0;
        this.testQuantity = 0;
        this.testFailed = 0;
        this.testSucceed = 0;
        this.testTotalTime = 0;
        this.$resultContainer = $('.TestResultsArea');
        this.$testReportContainer = $('.TestReport');
        this.$testQuantity = this.$testReportContainer.find('.tests-quantity');
        this.$testSuceedQuantity =
            this.$testReportContainer.find('.tests-succeed-quantity');
        this.$testFailedQuantity =
            this.$testReportContainer.find('.tests-failed-quantity');
        this.$testTimer =
            this.$testReportContainer.find('.tests-time');

        this.grepSearch = _.replace(_.toLower(FindGetParam('grep')), new RegExp(/\+/g), ' ');
        this.failOnly = !!$.parseJSON(FindGetParam('failOnly'));

        var isPromise = function(thing) {
            return thing && thing.then && thing.catch;
        }

        this.execTest = function(mainName, testName, testFn) {
            var myself = this;
            var validTest = true;

            if (this.grepSearch) {
                validTest = _.includes(_.toLower(mainName), this.grepSearch)
                    || _.includes(_.toLower(testName), this.grepSearch);
            }

            if (!validTest) {
                return;
            }

            var completeTest = function(startTime, succeed, errorMsg) {
                var timeSpent = new Date() - startTime;

                if ((myself.failOnly && !succeed) || !myself.failOnly) {
                    myself.testQuantity++;
                    myself.testTotalTime += timeSpent;
                    console[succeed ? 'log' : 'error']('Test #' + myself.testQuantity
                        + ' "' + mainName + ' | ' + testName + '" took ' + timeSpent + 'ms to ' +
                        (succeed ? 'SUCCEED' : 'FAILED')
                        + '.');
                    if (!succeed) {
                        console.error(errorMsg);
                        $('.action-button-failOnly').removeAttr('disabled');
                    }
                    myself.updateCounters(succeed);
                    myself.renderTest(succeed, mainName, testName, timeSpent, errorMsg);
                }
            }

            setTimeout(function() {
                var startTime = new Date();
                var succeed = null;
                var errorMsg = null;
                try {
                    var returnedThing = testFn();

                    if (isPromise(returnedThing)) {
                        returnedThing.then(function() {
                            completeTest(startTime, true, null);
                        })
                        .catch(function(error) {
                            completeTest(startTime, false, error);
                        });
                        return;
                    }

                    succeed = true;
                } catch (error) {
                    succeed = false;
                    errorMsg = error;
                }

                completeTest(startTime, succeed, errorMsg);
            }, 0);
        }

        this.updateCounters = function(succeed) {
            if (succeed) {
                this.testSucceed++;
            } else {
                this.testFailed++;
            }

            this.$testQuantity.text(this.testQuantity);
            this.$testSuceedQuantity.text(this.testSucceed);
            this.$testFailedQuantity.text(this.testFailed);
            this.$testTimer.text(this.testTotalTime);
        }

        this.createTestClass = function(mainName) {
            return 'testBlock-' + _.replace(mainName, ' ', '_');
        }

        this.createLink = function(name, textSize) {
            if (!window.testFileName) {
                window.testFileName = 'test.html';
            }

            $linkElem = $('<a>', {
                href: `${window.testFileName}?grep=${name}`,
                text: name,
                class: `mdl-typography--display-${textSize}`,
            });

            $linkElem.css('text-decoration', 'none');
            $linkElem.css('color', 'rgb(66,66,66)');
            $linkElem.hover((event) => {
                $(event.currentTarget).css('opacity', 0.7);
            }, (event) => {
                $(event.currentTarget).css('opacity', 1);
            });

            return $linkElem;
        }

        this.getTestContainer = function(mainName) {
            var className = this.createTestClass(mainName);
            var $container = this.$resultContainer.find('.' + className);

            if (!$container.length) {
                $container = $('<div>',{ class: className });
                $ul = $('<ul>');
                $title = $('<h3>', {});

                $title.append(this.createLink(mainName, 2));

                $container.append($title);
                $container.append($ul);
                this.$resultContainer.append($container);
            }

            return $container.find('ul');
        }

        this.renderTest = function(succeed, mainName, name, time, errorMsg) {
            var $container = this.getTestContainer(mainName);
            var $result = $('<li/>', {
                class: 'mdl-list__item',
            });
            var iconName = succeed ? 'done' : 'close';
            var checked = succeed ? 'checked' : '';
            var secondaryBlock = succeed ? `${time} ms` : errorMsg;
            var iconClass = succeed ? 'icon-succeed' : 'icon-failed';
            var $testStatus = $(`
                <span class="mdl-list__item-primary-content">
                    <i class="material-icons mdl-list__item-avatar ${iconClass}">
                        ${iconName}
                    </i>

                </span>
                <span class="mdl-list__item-secondary-action">
                    ${secondaryBlock}
                </span>`
            );

            $($testStatus[0]).append(this.createLink(name, 'headline'));

            $result.append($testStatus);
            $container.append($result);
        }
    };

    return new testWrapper();
});
