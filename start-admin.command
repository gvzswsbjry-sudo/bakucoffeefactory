#!/bin/zsh
cd "${0:A:h}"
echo "Baku Coffee Factory lokal serveri başladılır..."
echo "Sayt:  http://127.0.0.1:8017/"
echo "Admin: http://127.0.0.1:8017/admin/"
(sleep 1; open "http://127.0.0.1:8017/admin/") &
node server.js
