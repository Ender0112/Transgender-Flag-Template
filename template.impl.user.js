// ==UserScript==
// @name         Transgender Flag Template impl
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  try to take over the canvas!
// @author       oralekin - script, LittleEndu - script, ekgame - script, Ender#5769 - image, heshiitou#6303 - toggle, refresh overlay buttons, mia-cx - hypertrance :)
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/silvenlily/transplace-overlay/main/template.impl.user.js
// @updateURL    https://raw.githubusercontent.com/silvenlily/transplace-overlay/main/template.impl.user.js
// ==/UserScript==

if (window.top !== window.self) {
  window.addEventListener(
    "load",
    () => {
      // Containers
      const CAMERA = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
      const CANVAS = CAMERA.querySelector("mona-lisa-canvas");
      const BUTTON_CONTROLS = document
        .getElementsByTagName("mona-lisa-embed")[0]
        .shadowRoot.children[0].getElementsByClassName("bottom-controls")[0];

      // Load the image
      const IMG_LINK = "https://raw.githubusercontent.com/mia-cx/Transgender-Flag-Template/main/place.png";
      const IMAGE = document.createElement("img");
      function loadImage() {
        IMAGE.src = `${IMG_LINK}?t=${new Date().getTime()}`;
        IMAGE.onload = () => {
          IMAGE.style = null;
          IMAGE.style = `position: absolute; left: 0; top: 0; width: ${IMAGE.width / 3}px; height: ${
            IMAGE.height / 3
          }px; image-rendering: pixelated; z-index: 1`;
        };
      }
      loadImage();

      // Add the image as overlay
      CANVAS.shadowRoot.querySelector(".container").appendChild(IMAGE);

      // Add a style to put a hole in the pixel preview (to see the current or desired color)
      const waitForPreview = setInterval(() => {
        const preview = CAMERA.querySelector("mona-lisa-pixel-preview");
        if (preview) {
          clearInterval(waitForPreview);
          const style = document.createElement("style");
          style.innerHTML =
            ".pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }";
          preview.shadowRoot.appendChild(style);
        }
      }, 100);

      // Buttons
      const TOGGLE_OVERLAY_BUTTON = document.createElement("mona-lisa-icon-button");
      const RELOAD_OVERLAY_BUTTON = document.createElement("mona-lisa-icon-button");

      // Overlay toggle button
      TOGGLE_OVERLAY_BUTTON.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.25A3.25 3.25 0 0 1 6.25 3h9a3.25 3.25 0 0 1 3.25 3.25v9c0 .646-.189 1.248-.514 1.755l-5.692-5.376a2.25 2.25 0 0 0-3.09 0l-5.69 5.375A3.235 3.235 0 0 1 3 15.25v-9Zm10.747 2.746a1.248 1.248 0 1 0 0-2.496 1.248 1.248 0 0 0 0 2.496Z" fill="#212121"/><path d="m11.264 12.72 5.642 5.327a3.235 3.235 0 0 1-1.656.453h-9a3.235 3.235 0 0 1-1.656-.453l5.64-5.327a.75.75 0 0 1 1.03 0Z" fill="#212121"/><path d="M8.749 21a3.247 3.247 0 0 1-2.74-1.5h9.74a3.75 3.75 0 0 0 3.75-3.75V6.011a3.247 3.247 0 0 1 1.5 2.74v7c0 2.899-2.35 5.25-5.25 5.25h-7Z" fill="#212121"/></svg>`;
      TOGGLE_OVERLAY_BUTTON.onclick = function () {
        IMAGE.hidden = !IMAGE.hidden;
        BUTTON_CONTROLS.children[3].shadowRoot.children[0].children[0].style.backgroundColor = IMAGE.hidden
          ? "orangered"
          : null;
      };
      BUTTON_CONTROLS.appendChild(TOGGLE_OVERLAY_BUTTON);

      // Overlay refresh button
      RELOAD_OVERLAY_BUTTON.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0Zm-8-3v.551a3.5 3.5 0 1 1-.187 4.691C3.55 8.427 3.811 8 4.221 8c.176 0 .339.085.46.213A2.5 2.5 0 1 0 4.5 5H5.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 1 0ZM17.504 9.252a.752.752 0 1 0-1.504 0 .752.752 0 0 0 1.504 0Z" fill="#212121"/><path d="M13 6.5a6.5 6.5 0 0 1-9 6.002v6.248c0 .627.178 1.213.485 1.71l6.939-6.813.135-.122a2.25 2.25 0 0 1 2.889.006l.128.117 6.939 6.811A3.235 3.235 0 0 0 22 18.75V7.25A3.25 3.25 0 0 0 18.75 4h-6.248c.32.77.498 1.614.498 2.5Zm1.5 2.752a2.252 2.252 0 1 1 4.504 0 2.252 2.252 0 0 1-4.504 0Z" fill="#212121"/><path d="m12.475 14.718.083-.071a.75.75 0 0 1 .874-.007l.093.078 6.928 6.8A3.235 3.235 0 0 1 18.75 22H7.25a3.235 3.235 0 0 1-1.703-.481l6.928-6.801Z" fill="#212121"/></svg>`;
      RELOAD_OVERLAY_BUTTON.onclick = function () {
        loadImage();
      };
      BUTTON_CONTROLS.appendChild(RELOAD_OVERLAY_BUTTON);
    },
    false
  );
}
