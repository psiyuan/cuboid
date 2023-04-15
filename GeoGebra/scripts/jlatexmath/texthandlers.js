/*global $, GGBT_wsf_edit, jQuery, console, alert, GGBApplet, renderGGBElement, GGBT_wsf_general, MutationObserver, GGBT_wsf_metadata_edit*/

window.GGBT_texthandlers = (function($) {
    "use strict";

    var clickedJlatex = null;

    function initBBCodeEditor(textField, conf) {
        var mathFound,
            node,
            wbbOpt = {
                lang: conf.defaults.input.text.wysibb_lang,
                resize_maxheight: 3000,
                traceTextarea : false,
                buttons: "[,fontsize,|,bold,italic,underline,strike,sup,sub,fontcolor,|,justify,justifyleft,justifyright,justifycenter,|,bullist,numlist,|,link,|,quote,code,table,removeFormat,img,icons,],math",
                allButtons: {
                    math: {
                        title: conf.defaults.input.text.toolbar.math.title,
                        buttonText: conf.defaults.input.text.toolbar.math.text,
                        buttonHTML: '<span class="mathtools btn-math wysibb-maintool"></span>',
                        modal: { //Description of modal window
                            title: conf.defaults.input.text.dlg_math.title,
                            width: "750px",
                            tabs: [
                                {
                                    input: [ //List of form fields
                                        {   param: "SELTEXT",
                                            type:"math",
                                            btn_basic: conf.defaults.input.text.dlg_math.btn_basic,
                                            btn_greek: conf.defaults.input.text.dlg_math.btn_greek,
                                            btn_operators: conf.defaults.input.text.dlg_math.btn_operators,
                                            btn_relationships: conf.defaults.input.text.dlg_math.btn_relationships,
                                            btn_arrows: conf.defaults.input.text.dlg_math.btn_arrows,
                                            btn_delimiters: conf.defaults.input.text.dlg_math.btn_delimiters,
                                            btn_misc: conf.defaults.input.text.dlg_math.btn_misc
                                        }
                                    ]
                                }
                            ],
                            onLoad: function(cmd,t,opt,queryState) {
                                if (clickedJlatex === null) {
                                    if (opt && opt.seltext) {
                                        var editor = $(this.$body),
                                            range = document.createRange(),
                                            start = 0,
                                            end = opt.seltext.length;

                                        mathFound = false;
                                        node = null;

                                        if (editor.find(".mathquill-embedded-latex").length) {
                                            editor.find(".mathquill-embedded-latex").each(function () {
                                                if ($(this).text() === opt.seltext) {
                                                    node = $(this).get(0);
                                                    mathFound = true;
                                                }
                                            });
                                        }
                                        if (node === null) {
                                            node = editor.get(0);
                                        }

                                        start = node.textContent.indexOf(opt.seltext);

                                        range.setStart(node.firstChild, start);
                                        range.setEnd(node.firstChild, end);
                                        var selection = window.getSelection();
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    }
                                }
                            },
                            onSubmit: function(cmd) {
                                var latex = this.$modal.find('.wysibb-input-math-editor').mathquill('latex'),
                                    toInsert = this.getCodeByCommand(cmd,{seltext:latex});
                                if (mathFound) {
                                    $(node).remove();
                                }
                                if (clickedJlatex !== null) {
                                    clickedJlatex.attr("data-content", $(toInsert).attr("data-content"));
                                    clickedJlatex = null;
                                } else {
                                    this.insertAtCursor(toInsert);
                                }
                                this.closeModal();
                                this.updateUI();
                                if (window.GGBT_texthandlers.isLatexRenderer("jlatexmath")) {
                                    window.GGBT_jlatexmath.drawLatexOnjQuery(initJlatexes($(this.$body.find(".jlatexmath"))));
                                }
                                return false;
                            },
                            onCancel: function() {
                                clickedJlatex = null;
                            }
                        },
                        transform: (function() {
                            if (latexRenderer === "mathquill") {
                                return {
                                    '<span class="mathquill-embedded-latex">{SELTEXT}</span>': '[math]{SELTEXT}[/math]'
                                };
                            } else {
                                return {
                                    '<canvas class="jlatexmath" data-content="{SELTEXT}"></canvas>': '[math]{SELTEXT}[/math]'
                                };
                            }

                        })()
                    },
                    icons : {
                        title: conf.defaults.input.text.toolbar.icons.title,
                        buttonText : conf.defaults.input.text.toolbar.icons.text,
                        buttonHTML: '<span class="icontools btn-icons wysibb-maintool"></span>',
                        modal: { //Description of modal window
                            title: conf.defaults.input.text.dlg_icons.title,
                            width: "724px",
                            tabs: [
                                {
                                    input: [ //List of form fields
                                        {param: "SRC",type:"icons"}
                                    ]
                                }
                            ],
                            onLoad: function() {
                            },
                            onSubmit: function(cmd, opt, queryState) {
                                var icon = this.$modal.find('.wysibb-input-icon-editor img.selected'),
                                    src;
                                if (icon.length) {
                                    src = icon.attr("src");
                                    if (src) {
                                        this.insertAtCursor(this.getCodeByCommand(cmd, {SRC : src}));
                                        this.closeModal();
                                        this.updateUI();
                                    }
                                }
                                //this.insertAtCursor(this.getCodeByCommand(cmd,{seltext:icon}));
                                //this.closeModal();
                                //this.updateUI();
                                return false;
                            }
                        },
                        transform: {
                            //'<div class="myquote">{SELTEXT}</div>':'[math]{SELTEXT}[/math]'
                            '<img  class="wsf-icon" src="{SRC}"/>':'[icon]{SRC}[/icon]'

                        }
                    },
                    texttools : {
                        title:  conf.defaults.input.text.toolbar.text.title,
                        buttonText: '[Text]',
                        buttonHTML: '<span class="texttools btn-text wysibb-maintool"></span>'
                    },
                    letterList : {
                        excmd: 'insertOrderedList',
                        transform : {
                            '<ol type="a">{SELTEXT}</ol>':"[list=a]{SELTEXT}[/list]",
                            '<li>{SELTEXT}</li>':"[*]{SELTEXT}[/*]"
                        }
                    }

                },
                customKeyDown: function() {
                    if (conf.customKeyDown) {
                        conf.customKeyDown(this);
                    }
                },
                modalClosed: function(t) {
                    if (conf.modalClosed) {
                        conf.modalClosed(t);
                    }
                }
            };
        textField.wysibb(wbbOpt);
    }

    var latexRenderer = "mathquill";

    function setLatexRenderer(renderer) {
        latexRenderer = renderer;
    }

    function isLatexRenderer(renderer) {
        return latexRenderer === renderer;
    }

    function setClickedJlatex(jlatex) {
        clickedJlatex = jlatex;
    }

    function getClickedJlatex(jlatex) {
        return clickedJlatex;
    }

    function initJlatexes(latexes) {
        if (latexes.length) {
            latexes.off("click").on("click", function(e) {
                var latex = $(this);
                window.GGBT_texthandlers.setClickedJlatex(latex);
                $(latex.parents(".wysibb").find(".wbb-math")).trigger("mousedown");
            });
            latexes.attr("contenteditable", "false");
        }
        return latexes;
    }

    function getHTMLFromBBCode (bbdata,skiplt) {
        if (bbdata === null || bbdata === "" || bbdata === undefined) {
            return '';
        }

        bbdata = bbdata.replace(/\[br\]/g, "\r\n");
        bbdata = bbdata.replace(/\$/g, '&#36;');

        if (skiplt) {
            bbdata = bbdata.replace(/</g, '&lt;');
            bbdata = bbdata.replace(/>/g, '&gt;');
        }

        var usedTags = ["bold","italic","underline","strike","sup","sub","img","video","link","bullist","numlist", "letterlist","fontcolor","fontsize","fontfamily","justify","justifyleft","justifycenter","justifyright","quote","code","table","math","fs_verysmall", "fs_small", "fs_normal", "fs_big", "fs_verybig", "icon", "button", "button_small", "hl_button", "hl_button_small"],
            allTags = {
                math: {
                    transform: (function() {
                        if (latexRenderer === "mathquill") {
                            return {
                                '<span class="mathquill-embedded-latex">{SELTEXT}</span>': '[math]{SELTEXT}[/math]'
                            };
                        } else {
                            return {
                                '<canvas class="jlatexmath" data-content="{SELTEXT}" width="1" height="1"></canvas>': '[math]{SELTEXT}[/math]'
                            };
                        }

                    })()
                },
                bold : {
                    transform : {
                        '<b>{SELTEXT}</b>':"[b]{SELTEXT}[/b]",
                        '<strong>{SELTEXT}</strong>':"[b]{SELTEXT}[/b]"
                    }
                },
                italic : {
                    transform : {
                        '<i>{SELTEXT}</i>':"[i]{SELTEXT}[/i]",
                        '<em>{SELTEXT}</em>':"[i]{SELTEXT}[/i]"
                    }
                },
                underline : {
                    transform : {
                        '<u>{SELTEXT}</u>':"[u]{SELTEXT}[/u]"
                    }
                },
                strike : {
                    transform : {
                        '<strike>{SELTEXT}</strike>':"[s]{SELTEXT}[/s]",
                        '<s>{SELTEXT}</s>':"[s]{SELTEXT}[/s]"
                    }
                },
                sup : {
                    transform : {
                        '<sup>{SELTEXT}</sup>':"[sup]{SELTEXT}[/sup]"
                    }
                },
                sub : {
                    transform : {
                        '<sub>{SELTEXT}</sub>':"[sub]{SELTEXT}[/sub]"
                    }
                },
                link : {
                    transform : {
                        '<a href="{URL}" target="_blank">{SELTEXT}</a>':"[url={URL}]{SELTEXT}[/url]",
                        '<a href="{URL}" target="_blank">{URL}</a>':"[url]{URL}[/url]"
                    }
                },
                img : {
                    transform : {
                        '<img src="{SRC}" />':"[img]{SRC}[/img]",
                        '<img src="{SRC}" width="{WIDTH}" height="{HEIGHT}"/>':"[img width={WIDTH},height={HEIGHT}]{SRC}[/img]"
                    }
                },
                bullist : {
                    transform : {
                        '<ul class="bbcode-list">{SELTEXT}</ul>':"[list]{SELTEXT}[/list]",
                        '<li>{SELTEXT}</li>':"[*]{SELTEXT}[/*]"
                    }
                },
                numlist : {
                    transform : {
                        '<ol class="bbcode-list">{SELTEXT}</ol>':"[list=1]{SELTEXT}[/list]",
                        '<li>{SELTEXT}</li>':"[*]{SELTEXT}[/*]"
                    }
                },
                letterlist : {
                    buttonHTML: '<span class="fonticon ve-tlb-numlist1">\uE00a</span>',
                    excmd: 'insertOrderedList',
                    transform : {
                        '<ol class="bbcode-list type-a" type="a">{SELTEXT}</ol>':"[list=a]{SELTEXT}[/list]",
                        '<li>{SELTEXT}</li>':"[*]{SELTEXT}[/*]"
                    }
                },
                quote : {
                    transform : {
                        '<blockquote>{SELTEXT}</blockquote>':"[quote]{SELTEXT}[/quote]"
                    }
                },
                code : {
                    transform : {
                        '<code>{SELTEXT}</code>':"[code]{SELTEXT}[/code]"
                    }
                },
                offtop : {
                    transform : {
                        '<span style="font-size:10px;color:#ccc">{SELTEXT}</span>':"[offtop]{SELTEXT}[/offtop]"
                    }
                },
                fontcolor: {
                    transform: {
                        '<font color="{COLOR}">{SELTEXT}</font>':'[color={COLOR}]{SELTEXT}[/color]'
                    }
                },
                table: {
                    transform: {
                        '<td nowrap>{SELTEXT}</td>': '[td nowrap]{SELTEXT}[/td]',
                        '<td>{SELTEXT}</td>': '[td]{SELTEXT}[/td]',
                        '<tr>{SELTEXT}</tr>': '[tr]{SELTEXT}[/tr]',
                        '<tr class="{ID}">{SELTEXT}</tr>': '[tr id={ID}]{SELTEXT}[/tr]',
                        '<table class="wbb-table">{SELTEXT}</table>': '[table]{SELTEXT}[/table]'
                    },
                    skipRules: true
                },
                fontsize: {
                    type: 'select',
                    options: "fs_verysmall,fs_small,fs_normal,fs_big,fs_verybig"
                },
                fontfamily: {
                    transform: {
                        '<font face="{FONT}">{SELTEXT}</font>':'[font={FONT}]{SELTEXT}[/font]'
                    }
                },
                justify: {
                    transform: {
                        '<p style="text-align:justify">{SELTEXT}</p>': '[justify]{SELTEXT}[/justify]'
                    }
                },
                justifyleft: {
                    transform: {
                        '<p style="text-align:left">{SELTEXT}</p>': '[left]{SELTEXT}[/left]'
                    }
                },
                justifyright: {
                    transform: {
                        '<p style="text-align:right">{SELTEXT}</p>': '[right]{SELTEXT}[/right]'
                    }
                },
                justifycenter: {
                    transform: {
                        '<p style="text-align:center">{SELTEXT}</p>': '[center]{SELTEXT}[/center]'
                    }
                },
                video: {
                    transform: {
                        '<iframe src="http://www.youtube.com/embed/{SRC}" width="640" height="480" frameborder="0"></iframe>':'[video]{SRC}[/video]'
                    }
                },

                //select options
                fs_verysmall: {
                    transform: {
                        '<span class="font-size-1">{SELTEXT}</span>':'[size=50]{SELTEXT}[/size]'
                    }
                },
                fs_small: {
                    transform: {
                        '<span class="font-size-2">{SELTEXT}</span>':'[size=85]{SELTEXT}[/size]'
                    }
                },
                fs_normal: {
                    transform: {
                        '<span class="font-size-3">{SELTEXT}</span>':'[size=100]{SELTEXT}[/size]'
                    }
                },
                fs_big: {
                    transform: {
                        '<span class="font-size-4">{SELTEXT}</span>':'[size=150]{SELTEXT}[/size]'
                    }
                },
                fs_verybig: {
                    transform: {
                        '<span class="font-size-5">{SELTEXT}</span>':'[size=200]{SELTEXT}[/size]'
                    }
                },
                icon: {
                    transform: {
                        '<img  class="wsf-icon" src="{SRC}"/>':'[icon]{SRC}[/icon]'
                    }
                },
                button: {
                    transform: {
                        '<a class="button">{SELTEXT}</a>':'[button]{SELTEXT}[/button]'
                    }
                },
                button_small: {
                    transform: {
                        '<a class="button tiny">{SELTEXT}</a>':'[button_small]{SELTEXT}[/button_small]'
                    }
                },
                hl_button: {
                    transform: {
                        '<a class="button highlight">{SELTEXT}</a>':'[hl_button]{SELTEXT}[/hl_button]'
                    }
                },
                hl_button_small: {
                    transform: {
                        '<a class="button tiny highlight">{SELTEXT}</a>':'[hl_button_small]{SELTEXT}[/hl_button_small]'
                    }
                }
            },
            systr =  {
                '<br />' : "[br]",
                '<li>' : '[*]',
                '<span class="wbbtab">{SELTEXT}</span>': '   {SELTEXT}'
            },
            customRules = {
                td: [["[td]{SELTEXT}[/td]",{seltext: {rgx:false,attr:false,sel:false}}]],
                tr: [["[tr]{SELTEXT}[/tr]",{seltext: {rgx:false,attr:false,sel:false}}]],
                table: [["[table]{SELTEXT}[/table]",{seltext: {rgx:false,attr:false,sel:false}}]]
                //blockquote: [["   {SELTEXT}",{seltext: {rgx:false,attr:false,sel:false}}]]
            },
            smileList = [
                //{title:CURLANG.sm1, img: '<img src="{themePrefix}{themeName}/img/smiles/sm1.png" class="sm">', bbcode:":)"},
            ],
            attrWrap = ['src','color','href']; //use becouse FF and IE change values for this attr, modify [attr] to _[attr]

        function keysToLower(o) {
            $.each(o,function(k,v) {
                if (k!==k.toLowerCase()) {
                    delete o[k];
                    o[k.toLowerCase()]=v;
                }
            });
            return o;
        }

        function strf(str,data) {
            data = keysToLower($.extend({},data));
            return str.replace(/\{([\w\.]*)\}/g, function (str, key) {key = key.toLowerCase();var keys = key.split("."), value = data[keys.shift().toLowerCase()];$.each(keys, function () { value = value[this]; }); return (value === null || value === undefined) ? "" : value;});
        }

        function changeIn(data, context,fn){
	    return data.replace(new RegExp("\\["+context+"\\]([\\s\\S]*?)\\[/"+context+"\\]","g"),function(s) {
                s = fn(s.substr(context.length+2,s.length-2*context.length-2-3));
                return "["+context+"]"+s+"[/"+context+"]";
            });
	}

        bbdata = changeIn(bbdata, "code", function(a){
	  return a.replace(/\[/g,"&#91;").replace(/\]/g,"&#93;");})

	bbdata = changeIn(bbdata,"math",function(a){
	  return a.replace(/\[br\]/g," ");});


        $.each(usedTags,function(i,b){
            var find=true;
            if (!allTags[b] || !allTags[b].transform) {
                //console.log("unknown tag?");
                return true;
            }

            $.each(allTags[b].transform,function(html,bb) {
                html = html.replace(/\n/g,""); //IE 7,8 FIX
                var a=[];
                bb = bb.replace(/(\(|\)|\[|\]|\.|\*|\?|\:|\\|\\)/g,"\\$1");
                //.replace(/\s/g,"\\s");
                bb = bb.replace(/\{(.*?)(\\\[.*?\\\])*\}/gi,function(str,s,vrgx) {
                    a.push(s);
                    if (vrgx) {
                        //has validation regexp
                        vrgx = vrgx.replace(/\\/g,"");
                        return "("+vrgx+"*?)";
                    }
                    return "([\\s\\S]*?)";
                });
                var n=0,am;
                while ((am = (new RegExp(bb,"mgi")).exec(bbdata)) !== null) {
                    if (am) {
                        var r={};
                        $.each(a,function(i,k) {
                            r[k]=am[i+1];
                        });
                        var nhtml = html;
                        nhtml = nhtml.replace(/\{(.*?)(\[.*?\])\}/g,"{$1}");
                        nhtml = strf(nhtml,r);
                        bbdata = bbdata.replace(am[0],nhtml);
                    }
                }
            });
        });

        //transform system codes
        $.each(systr,function(html,bb) {
            bb = bb.replace(/(\(|\)|\[|\]|\.|\*|\?|\:|\\|\\)/g,"\\$1")
                .replace(" ","\\s");
            bbdata = bbdata.replace(new RegExp(bb,"g"),html);
        });


        //var $wrap = $(elFromString("<div>"+bbdata+"</div>"));
        //transform smiles
        /* $wrap.contents().filter(function() {return this.nodeType==3}).each($.proxy(smilerpl,this)).end().find("*").contents().filter(function() {return this.nodeType==3}).each($.proxy(smilerpl,this));

         function smilerpl(i,el) {
         var ndata = el.data;
         $.each(this.options.smileList,$.proxy(function(i,row) {
         var fidx = ndata.indexOf(row.bbcode);
         if (fidx!=-1) {
         var afternode_txt = ndata.substring(fidx+row.bbcode.length,ndata.length);
         var afternode = document.createTextNode(afternode_txt);
         el.data = ndata = el.data.substr(0,fidx);
         $(el).after(afternode).after(this.strf(row.img,this.options));
         }
         },this));
         } */
        //this.getHTMLSmiles($wrap);
        //$wrap.contents().filter(function() {return this.nodeType==3}).each($.proxy(this,smileRPL,this));

        //return $wrap.html();

        return bbdata;
    }

    function isJlatexInited() {
        return window.jlmlib !== undefined;
    }

    return {
        initBBCodeEditor: initBBCodeEditor,
        getHTMLFromBBCode : getHTMLFromBBCode,
        setLatexRenderer : setLatexRenderer,
        isLatexRenderer: isLatexRenderer,
        setClickedJlatex : setClickedJlatex,
        getClickedJlatex : getClickedJlatex,
        initJlatexes : initJlatexes,
        isJlatexInited: isJlatexInited
    };
})(jQuery);
