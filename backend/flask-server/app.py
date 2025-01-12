from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import io
import logging
import re
import tempfile
import subprocess
from slither import Slither
from slither.detectors import all_detectors
from slither.detectors.abstract_detector import AbstractDetector
from slither.printers import all_printers
from slither.printers.abstract_printer import AbstractPrinter

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

logger = logging.getLogger("DetectorLogger")
logger.setLevel(logging.INFO)

# Create a StringIO object to capture the logger output
log_capture_string = io.StringIO()
handler = logging.StreamHandler(log_capture_string)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def strip_ansi_escape_sequences(text):
    """
    Removes ANSI escape sequences from the text.
    """
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def analyze_contract(file_path):
    """
    Analyzes a Solidity contract using Slither and returns a detailed report.
    """
    try:
        # Reset the log capture string
        log_capture_string.truncate(0)
        log_capture_string.seek(0)

        # Initialize Slither
        slither = Slither(file_path)

        # Extract contract information
        report = {
            "contract_analyzed": os.path.basename(file_path),
            "contracts": [],
            "detectors": []
        }

        # Analyze contracts
        for contract in slither.contracts:
            contract_info = {
                "name": contract.name,
                "functions": []
            }

            # Analyze functions
            for function in contract.functions:
                function_info = {
                    "name": function.name,
                    "state_variables_read": [v.name for v in function.state_variables_read],
                    "state_variables_written": [v.name for v in function.state_variables_written]
                }
                contract_info["functions"].append(function_info)

            report["contracts"].append(contract_info)

        # Register and run detectors
        unique_findings = []
        seen_findings = set()

        for detector_class in all_detectors.__dict__.values():
            if isinstance(detector_class, type) and issubclass(detector_class, AbstractDetector):
                detector_instance = detector_class(slither.compilation_units[0], slither, logger)
                findings = detector_instance.detect()
                for finding in findings:
                    impact = finding.get("impact", "Unknown").lower()
                    if impact in ["high", "medium", "low", "informational", "optimization"]:
                        severity = impact.capitalize()
                    else:
                        severity = "Unknown"

                    finding_key = (
                        detector_instance.ARGUMENT,
                        finding.get("description"),
                    )
                    if finding_key not in seen_findings:
                        seen_findings.add(finding_key)
                        unique_findings.append({
                            "detector": detector_instance.ARGUMENT,
                            "description": detector_instance.HELP,
                            "severity": severity,
                            "reference": f"https://github.com/crytic/slither/wiki/Detector-Documentation#{detector_instance.ARGUMENT}"
                        })

        report["detectors"] = unique_findings

        # Run required printers
        required_printers = ["human-summary", "data-dependency", "function-summary", "contract-summary"]
        for printer_class in all_printers.__dict__.values():
            if isinstance(printer_class, type) and issubclass(printer_class, AbstractPrinter):
                if printer_class.ARGUMENT in required_printers:
                    # Initialize the printer with slither and logger
                    printer_instance = printer_class(slither, logger)
                    printer_output = printer_instance.output(file_path).data  # Pass the file path, not the Slither object

        return report

    except Exception as e:
        return {"error": "Failed to analyze contract", "details": str(e)}
    
    
@app.route('/select-compiler', methods=['POST'])
def select_compiler():
    """
    Endpoint to select the Solidity compiler version.
    """
    data = request.json
    if not data or 'version' not in data:
        return jsonify({"error": "No compiler version provided"}), 400

    version = data['version']

    try:
        # Use subprocess to switch the Solidity compiler version
        result = subprocess.run(
            ["solc-select", "use", version],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return jsonify({"error": "Failed to switch compiler version", "details": result.stderr}), 500

        return jsonify({"message": f"Switched to Solidity compiler version {version}"}), 200

    except Exception as e:
        return jsonify({"error": "Failed to switch compiler version", "details": str(e)}), 500

@app.route('/report', methods=['POST'])
def report():
    """
    Endpoint to analyze a Solidity contract.
    Accepts either a file upload or raw Solidity code.
    """
    if 'contract_file' in request.files:
        # Handle file upload
        file = request.files['contract_file']
        filename = secure_filename(file.filename)

        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, filename)
            file.save(file_path)
            report = analyze_contract(file_path)

    elif 'contract_code' in request.form:
        # Handle raw Solidity code
        contract_code = request.form['contract_code']

        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, "contract.sol")
            with open(file_path, "w") as f:
                f.write(contract_code)
            report = analyze_contract(file_path)

    else:
        return jsonify({"error": "No contract file or code provided"}), 400

    # Capture the logger output and clean it
    log_output = log_capture_string.getvalue()
    clean_log_output = strip_ansi_escape_sequences(log_output)

    # Include the cleaned log output in the report
    report["log_output"] = clean_log_output

    return jsonify(report)

@app.route('/get-compiler-versions', methods=['GET'])
def get_compiler_versions():
    """
    Endpoint to fetch the list of installed Solidity compiler versions.
    """
    try:
        # Use subprocess to get the list of installed versions
        result = subprocess.run(
            ["solc-select", "versions"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return jsonify({"error": "Failed to fetch compiler versions", "details": result.stderr}), 500

        # Extract the list of versions from the output
        versions = result.stdout.strip().split("\n")
        return jsonify({"versions": versions}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch compiler versions", "details": str(e)}), 500
        

if __name__ == '__main__':
    app.run(debug=True)