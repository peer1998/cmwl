
    const SAVVY_PRELOAD_IDS = ["flow_2bc58aj3a8g0d9ddd8j7jbd4g"];
! function() {
    window.Savvy || (window.Savvy = {});
    class MP {
        constructor({
            id: e,
            version: t,
            popup: n
        }, i) {
            log("constructor", {
                id: e,
                version: t,
                popup: n
            }), this.id = e, this.version = t, this.popup = n, this.elementsMounted = [], this.getMyElements = i, this._loadHTML()
        }
        getConfig() {
            return log("getConfig"), {
                id: this.id,
                version: this.version,
                popup: this.popup
            }
        }
        getKey() {
            return log("getKey"), getKey(this)
        }
        onLoadBundle() {
            log("onLoadBundle"), this.bundleLoaded = !0, this._HTMLReady()
        }
        _loadHTML() {
            log("_loadHTML");
            let e = this.getConfig();
            loadMicroProductData(e).then(({
                html: e,
                js: t,
                context: n
            }) => {
                this.html = e, this.waitForBundle = n.wait_for_bundle || !1, this.js = t, this._HTMLReady()
            })
        }
        _HTMLReady(e) {
            log("_HTMLReady", e, this.elements, this.bundleLoaded, this.waitForBundle), this.html && (this.bundleLoaded || !this.waitForBundle) && (e ? this._mountHTML(e) : this.getMyElements().forEach(e => this._mountHTML(e)))
        }
        _mountHTML(element) {
            if (log("_mountHTML() this.elementsMounted, element", this.elementsMounted, element), !this.elementsMounted.includes(element)) {
                this.elementsMounted.push(element), element.el.innerHTML = this.html;
                try {
                    this.js && eval(`(${this.js})({ element: element.el })`)
                } catch (error) {
                    console.error(`Error evaluating JS from Renderer: ${error}`)
                }
            }
        }
    }
    class Element {
        constructor(e) {
            this.el = e, this.defineConfig(), this.updateElementId()
        }
        setMP(e) {
            this.mp = e
        }
        defineConfig() {
            let e = getUrlParams(),
                t = window.location.pathname.split("/").pop();
            this.originalConfig = getOriginalConfigFromElement(this.el);
            let n = !this.el.getAttribute("id") && this.originalConfig.override ? e.id || e.savvy_id || t || env().startsWith("preview") && window.location.pathname.split("/")[1] || localStorageGet("temp_savvy_id") : this.originalConfig.id,
                i = e.savvy_version || e.savvy_flow_version || "prod" !== env() && e.version || this.originalConfig.version || e.savvy_editing && "latest" || void 0;
            this.el.closest("savvy[id*=HLyDMiklDR9R9P6BSxmW]") && (i = e.savvy_flow_editor_version || void 0);
            let s = Boolean(e.popup) || this.originalConfig.popup;
            log("forcedId, forcedVersion, forcedPopup", n, i, s), this.config = {
                ...this.originalConfig,
                id: n,
                version: i,
                popup: s
            }
        }
        getConfig() {
            return this.config
        }
        getOriginalConfig() {
            return this.originalConfig
        }
        updateElementId() {
            this.el.getAttribute("id") === this.config.id && this.el.getAttribute("id").startsWith("flow-") || this.el.setAttribute("id", `flow-${this.config.id}`)
        }
    }
    class MPs {
        constructor() {
            this.mps = {}, this.elements = []
        }
        elementNeedsRegistering(e) {
            let t = getOriginalConfigFromElement(e);
            return !this.elements.find(e => e.config.id === t.id && (e.config.version === t.version || !e.config.version && !t.version) && e.config.popup === t.popup && e.config.override === t.override && e.el === t.el)
        }
        registerElement(e) {
            if (this.elements.length > 1e3) return;
            log("MPs.registerElement", e);
            let t = this.getElement(e);
            t || (t = new Element(e), this.elements.push(t));
            let n = t.getConfig(),
                i = this.getMP(n) || this.createMP(n);
            t.setMP(i), i?._HTMLReady(t), log("Elements:", this.elements), log("MPs:", this.mps)
        }
        getElement(e) {
            return this.elements.find(t => t.el === e)
        }
        getMP(e) {
            return this.mps[getKey(e)]
        }
        createMP(e) {
            if (log("addMP", e), !e.id && !this.mps.length) return;
            let t = getKey(e),
                n = () => this.elements.filter(e => getKey(e.getConfig()) === t),
                i = this.mps[t] || new MP(e, n);
            return this.mps[t] = i, i
        }
        onLoadBundle(e) {
            log("onLoadBundle", e, this.mps), Object.values(this.mps).forEach(e => e.onLoadBundle())
        }
    }

    function getKey({
        id: e,
        version: t,
        popup: n
    }) {
        let i = e;
        return t && (i += ":" + t), n && (i += "?" + n), i
    }

    function getOriginalConfigFromElement(e) {
        let t = t => e.getAttribute(t),
            n = t("id");
        return {
            id: n && n.startsWith("flow-") ? n.replace("flow-", "") : n,
            version: t("version"),
            popup: toBoolean(t("popup-mode") || t("popup")),
            override: toBoolean(t("allow_id_override_from_url"), !0),
            el: e
        }
    }
    let toKey = e => `${e.id}${e.version?`:${e.version}`:""}${e.popup?"|popup":""}`;
    async function beginSavvy(e) {
        let t = env();
        log("Env:", t), time("Page Loaded"), time("DOMContentLoaded"), time("Scanning page"), getUrlParams();
        let n = new MPs;
        var i = document.createElement("script");
        i.src = getBundleSrc(), log("bundleScript.src", i.src), i.async = "async", i.onload = e => n.onLoadBundle(e), document.querySelector("head").appendChild(i), onceDOMLoaded(function(e) {
            if (log("DOMContentLoaded"), r(), timeEnd("DOMContentLoaded"), "undefined" == typeof MutationObserver) interval = setInterval(r, 250), setTimeout(() => {
                clearInterval(interval), timeEnd("Scanning page")
            }, 3e4);
            else {
                let t = document.querySelector("body"),
                    n = new MutationObserver(r);
                t ? n.observe(t, {
                    childList: !0,
                    attributes: !0,
                    subtree: !0
                }) : console.warn("No BODY found on page - can't watch for &lt;savvy&gt; elements to be added.")
            }
        });
        let s = "string" == typeof e ? [{
            id: e
        }] : Array.isArray(e) && "string" == typeof e[0] ? e.map(e => ({
            id: e
        })) : "object" != typeof e || Array.isArray(e) ? e || [{}] : [e];

        function r() {
            document.querySelectorAll("savvy").forEach(async e => {
                let t = n.elementNeedsRegistering(e);
                t && n.registerElement(e)
            })
        }
        log("configs", s), s.forEach(e => {
            n.createMP(e)
        })
    }

    function loadMicroProductData(e) {
        log("config", e);
        let {
            version: t,
            popup: n
        } = e;

        function i() {
            let e = JSON.parse(localStorageGet("SavvyFormUserData") || "{}");
            return log("getUserData() allUserData", JSON.stringify(e, null, 2)), e
        }
        return new Promise((s, r) => {
            let o = e.id;
            if (!o) {
                console.error("No Savvy ID found!");
                return
            }
            let a = i(),
                l = a[o] || {},
                d = {},
                u = "split_",
                c = new Set([]);
            for (let g in l) "current_page_id" === g ? d.pageId = l[g] : (c.has(g) || g.startsWith(u)) && (d[g] = encodeURIComponent(l[g]));
            let h = getUrlParams();
            for (let v in h) "current_page_id" === v ? d.pageId = h[v] : "current_page_key" === v ? d.pageKey = h[v] : "current_page_index" === v ? d.pageIndex = h[v] : d[v] = encodeURIComponent(h[v]);
            t && (!isNaN(+t) || "latest" === t) && (d.version = "latest" === t ? "latest" : +t), n && (d.popup = !0);
            let p = Object.entries(d).map(([e, t]) => `${e}=${t}`);
            log("loadMicroProductData() urlParams", JSON.stringify(h || {}, null, 2)), log("loadMicroProductData() qsParams", JSON.stringify(d || {}, null, 2)), log("loadMicroProductData() qsArray", JSON.stringify(p || {}, null, 2));
            let f = p.length > 0 ? `?${p.join("&")}` : "";
            log("`${getRendererBase()}/${id}${qs}`", `${getRendererBase()}/${o}${f}`);
            let y = /[^a-zA-Z0-9_]/.test(o);
            y || fetch(`${getRendererBase()}/${o}${f}`, {
                method: localStorageGet(`SAVVY_FLOW_JSON-${o}`) ? "POST" : "GET",
                headers: "ci" === env() ? {
                    "Host-Origin": window.location.origin
                } : {},
                body: localStorageGet(`SAVVY_FLOW_JSON-${o}`) || null
            }).then(e => e.json()).then(e => {
                let {
                    html: t,
                    flow: n,
                    userData: r,
                    js: a
                } = e;
                log("response { html, flow, userData, js }", {
                    html: t,
                    flow: n,
                    userData: r,
                    js: a
                }), window.SavvyFlow = window.SavvyFlow || {}, window.SavvyFlow[o] = n;
                let l = i(),
                    d = !n.forget_user_data && l[o] || {},
                    u = {
                        ...d,
                        ...r || {}
                    };
                l[o] = u, n.do_not_store_any_data || localStorageSet("SavvyFormUserData", JSON.stringify(l));
                let c = {
                    wait_for_bundle: n.wait_for_bundle || !1
                };
                s({
                    html: t,
                    js: a,
                    context: c
                })
            })
        })
    }

    function localStorageGet(e) {
        try {
            return localStorage.getItem(e)
        } catch (t) {
            return
        }
    }

    function localStorageSet(e, t) {
        try {
            return localStorage.setItem(e, t)
        } catch (n) {
            return !1
        }
    }

    function getUrlParams() {
        let e = {},
            t = window.location.search;
        if (t) {
            let n = new URLSearchParams(t);
            for (let [i, s] of n) e[i] = s
        }
        return e
    }

    function env() {
        window.location.hostname;
        let e = getUrlParams().savvy_env || localStorageGet("savvy_env");
        return e || "production"
    }

    function getBundleSrc() {
        switch (env()) {
            case "dev":
                return "https://bundle-dev.trysavvy.com/bundle.js";
            case "staging":
                return "https://bundle-staging.trysavvy.com/bundle.js";
            case "side-staging":
                return "https://bundle-side-staging.trysavvy.com/bundle.js";
            case "preview":
            case "production":
                return "https://bundle.trysavvy.com/bundle.js";
            default:
                throw Error("Unknown Environment for Bundle")
        }
    }

    function getRendererBase() {
        switch (env()) {
            case "dev":
                return "https://renderer-dev.trysavvy.com";
            case "staging":
                return "https://renderer-staging.trysavvy.com";
            case "side-staging":
                return "https://renderer-side-staging.trysavvy.com";
            case "preview":
            case "production":
                return "https://renderer.trysavvy.com";
            default:
                throw Error("Unknown Environment for Renderer")
        }
    }

    function onceDOMLoaded(e) {
        "complete" === document.readyState || "loaded" === document.readyState || "interactive" === document.readyState ? e() : document.addEventListener("DOMContentLoaded", e)
    }

    function oncePageLoaded(e) {
        "complete" === document.readyState ? e() : window.addEventListener("load", e)
    }

    function toBoolean(e, t) {
        return [void 0, null, ""].includes(e) && void 0 !== t ? t : "boolean" == typeof e ? e : "string" == typeof e && "true" === e
    }

    function log() {
        (getUrlParams().savvy_debug || localStorageGet("savvy_debug")) && console.log(...arguments)
    }

    function time() {
        (getUrlParams().savvy_debug || localStorageGet("savvy_debug")) && console.time(...arguments)
    }

    function timeEnd() {
        (getUrlParams().savvy_debug || localStorageGet("savvy_debug")) && console.timeEnd(...arguments)
    }

    function logGroupCollapsed(e) {
        (getUrlParams().savvy_debug || localStorageGet("savvy_debug")) && console.groupCollapsed(e)
    }

    function logGroupEnd() {
        (getUrlParams().savvy_debug || localStorageGet("savvy_debug")) && console.groupEnd()
    }

    function removeHashParameters() {
        let e = window.location.href,
            t = e.replace(/#.*$/, "");
        window.history.pushState("", "", t)
    }
    beginSavvy(window.SAVVY_PRELOAD_IDS)
}();
