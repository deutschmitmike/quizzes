// Test-Umgebung: laedt eine gebaute Seite (index.html) in einer DOM-Attrappe und gibt Zugriff auf die Interna.
// Uhr ist verstellbar (setDay), localStorage/Netz sind Attrappen (fetch liefert nie etwas -> kein Firebase-Zugriff).
const fs = require("fs"), vm = require("vm");
function el() {
  return new Proxy({ style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, children: [], dataset: {},
    appendChild() {}, insertAdjacentHTML() {}, addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    focus() {}, click() {}, textContent: "", innerHTML: "", value: "", disabled: false, hidden: false },
    { get(t, k) { return k in t ? t[k] : () => {}; }, set(t, k, v) { t[k] = v; return true; } });
}
function load(source, exportsExpr) {
  const html = source.includes("<script>") ? source : fs.readFileSync(source, "utf8");
  const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  let FAKE = Date.now();
  function FD(...a) { return a.length ? new Date(...a) : new Date(FAKE); }
  FD.now = () => FAKE; FD.prototype = Date.prototype; FD.UTC = Date.UTC; FD.parse = Date.parse;
  const store = {}, els = {};
  const sb = { console: { log() {}, warn() {}, error() {} },
    document: { getElementById: id => els[id] || (els[id] = el()), createElement: () => el(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: el(), visibilityState: "visible" },
    window: { addEventListener() {}, scrollTo() {}, confirm: () => true, prompt: () => null, alert() {} },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } },
    sessionStorage: { getItem: () => "1", setItem() {} }, location: { pathname: "/", replace() {}, reload() {} },
    fetch: () => new Promise(() => {}), setTimeout: () => 0, clearTimeout() {}, navigator: {},
    Math, Date: FD, JSON, Object, Array, String, Number, Set, Map, RegExp, Error, Promise, URL, Blob: function () {}, FileReader: function () {},
    alert() {}, confirm: () => true, prompt: () => null };
  sb.AudioContext = function () { return { createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} } }), createGain: () => ({ connect() {}, gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} } }), destination: {}, currentTime: 0, state: "running" }; };
  sb.window.location = sb.location; sb.globalThis = sb; sb.setDay = d => { FAKE = Date.now() + d * 864e5; }; sb.els = els;
  vm.createContext(sb);
  new vm.Script(code + "\n;globalThis.__X=(" + (exportsExpr || "{}") + ");").runInContext(sb);
  sb.run = js => new vm.Script(js).runInContext(sb);
  return sb;
}
module.exports = { load };
