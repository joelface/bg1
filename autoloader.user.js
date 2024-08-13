// ==UserScript==
// @name         BG1 Autoloader
// @namespace    https://joelface.github.io/bg1/
// @version      0.3
// @description  Automatically loads the BG1 interface
// @author       Joel Bruick
// @match        https://joelface.github.io/bg1/start.html
// @match        https://engineer152.github.io/bg1/start.html
// @match        https://disneyworld.disney.go.com/vas/
// @match        https://disneyworld.disney.go.com/*/vas/
// @match        https://disneyland.disney.go.com/vas/
// @match        https://disneyland.disney.go.com/*/vas/
// @match        https://vqguest-svc-wdw.wdprapps.disney.com/application/v1/guest/getQueues
// @match        https://vqguest-svc.wdprapps.disney.com/application/v1/guest/getQueues
// @grant        none
// ==/UserScript==
'use strict';

const bg1Url = 'https://joelface.github.io/bg1/';
const bg1EUrl = 'https://engineer152.github.io/bg1/';
if (window.location.href === bg1Url + 'start.html') {
  document.body.classList.add('autoload');
} else {
  document.open();
  document.write(
    `<!doctype html><link rel=stylesheet href="${bg1Url}bg1.css"><body>`
  );
  const script = document.createElement('script');
  const manifest = document.createElement('link');
  script.type = 'module';
  script.src = bg1Url + 'bg1.js';
  manifest.rel = 'manifest';
  if (window.location.href.indexOf("disneyworld") > -1) {
      manifest.href = bg1EUrl + 'manifest_wdw.json';
  } else if (window.location.href.indexOf("disneyland") > -1) {
      manifest.href = bg1EUrl + 'manifest_dlr.json';
  } else if (window.location.href.indexOf("vqguest-svc-wdw") > -1) {
      manifest.href = bg1EUrl + 'manifest_wdw_vq.json';
  } else if (window.location.href.indexOf("vqguest-svc") > -1) {
    manifest.href = bg1EUrl + 'manifest_dlr_vq.json';
  } else {
    manifest.href = bg1EUrl + 'manifest.json';
  }
  document.head.appendChild(manifest);
  document.head.appendChild(script);
}