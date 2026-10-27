#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

# Product cards must stretch their copy area and pin the buy action to the
# bottom so two cards in the same mobile row stay aligned.
grep -q '^  display: flex;$' gear.css
grep -q '^  flex-direction: column;$' gear.css
grep -q '^  margin-top: auto;$' gear.css

# The equipment cart count is text-only, never a dark circular badge.
grep -A9 '^\.shop-toolbar \.cart-trigger strong {' gear.css | grep -q 'background: transparent;'
grep -A9 '^\.shop-toolbar \.cart-trigger strong {' gear.css | grep -q 'border-radius: 0;'

# On small screens the menu tabs attach directly beneath the fixed header.
grep -A9 '@media (max-width: 720px)' menu-mobile.css | grep -q 'padding: 34px 22px 0;'

echo "Mobile card alignment and navigation spacing are valid."
