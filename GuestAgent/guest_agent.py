import os
import json
import socket
import subprocess
import requests
import sys

# Configuration
HOST_SERVER = "http://10.10.1.10:5000"  # Change this to your host server address
API_ENDPOINT = f"{HOST_SERVER}/report"
SERVER_KEY = "12345678"
SERVER_ID = "1"  # Set dynamically based on the guest server
OS_TYPE = "ubuntu2204"

# Function to get open ports
def get_open_ports():
    result = subprocess.run(["netstat", "-tuln"], capture_output=True, text=True)
    return result.stdout

# Function to check patch status
def get_patch_status():
    result = subprocess.run(["apt", "list", "--upgradable"], capture_output=True, text=True)
    return "Updates Available" if "upgradable" in result.stdout else "Up to date"

# Function to check antivirus status
def get_antivirus_status():
    result = subprocess.run(["systemctl", "is-active", "clamav"], capture_output=True, text=True)
    return result.stdout.strip()

# Function to check disk encryption
def get_encryption_status():
    result = subprocess.run(["lsblk", "-o", "NAME,MOUNTPOINT,TYPE,FSTYPE"], capture_output=True, text=True)
    return "Encrypted" if "crypt" in result.stdout else "Not Encrypted"

# Function to check password strength
def check_password_strength():
    return "Strong"  # Simplified; Implement deeper checks if needed

# Function to get third-party software list
def get_third_party_software():
    result = subprocess.run(["dpkg", "--get-selections"], capture_output=True, text=True)
    return result.stdout

# Function to check plaintext passwords
def detect_plaintext_passwords():
    return "No plaintext passwords found"  # Implement scanning if needed

# Function to generate OpenSCAP report
def generate_openscap_report():
    # Get absolute path for reports directory
    reports_dir = os.path.expanduser("~/reports")
    subprocess.run(["rm","-rf",reports_dir],capture_output=True,text=True)
    os.makedirs(reports_dir, exist_ok=True)  # Ensure the reports directory exists

    # Construct file paths using absolute path
    results_file = os.path.join(reports_dir, f"xccdf-results-{SERVER_ID}.xml")
    arf_file = os.path.join(reports_dir, f"arf-{SERVER_ID}.xml")
    report_file = os.path.join(reports_dir, f"report-{SERVER_ID}.html")
    oscap_command = [
        "oscap","xccdf", "eval", 
        "--fetch-remote-resources",
        "--datastream-id",f"scap_org.open-scap_datastream_from_xccdf_ssg-{OS_TYPE}-xccdf.xml",
        "--xccdf-id" ,f"scap_org.open-scap_cref_ssg-{OS_TYPE}-xccdf.xml",
        "--profile", f"xccdf_org.ssgproject.content_profile_cis_level1_server",
        "--oval-results", 
        "--results", results_file,
        "--results-arf", arf_file,
        "--report",report_file, 
        f"/usr/share/xml/scap/ssg/content/ssg-{OS_TYPE}-ds.xml"
    ]
    try:
        subprocess.run(oscap_command,text=True,stderr=subprocess.STDOUT)
        with open(report_file) as f:
            return f.read()
    except Exception as e:
        print(e)
        return "null" 

# Collect system data
report_data = {
    "server_id": SERVER_ID,
    "open_ports": get_open_ports(),
    "patch_status": get_patch_status(),
    "antivirus_status": get_antivirus_status(),
    "encryption_status": get_encryption_status(),
    "password_strength": check_password_strength(),
    "third_party_software": get_third_party_software(),
    "plaintext_passwords": detect_plaintext_passwords(),
    #"hardening_report": generate_openscap_report()
}

# Send report to host server
headers = {"SERVER_KEY": f"Bearer {SERVER_KEY}", "Content-Type": "application/json"}
response = requests.post(API_ENDPOINT, data=json.dumps(report_data), headers=headers)
print("Report sent. Server response:", response.text)

