// ==UserScript==
// @name         BG1 Autoloader
// @namespace    https://joelface.github.io/bg1/
// @version      0.3
// @description  Automatically loads the BG1 interface
// @author       Joel Bruick
// @match        https://joelface.github.io/bg1/start.html
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
if (window.location.href === bg1Url + 'start.html') {
  document.body.classList.add('autoload');
} else {
  document.open();
  document.write(
    `<!doctype html><link rel=stylesheet href="${bg1Url}bg1.css"><body>`
  );
  const script = document.createElement('script');
  script.type = 'module';
  script.src = bg1Url + 'bg1.js';
  document.head.appendChild(script);
}
