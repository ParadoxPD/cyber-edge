#! /bin/bash

sudo apt install -y net-tools nmap python3-pip openscap-scanner openscap-common libopenscap25t64 ssg-base ssg-debderived ssg-debian ssg-nondebian ssg-applications


mkdir -p ~/Desktop

cd ~/Desktop

curl -fsSL "http://192.168.1.37:5000/get-guest-agent?server_id=$1&key=$2" -o guest_agent.py



echo "run python3 guest_agent.py"

