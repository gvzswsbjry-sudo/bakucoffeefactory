#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

grep -q 'href="menu-mobile.css' menyu.html
grep -q '@media (max-width: 720px)' menu-mobile.css
grep -q 'grid-template-columns: repeat(3, minmax(0, 1fr))' menu-mobile.css
grep -q 'position: sticky' menu-mobile.css
grep -q 'top: 126px' menu-mobile.css
grep -q 'font-size: 42px' menu-mobile.css
grep -q '\.menu-page \.menu-panel-heading' menu-mobile.css
grep -q 'padding-top: 0' menu-mobile.css
grep -q 'display: none' menu-mobile.css

echo "Mobile menu navigation structure is valid."
