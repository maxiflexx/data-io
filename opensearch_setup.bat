@echo off
wsl -d docker-desktop -e sh -c "sysctl -w vm.max_map_count=262144"
