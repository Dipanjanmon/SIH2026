(function () {
    var WIDGET_HTML = `<div class="fixed bottom-5 right-5 z-[60] flex items-center gap-2.5">
        <div id="aiLabel" class="ai-label-anim ai-cycle-hide whitespace-nowrap">
            <span id="aiLabelText" class="text-lg font-bold text-blue-900"></span><span id="aiCaret" class="ai-caret ml-0.5 text-lg font-bold text-blue-500">|</span>
        </div>
        <div id="aiFab" onclick="AID.toggle()" class="ai-cycle-shown ai-glow-container flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 shadow-2xl shadow-blue-900/40 ring-4 ring-blue-700/25 hover:scale-105 hover:ring-blue-600/50 transition-all duration-300" title="AI Help Desk">
            <img id="aiFabImg" src="img/icon/male_ai_help_desk.png" alt="AI Help Desk" class="h-16 w-16 rounded-full object-cover">
        </div>
    </div>

    <div id="aiPanel" class="fixed bottom-24 right-5 z-[60] flex w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-blue-900/30 ring-1 ring-slate-200 border border-slate-200 transition-all duration-300 opacity-0 translate-y-6 pointer-events-none" style="max-height:min(600px,calc(100vh - 8rem));">
        <div class="h-1 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]"></div>
        <div class="flex items-center gap-3 bg-gradient-to-br from-blue-900 to-indigo-950 px-4 py-3 text-white">
            <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/30">
                    <img id="aiAvatar" src="img/icon/male_ai_help_desk.png" alt="AI Assistant" class="h-11 w-11 rounded-full object-cover">
                </div>
            <div class="flex-1">
                <div class="text-sm font-bold leading-tight">PashuSahaya AI Help Desk</div>
                <div class="flex items-center gap-1 text-[10px] text-blue-200">
                    <span class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online &middot; <span id="aiGenText">Dr. Arjun &middot; AI assistant</span>
                </div>
            </div>
<button onclick="AID.toggle()" class="rounded-full p-1.5 hover:bg-white/10"><svg data-lucide="X" class="h-5 w-5"></svg></button>
        </div>
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2">
            <span class="text-[11px] font-semibold text-slate-500">Assistant:</span>
            <div class="flex items-center gap-1.5">
                <div class="flex rounded-full bg-slate-100 p-1">
                    <button onclick="AID.setGender('male')" data-g="male" class="ai-gender-opt flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 opacity-60 transition-all">
                        <img src="img/icon/male_ai_help_desk.png" alt="Arjun" class="h-5 w-5 rounded-full object-cover">
                        Arjun
                    </button>
                    <button onclick="AID.setGender('female')" data-g="female" class="ai-gender-opt flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 opacity-60 transition-all">
                        <img src="img/icon/female_ai_help_desk.jpg" alt="Ananya" class="h-5 w-5 rounded-full object-cover">
                        Ananya
                    </button>
                </div>
                <button id="aiAutoBtn" onclick="AID.toggleAuto()" class="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow" title="Auto switch male/female">
                    <svg data-lucide="RefreshCw" class="h-3.5 w-3.5"></svg> AUTO
                </button>
            </div>
        </div>

        <div id="aiChips" class="flex gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-3 py-2">
            <button onclick="AID.quick('outbreak')" class="ai-chip rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">Active outbreak</button>
            <button onclick="AID.quick('vaccination')" class="ai-chip rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">Vaccination</button>
            <button onclick="AID.quick('mvu')" class="ai-chip rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">MVU status</button>
            <button onclick="AID.quick('helpline')" class="ai-chip rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">Helpline</button>
        </div>
        <div id="aiMsgs" class="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-3"></div>
        <div id="aiAttach" class="hidden flex-wrap items-center gap-1.5 bg-white px-3 pt-2"></div>
        <div class="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5">
            <button onclick="AID.upload()" class="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700" title="Upload file">
                <svg data-lucide="Paperclip" class="h-4 w-4 rotate-45"></svg>
            </button>
            <input id="aiFileInput" type="file" multiple accept=".xls,.xlsx,.jpg,.jpeg,.png,.tiff,.tif,.dcm,.doc,.docx,.pdf" class="hidden" onchange="AID.onFiles(this)">
            <input id="aiInput" type="text" placeholder="Ask anything about livestock, outbreaks, camps..." autocomplete="off" class="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" onkeydown="if(event.key==='Enter')AID.send()">
            <button onclick="AID.send()" class="rounded-full bg-gradient-to-br from-blue-700 to-blue-900 p-2.5 text-white shadow-md hover:opacity-90"><svg data-lucide="Send" class="h-4 w-4"></svg></button>
        </div>
        <div class="px-3 pb-2 text-[9px] leading-tight text-slate-400">Supports: XLS/XLSX &middot; DICOM (.dcm) &middot; JPG/JPEG &middot; PNG &middot; TIFF &middot; DOC/DOCX &middot; PDF</div>
    </div>`;
var root = document.createElement('div');
    root.id = 'aiWidgetRoot';
    var AI_BASE = location.pathname.indexOf('/Ai_Ui/') > -1 ? '../' : '';
    WIDGET_HTML = WIDGET_HTML.replace(/src="img\//g, 'src="' + AI_BASE + 'img/');
    root.innerHTML = WIDGET_HTML;
    document.body.appendChild(root);
            function esc(s) {
                return s.replace(/[<>&"']/g, function (c) {
                    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
                });
            }
            var KB = [
                { re: /(outbreak|case|infected|cattle|lsd|fmd|ppr|avian|bird|flu|swine|disease|zoonotic)/i, reply: 'Active outbreak summary &mdash; LSD in Gir breed cattle (Gujarat), FMD with vesicular lesions (Rajasthan), PPR (Rajasthan), Avian Influenza H5N1 with culling zone (Alappuzha, Kerala) and ASF under movement ban (Kamrup, Assam). All cases are geo-tagged with lab confirmation in the Cases module. Current flash alerts: 14 active &middot; 9 quarantine orders issued.' },
                { re: /(vaccine|vaccin|camp|dose|booster|ring|immun)/i, reply: 'The Vaccination module tracks coverage across all districts &mdash; administered vs target doses (in lakh). Ring vaccination is active around LSD/FMD hotspots with winter booster campaigns for FMD &amp; LSD. Field vaccination camps are scheduled state-wise with live coverage %.' },
                { re: /(mvu|mobile|vehicle|dispatch|van|fleet|driver)/i, reply: 'Mobile Veterinary Unit dispatch &mdash; 12 response teams, 7 deployed in field, 5 en route/standby across 11 zones. Each MVU carries rapid diagnostic kits, cold-chain vaccines and emergency medicines. Live dispatch log available in the MVU module.' },
                { re: /(helpline|compensation|subsidy|claim|reimburs|fund|money|1962)/i, reply: 'Helpline 1962 (toll-free, 24x7). Compensation for notified disease losses is disbursed under state schemes &mdash; current disbursement cross 4.2 Cr. File and track claims from the Reports module or your district veterinary office.' },
                { re: /(quarantine|ban|movement|contain|zone|culling|bio.?securit)/i, reply: 'Containment status &mdash; 9 active quarantine orders, culling zone for H5N1 (Kerala), ASF movement ban (Assam) and border checkpoints active in 8 districts. Refer to the Cases module &raquo; Action Taken column for per-outbreak biosafety measures.' },
                { re: /(lab|test|sample|rt-?pcr|saliva|serolog|confirm)/i, reply: 'Regional veterinary labs perform RT-PCR, serotyping and whole-genome sequencing. Lab module shows 4,236 samples tested (1,179 positive). Per-case collection, test and confirmation status is updated live.' },
                { re: /(vaccine code|report|form|document|permit|certificate|nodal|officer|helpline number)/i, reply: 'Government coordination &mdash; 58 nodal officers across states and 180 district contacts. Submit reports, access formats and track compensation in the Reports module. The full nodal officer directory is in the Govteam module.' },
            ];
            function answer(q) {
                for (var i = 0; i < KB.length; i++) {
                    if (KB[i].re.test(q)) return KB[i].reply;
                }
                return 'I provide information on active disease outbreaks, field vaccination campaigns, MVU dispatch tracking, regional lab test results, quarantine/containment orders and the national helpline (1962). You can use the quick chips above or ask about &quot;outbreak status&quot;, &quot;vaccination camp&quot;, &quot;MVU team&quot; or &quot;helpline 1962&quot;.';
            }
            function bubble(html, who) {
                var m = document.createElement('div');
                m.className = who === 'u' ? 'flex justify-end' : 'flex justify-start items-end gap-2';
                if (who === 'b') {
                    var av = document.createElement('div');
                    av.className = 'h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-blue-200';
                    av.innerHTML = '<img class="ai-bot-av h-7 w-7 rounded-full object-cover" src="' + (window.AID ? window.AID.genderSrc() : 'img/icon/male_ai_help_desk.png') + '">';
                    m.appendChild(av);
                }
                var b = document.createElement('div');
                b.className = who === 'u' ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-700 to-blue-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow' : 'max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 shadow-sm';
                b.innerHTML = html;
                m.appendChild(b);
                document.getElementById('aiMsgs').appendChild(m);
                document.getElementById('aiMsgs').scrollTop = document.getElementById('aiMsgs').scrollHeight;
            }
            function typing() {
                var m = document.createElement('div');
                m.className = 'flex items-end gap-2 ai-typing';
                var av = document.createElement('div');
                av.className = 'h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-blue-200';
                av.innerHTML = '<img class="ai-bot-av h-7 w-7 rounded-full object-cover" src="' + (window.AID ? window.AID.genderSrc() : 'img/icon/male_ai_help_desk.png') + '">';
                m.appendChild(av);
                var b = document.createElement('div');
                b.className = 'rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm';
                b.innerHTML = '<i></i><i></i><i></i>';
                m.appendChild(b);
                var box = document.getElementById('aiMsgs');
                box.appendChild(m);
                box.scrollTop = box.scrollHeight;
                return m;
            }
            function ts() {
                var d = new Date();
                return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            }
            var MALE_TEXTS = ['AI Help Desk', 'রোগ নজরদারি ও দ্রুত প্রতিক্রিয়া', 'জরুরি হেল্পলাইন 1962', 'টিকা ও রোগ-নিয়ন্ত্রণ তথ্য', 'সচল প্রাদুর্ভাব ব্যবস্থাপনা'];
            var FEMALE_TEXTS = ['AI Help Desk', 'গবাদি-পশুর স্বাস্থ্য উপদেশ', 'প্রতিরোধ টিকাকরণ সহায়তায়', 'কৃষক সহায়তা ও দাবি পূরণ', 'রোগ-গবেষণা ও প্রতিবেদন'];
            function genderTexts() {
                return window.AID && window.AID.gender === 'female' ? FEMALE_TEXTS : MALE_TEXTS;
            }
            function aiName() {
                return (window.AID && window.AID.gender === 'female') ? 'Dr. Ananya AI' : 'Dr. Arjun AI';
            }
            var aiCycleOn = false, aiIdx = -1, aiCycles = 0, aiTimer = null;
            function aiNext() {
                if (!aiCycleOn) return;
                aiCycles++;
                if (window.AID && window.AID.auto && aiCycles % 3 === 0) {
                    window.AID.setGender(window.AID.gender === 'male' ? 'female' : 'male', true);
                }
                var list = genderTexts();
                aiIdx = (aiIdx + 1) % list.length;
                var text = list[aiIdx];
                var parts;
                if (window.Intl && Intl.Segmenter) {
                    parts = Array.from(new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(text), function (s) { return s.segment; });
                } else {
                    parts = Array.from(text);
                }
                var lbl = document.getElementById('aiLabel');
                var fab = document.getElementById('aiFab');
                var t = document.getElementById('aiLabelText');
                var caret = document.getElementById('aiCaret');
                if (t) t.textContent = '';
                if (caret) caret.style.display = 'inline-block';
                if (lbl) { lbl.classList.remove('ai-cycle-hide', 'ai-hide-l'); lbl.classList.add('ai-cycle-shown'); }
                if (fab) { fab.classList.remove('ai-cycle-hide'); fab.classList.add('ai-cycle-shown'); }
                var i = 0;
                function type() {
                    if (!aiCycleOn) return;
                    i++;
                    if (t) t.textContent = parts.slice(0, i).join('');
                    if (i < parts.length) {
                        aiTimer = setTimeout(type, 48);
                    } else {
                        if (caret) caret.style.display = 'none';
                        aiTimer = setTimeout(function () { aiHideAll(); }, 5000);
                    }
                }
                aiTimer = setTimeout(type, 250);
            }
            function aiHideAll() {
                if (!aiCycleOn) return;
                var l2 = document.getElementById('aiLabel');
                var f2 = document.getElementById('aiFab');
                if (l2) { l2.classList.remove('ai-cycle-shown'); l2.classList.add('ai-cycle-hide', 'ai-hide-l'); }
                if (f2) { f2.classList.remove('ai-cycle-shown'); f2.classList.add('ai-cycle-hide'); }
                aiTimer = setTimeout(aiNext, 1200);
            }
            function aiStartCycle() {
                if (aiCycleOn) return;
                aiCycleOn = true;
                aiNext();
            }
            function aiStopCycle() {
                aiCycleOn = false;
                if (aiTimer) clearTimeout(aiTimer);
                aiTimer = null;
            }
            window.AID = {
                gender: 'male',
                auto: true,
                attach: [],
                _fIcon: function (name) {
                    var n = name.toLowerCase();
                    if (n.match(/\.(xls|xlsx|csv)$/)) return 'FileSpreadsheet';
                    if (n.match(/\.(dcm|dicom)$/)) return 'ScanLine';
                    if (n.match(/\.(jpg|jpeg|png|tiff|tif)$/)) return 'FileImage';
                    if (n.match(/\.(pdf)$/)) return 'FileBadge';
                    if (n.match(/\.(doc|docx)$/)) return 'FileText';
                    return 'Paperclip';
                },
                upload: function () {
                    var f = document.getElementById('aiFileInput');
                    if (f) f.click();
                },
                onFiles: function (inp) {
                    this.attach = Array.prototype.slice.call(inp.files || []);
                    inp.value = '';
                    this.renderAttach();
                },
                renderAttach: function () {
                    var box = document.getElementById('aiAttach');
                    if (!box) return;
                    if (!this.attach.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
                    box.classList.remove('hidden');
                    var html = '';
                    for (var i = 0; i < this.attach.length; i++) {
                        var f = this.attach[i];
                        html += '<div class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600"><svg data-lucide="' + this._fIcon(f.name) + '" class="h-3.5 w-3.5"></svg><span class="max-w-[130px] truncate font-semibold text-slate-700">' + esc(f.name) + '</span><button onclick="AID.removeAt(' + i + ')" class="text-slate-400 hover:text-red-500"><svg data-lucide="X" class="h-3 w-3"></svg></button></div>';
                    }
                    box.innerHTML = html;
                    if (window.lucide) lucide.createIcons();
                },
                removeAt: function (i) {
                    this.attach.splice(i, 1);
                    this.renderAttach();
                },
                genderSrc: function () {
                    return this.gender === 'female' ? 'img/icon/female_ai_help_desk.jpg' : 'img/icon/male_ai_help_desk.png';
                },
                setGender: function (g, silent) {
                    this.gender = g;
                    if (!silent) {
                        this.auto = false;
                        var autb = document.getElementById('aiAutoBtn');
                        if (autb) { autb.classList.remove('bg-blue-600', 'text-white'); autb.classList.add('text-blue-600'); }
                    }
                    var src = this.genderSrc();
                    var fav = document.getElementById('aiFabImg');
                    if (fav) {
                        fav.classList.remove('ai-pop');
                        void fav.offsetWidth;
                        fav.classList.add('ai-pop');
                        fav.src = src;
                    }
                    var av = document.getElementById('aiAvatar');
                    if (av) {
                        av.classList.remove('ai-pop');
                        void av.offsetWidth;
                        av.classList.add('ai-pop');
                        av.src = src;
                    }
                    var txt = document.getElementById('aiGenText');
                    if (txt) txt.textContent = g === 'female' ? 'Dr. Ananya \u00b7 AI assistant' : 'Dr. Arjun \u00b7 AI assistant';
                    var nm = (g === 'female') ? 'Dr. Ananya AI' : 'Dr. Arjun AI';
                    document.querySelectorAll('.ai-msg-name').forEach(function (el) { el.textContent = nm; });
                    document.querySelectorAll('.ai-bot-av').forEach(function (i) { i.src = src; });
                    document.querySelectorAll('.ai-gender-opt').forEach(function (b) {
                        var active = b.getAttribute('data-g') === g;
                        b.classList.toggle('bg-gradient-to-br', active);
                        b.classList.toggle('from-blue-700', active);
                        b.classList.toggle('to-blue-900', active);
                        b.classList.toggle('text-white', active);
                        b.classList.toggle('shadow-md', active);
                        b.classList.toggle('opacity-100', active);
                        b.classList.toggle('opacity-60', !active);
                        b.classList.toggle('text-slate-600', !active);
                    });
                },
                toggleAuto: function () {
                    this.auto = !this.auto;
                    var b = document.getElementById('aiAutoBtn');
                    if (b) {
                        b.classList.toggle('bg-blue-600', this.auto);
                        b.classList.toggle('text-white', this.auto);
                        b.classList.toggle('text-blue-600', !this.auto);
                    }
                },
                open: false,
                toggle: function () {
                    var pan = document.getElementById('aiPanel');
                    var fab = document.getElementById('aiFab');
                    var label = document.getElementById('aiLabel');
                    if (this.open) {
                        pan.classList.add('opacity-0', 'translate-y-6', 'pointer-events-none');
                        pan.classList.remove('opacity-100', 'translate-y-0');
                        if (label) { label.classList.remove('ai-label-fixed', 'ai-cycle-hide', 'ai-cycle-shown'); }
                        if (fab) { fab.classList.remove('ai-idle', 'ai-cycle-hide', 'ai-cycle-shown'); }
                        this.open = false;
                        aiStartCycle();
                    } else {
                        pan.classList.remove('opacity-0', 'translate-y-6', 'pointer-events-none');
                        pan.classList.add('opacity-100', 'translate-y-0');
                        aiStopCycle();
                        if (label) { label.classList.remove('ai-cycle-shown', 'ai-hide-l'); label.classList.add('ai-cycle-hide'); }
                        if (fab) { fab.classList.remove('ai-cycle-hide'); fab.classList.add('ai-idle', 'ai-cycle-shown'); }
                        this.open = true;
                        document.getElementById('aiInput').focus();
                        setTimeout(function () { document.getElementById('aiMsgs').scrollTop = document.getElementById('aiMsgs').scrollHeight; }, 60);
                    }
                },
                send: function () {
                    var inp = document.getElementById('aiInput');
                    var q = inp.value.trim();
                    var att = this.attach;
                    if (!q && !att.length) return;
                    if (this._busy) return;
                    inp.value = '';
                    this._busy = true;
                    var attHtml = '';
                    if (att.length) {
                        attHtml = '<div class="mt-1.5 flex flex-col gap-0.5">' + att.map(function (a) {
                            return '<div class="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-50"><svg data-lucide="' + (window.AID ? window.AID._fIcon(a.name) : 'Paperclip') + '" class="h-3 w-3"></svg>' + esc(a.name) + '</div>';
                        }).join('') + '</div>';
                    }
                    bubble('<span class="text-[10px] font-semibold text-blue-100/80">You &middot; ' + ts() + '</span><br>' + esc(q) + attHtml, 'u');
                    var t = typing();
                    var self = this;
                    setTimeout(function () {
                        if (t.parentNode) t.parentNode.removeChild(t);
                        var reply = answer(q);
                        if (att.length) {
                            reply += '<br><div class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700">Attachment received and associated with the case workspace: ' + att.map(function (a) { return esc(a.name); }).join(', ') + '.</div>';
                        }
                        bubble('<span class="ai-msg-name text-[10px] font-semibold text-blue-700/60">' + aiName() + '</span><span class="text-[10px] font-semibold text-blue-700/60"> &middot; ' + ts() + '</span><br>' + reply, 'b');
                        self._busy = false;
                        self.attach = [];
                        self.renderAttach();
                        if (window.lucide) lucide.createIcons();
                    }, 900);
                },
                quick: function (k) {
                    var map = { outbreak: 'Latest outbreak status?', vaccination: 'Vaccination camps schedule', mvu: 'MVU team status', helpline: 'Helpline & compensation' };
                    document.getElementById('aiInput').value = map[k] || map.outbreak;
                    this.send();
                }
            };
            window.AID.setGender('male', true);
            aiStartCycle();
            bubble('<span class="ai-msg-name text-[10px] font-semibold text-blue-700/60">' + aiName() + '</span><span class="text-[10px] font-semibold text-blue-700/60"> &middot; ' + ts() + '</span><br>Namaste! I am <span class="ai-msg-name font-semibold">' + aiName() + '</span> &mdash; National Livestock Disease Surveillance &amp; Response system. I assist field veterinary officers, nodal officers and farmers with outbreak tracking, vaccination coverage, MVU dispatch, lab test reports, quarantine status and the national helpline (1962).', 'b');
            if (window.lucide) lucide.createIcons();
        })();
