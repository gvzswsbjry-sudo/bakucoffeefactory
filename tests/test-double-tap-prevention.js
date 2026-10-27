const assert = require('assert');

// Test the double-tap and multi-touch suppression logic in a simulated DOM environment
let eventListeners = {};
let preventDefaultCalls = 0;
let clickedButtons = [];
let focusedInputs = [];

const mockDocument = {
  addEventListener(event, handler, options) {
    if (!eventListeners[event]) eventListeners[event] = [];
    eventListeners[event].push(handler);
  },
};

const mockWindow = {
  addEventListener() {},
};

// Simulate the double-tap prevention setup
(function setupZoomPrevention(window, document) {
  let lastTouchEnd = 0;
  let lastTouchX = 0;
  let lastTouchY = 0;

  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      const touch = event.changedTouches && event.changedTouches[0];
      const x = touch ? touch.clientX : 0;
      const y = touch ? touch.clientY : 0;
      const timeDiff = now - lastTouchEnd;
      const dist = Math.hypot(x - lastTouchX, y - lastTouchY);

      if (timeDiff <= 350 && dist < 48) {
        event.preventDefault();
        const button = event.target.closest('button, [role="button"], a, input[type="submit"], input[type="button"]');
        if (button && !button.disabled) {
          button.click();
        } else if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          event.target.focus();
        }
      }

      lastTouchEnd = now;
      lastTouchX = x;
      lastTouchY = y;
    },
    { passive: false, capture: true }
  );

  document.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false, capture: true }
  );
})(mockWindow, mockDocument);

const touchEndHandler = eventListeners['touchend'][0];
const touchStartHandler = eventListeners['touchstart'][0];

// Test 1: Single tap on modal text does NOT call preventDefault
let prevented = false;
let mockEvent1 = {
  changedTouches: [{ clientX: 100, clientY: 100 }],
  target: { tagName: 'P', closest: () => null },
  preventDefault: () => { prevented = true; },
};
touchEndHandler(mockEvent1);
assert.strictEqual(prevented, false, 'First tap must not prevent default');

// Test 2: Rapid second tap (double-tap) on modal text DOES call preventDefault (blocks zoom)
let prevented2 = false;
let mockEvent2 = {
  changedTouches: [{ clientX: 102, clientY: 101 }],
  target: { tagName: 'P', closest: () => null },
  preventDefault: () => { prevented2 = true; },
};
touchEndHandler(mockEvent2);
assert.strictEqual(prevented2, true, 'Double tap on modal text must prevent default (suppress smart zoom)');

// Test 3: Rapid second tap on a button calls preventDefault AND triggers button.click()
let prevented3 = false;
let buttonClicked = false;
const mockButton = {
  disabled: false,
  click: () => { buttonClicked = true; },
};
let mockEvent3 = {
  changedTouches: [{ clientX: 102, clientY: 101 }],
  target: {
    tagName: 'BUTTON',
    closest: (selector) => mockButton,
  },
  preventDefault: () => { prevented3 = true; },
};
touchEndHandler(mockEvent3);
assert.strictEqual(prevented3, true, 'Double tap on modal button must prevent default to stop zoom');
assert.strictEqual(buttonClicked, true, 'Double tap on modal button must still trigger click');

// Test 4: Multi-touch pinch start prevents default
let preventedPinch = false;
touchStartHandler({
  touches: [{ clientX: 50, clientY: 50 }, { clientX: 150, clientY: 150 }],
  preventDefault: () => { preventedPinch = true; },
});
assert.strictEqual(preventedPinch, true, 'Multi-touch gesture must prevent default');

console.log('PASS: Double-tap prevention logic successfully tested in simulation.');
