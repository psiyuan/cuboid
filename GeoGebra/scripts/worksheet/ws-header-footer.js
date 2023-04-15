/*global $, GGBT_wsf_edit, jQuery, console, alert, GGBApplet, ZeroClipboard, BASE_URL, renderGGBElement, addFormattingOptions, GGBT_wsf_general, MutationObserver, GGBT_wsf_metadata_edit*/

window.GGBT_ws_header_footer = (function($) {
    "use strict";

    var wsScroller = null;
    var wsInfoScroller = null;
    var wsHeader = null;
    var feedbackHeader = null;
    var wsFooter = null;
    var worksheetSettings = null;
    var defaults = null;
    var general;

    function getWsScroller() {
        if (general !== undefined) {
            return general.getWorkSheet();
        } else if (wsScroller === null || wsScroller.length === 0) {
            wsScroller = $(".wsf-ws-scroller");
        }
        return wsScroller;
    }
    function getWsInfoScroller() {
        if (wsInfoScroller === null || wsInfoScroller.length === 0) {
            wsInfoScroller = $(".wsf-info-scroller");
        }
        return wsInfoScroller;
    }
    function getWsHeader() {
        if (general !== undefined) {
            return general.getHeader();
        } else if (wsHeader === null || wsHeader.length === 0) {
            wsHeader = $(".j-ws-header");
        }
        return wsHeader;
    }
    function getFeedbackHeader() {
        if (general !== undefined) {
            return general.getFeedbackHeader();
        } else if (feedbackHeader === null || feedbackHeader.length === 0) {
            feedbackHeader = $(".j-feedback-header");
        }
        return feedbackHeader;
    }
    function getWsFooter() {
        if (general !== undefined) {
            return general.getFooter();
        } else if (wsFooter === null || wsFooter.length === 0) {
            wsFooter = $(".jWS-footer");
        }
        return wsFooter;
    }
    function getWorksheetSettings() {
        if (worksheetSettings === null) {
            worksheetSettings = $('.j-ws-settings');
        }
        return worksheetSettings;
    }

    /**
     * Click Handler for opening and closing Worksheet settings (EDIT)
     */
    function initToogleWorksheetSettings() {
        //console.log("init toggle ws settings");
        $('.j-ws-toggle-settings').click(function () {
            $('.j-ws-settings-content').slideToggle(function() {
                setWsScrollerHeight();
            });
            $('.j-ws-toogle-settings-icon').toggleClass('arrow-small-right arrow-small-up');
            //if (window.GGBT_wsf_edit) {
            //    window.GGBT_wsf_edit.setModifiedFlag();
            //}
        });
    }

    /**
     * Initializes the button for the worksheet menu (Popup with actions  ..)
     */
    function initShowWorksheetActionsPopupButton() {
        $(".j-worksheet-actions-button").on("click", function() {
            $(".j-worksheet-menu-content").fadeToggle("fast");
            $(".j-worksheet-actions-button").toggleClass("active");
        });
    }

    /**
     * Initializes the button for the worksheet element add button in header (Popup with actions  ..)
     */
    function initShowWorksheetAddElementPopupButton() {
        $(".j-worksheet-add-element-button").on("click", function() {
            $(".j-worksheet-add-element-content").fadeToggle("fast");
            $(".j-worksheet-add-element-button").toggleClass("active");
        });
    }

    /**
     * Initializes the button for the student's menu in teacher's feedback mode (Popup with actions  ..)
     */
    function initShowWorksheetStudentsPopupButton() {
        $(".j-worksheet-students-button").on("click", function() {
            $(".j-students-popup").fadeToggle("fast");
            $(".j-worksheet-students-button").toggleClass("active");
        });
    }

    /**
     * Closes the user popup when clicked anywhere on the body,
     * except on the place where the popup should open
     */
    function initOnBodyClick() {
        $("body").click(function(e) {
            if( !$(e.target).is(".j-worksheet-actions-button")) {
                $(".j-worksheet-menu-content").fadeOut("fast");
                $(".j-worksheet-actions-button").removeClass("active");
            }
            if( !$(e.target).is(".j-worksheet-students-button")) {
                $(".j-students-popup").fadeOut("fast");
                $(".j-worksheet-students-button").removeClass("active");
            }
            if( !$(e.target).is(".j-worksheet-add-element-button")) {
                $(".j-worksheet-add-element-content").fadeOut("fast");
                $(".j-worksheet-add-element-button").removeClass("active");
            }
        });
    }

    /**
     * Makes sure that wrapper has correct size: 100% of window - height of header
     * IN VIEW MODE
     */
    function setWsScrollerHeight() {
        var bookMenu = $('#menu');
        getWsHeader().outerHeight('auto');

        var headerHeight = getWsHeader().outerHeight() + getFeedbackHeader().outerHeight();
        var borderHeight = headerHeight + getWorksheetSettings().outerHeight();
        var scrollerHeight = $(window).height() - borderHeight;
        getWsScroller().height('auto');
        getWsInfoScroller().height('auto');

        // update padding-top when header gets higher (so all the content is visible)
        if (!isInIframe()) {
            getWsScroller().css({paddingTop: headerHeight});
            getWsInfoScroller().css({paddingTop: headerHeight});
        }

        if ((getWsScroller().height()) < scrollerHeight) {
            getWsScroller().height(scrollerHeight);
        }

        // Align the height of the book menu and the page
        if (bookMenu.length === 1) {
            if ($('#menu-container').hasClass("open")) {
                bookMenu.height("auto");
                if (bookMenu.height() > getWsScroller().height()) {
                    getWsScroller().height(bookMenu.height());
                }
            } else {
                bookMenu.height(scrollerHeight);
            }
        }

        var infoWrapper = getWsInfoScroller().parent();
        if (!infoWrapper.hasClass('fullscreen')) {
            getWsInfoScroller().height(scrollerHeight-20); // -50 -> is the position from top
        }
    }

    function initLinkFromIframe(link) {
        $(link).on("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.GGBT_gen_singleton.goToHrefFromIframe($(this).attr("href"));
        });
    }

    function initButtons(){
        initKeep();
        initCopy();
        initEdit();
        if (window.GGBT_gen_singleton.isOwnIFrame() && $(".jSave").length === 0) {
            $(".jCancel.jClose ").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.GGBT_gen_singleton.closeSingleton();
            });
        }
        if (window.GGBT_gen_singleton.isOwnIFrame()) {
            [
                ".icon-edit",
                ".icon-about",
                ".icon-search",
                ".icon-copy",
                ".icon-delete",
                ".j-book-view-edit"

            ].forEach(function (link) {
                initLinkFromIframe(link);
            });
        }

        $("li > a").on("click", function(event){
            if ($(this).is("[disabled]")) {
                event.preventDefault();
            }
        });
    }

    /**
     * favorite material
     */
    function initKeep() {
        $('.jKeep').click(function(e) {
            e.preventDefault();
            var button = $(this);
            $.get(button.attr("href")).success(function(result) {
                if (result.type === "success") {
                    var header = button.parents('.j-ws-header');
                    var material_id = $('.jWs-tools', header).data('id');
                    var title = header.data("title").trim();

                    if(result.newData) {
                        button.addClass('icon-is-favorite');
                        button.removeClass('icon-favorite');

                        // Show popup message
                        window.GGBT_gen_edit.setSaveStateSuccessful(defaults.msg_favorite_add.replace("{$1}", title));

                    } else {
                        button.removeClass('icon-is-favorite');
                        button.addClass('icon-favorite');

                        window.GGBT_gen_edit.setSaveStateSuccessful(defaults.msg_favorite_remove.replace("{$1}", title));

                    }
                }
            });
            return false;
        });
    }

    /**
     * copy Action
     */
    function initCopy(){
        $('.jCopy').on('click', function(e) {
            var li = $(e.target).hasClass('jCopy') ? $(e.target) : $(e.target).parents('.jCopy');
            if (li.data('confirm')) {
                e.preventDefault();
                if (!$(this).is("[disabled]") && !$('a', this).is("[disabled]")) {
                    window.GGBT_gen_modal.showYesNoPopup(li.data('confirm'), function() {
                        window.location = li.find('a').attr('href');
                    }, null, li.data('confirm-yes'), li.data('confirm-no'));
                }
            }
        });
    }

    /**
     * edit Action
     */
    function initEdit(){
        $('.jEdit').on('click', function(e) {
            var popup,
                editurl,
                copyurl,
                text;
            e.stopPropagation();
            if ($(this).hasClass("jinotherbook") || $(this).hasClass("hasotherowner")) {
                e.preventDefault();
                if ($(this).hasClass("hasotherowner")) {
                    popup = $('#popup-edit-hasotherowner');
                    text = $('.message-text', popup).text();
                    $('.message-text', popup).text(text.replace("{$1}", $(this).data("owner-username")));
                } else {
                    popup = $('#popup-edit-inotherbook');
                }
                editurl = $(this).attr("href");
                copyurl = $(this).data("copy");

                $('.edit-original-edit', popup).off("click").click(function () {
                    window.GGBT_gen_singleton.processUrl(editurl);
                    return;
                });
                $('.edit-original-copy', popup).off("click").click(function () {
                   window.GGBT_gen_singleton.processUrl(copyurl);
                    return;
                });
                window.GGBT_gen_modal.showPopup(popup, {closebutton: false});
            } else if ($(this).hasClass("jonlycopy")) {
                e.preventDefault();
                popup = $('#popup-edit-noeditrights');
                text = $('.message-text', popup).text();
                copyurl = $(this).attr("href");
                $('.message-text', popup).text(text.replace("{$1}", $(this).data("owner-username")));
                $('.edit-original-copy', popup).off("click").click(function () {
                    location.href = copyurl;
                });
                $('.button.cancel', popup).click(function () {
                    window.GGBT_gen_modal.closePopup();
                });
                window.GGBT_gen_modal.showPopup(popup, {closebutton: false});
            } else if (window.GGBT_gen_singleton.isOwnIFrame()) {
                e.preventDefault();
                window.GGBT_gen_singleton.goToHrefFromIframe($(this).attr("href"));
            }
        });
    }

    function initEmbed() {
        if (window.GGBT_gen_singleton.isOwnIFrame()) {
            $(".icon-embed").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.GGBT_gen_singleton.goToHrefFromIframe($(this).attr("href"));
            });
        }
    }

    /**
     * Resize functions
     */
    $(window).resize(function() {
        setWsScrollerHeight();
    });

    function onSwitchWorksheet(worksheet) {
        setWsScrollerHeight();

        worksheet.find('.ws-element-image img').on("load", function() {
           setWsScrollerHeight();
        });
    }

    function isInIframe () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function init() {

        general = window.GGBT_wsf_general;
        getWsScroller();

        if (isInIframe() && !window.GGBT_gen_singleton.isOwnIFrame()) {
            getWsHeader().hide();
            getWsScroller().css({paddingTop: 0});
            getWsFooter().hide();
            $('.jSaveAndClose').hide();
        }

        initToogleWorksheetSettings();
        initShowWorksheetActionsPopupButton();
        initShowWorksheetStudentsPopupButton();
        initShowWorksheetAddElementPopupButton();
        initOnBodyClick();
        initButtons();

        setWsScrollerHeight();

        setTimeout(setWsScrollerHeight, 150);

    }

    function setDefaults(data) {
        defaults = data;
    }


    return {
        init: init,
        setDefaults: setDefaults,
        onSwitchWorksheet: onSwitchWorksheet,
        setWsScrollerHeight: setWsScrollerHeight
    };
})(jQuery);

$(document).ready(function() {
    "use strict";
    window.GGBT_ws_header_footer.init();
});