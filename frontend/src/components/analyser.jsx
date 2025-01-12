import React, { useState, useEffect } from 'react';
const ContractAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [compilerVersion, setCompilerVersion] = useState('0.8.0');
  const [compilerVersions, setCompilerVersions] = useState([]);
  const [reportType, setReportType] = useState('detailed');
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  // Fetch compiler versions on component load
  useEffect(() => {
    const fetchCompilerVersions = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/get-compiler-versions'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch compiler versions');
        }
        const data = await response.json();
        setCompilerVersions(data.versions);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompilerVersions();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    // Read file content and display it in the textarea
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleCompilerVersionChange = async (e) => {
    const version = e.target.value;
    setCompilerVersion(version);

    try {
      const response = await fetch('http://localhost:5000/select-compiler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch compiler version');
      }

      const data = await response.json();
      console.log(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);

    const formData = new FormData();
    if (file) {
      formData.append('contract_file', file);
    } else if (code) {
      formData.append('contract_code', code);
    } else {
      setError('Please upload a file or paste Solidity code.');
      return;
    }

    formData.append('compiler_version', compilerVersion);
    formData.append('report_type', reportType);

    try {
      const response = await fetch('http://localhost:5000/report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the contract. Please try again.');
      }

      const data = await response.json();
      console.log(data);
      setReport(data);

      // Open report in a new window
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(`
        <html>
          <head>
            <title>Contract Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #A31F1F; }
              h2 { color: #016fad; border-bottom: 2px solid #82c823; padding-bottom: 10px; }
              pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
              .section { margin-bottom: 20px; }
              .detector { margin-bottom: 15px; padding: 10px; border: 1px solid #016fad; border-radius: 5px; }
              .severity-high { color: #A31F1F; font-weight: bold; }
              .severity-medium { color: #FFA500; font-weight: bold; }
              .severity-low { color: #016fad; font-weight: bold; }
              .severity-informational { color: #82c823; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Contract Analysis Report</h1>
            ${renderReport(data)}
          </body>
        </html>
      `);
      reportWindow.document.close();
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const renderReport = (report) => {
    if (!report) return '';

    // Remove duplicate detectors
    const uniqueDetectors = [];
    const seenDetectors = new Set();
    report.detectors?.forEach((detector) => {
      const detectorKey = `${detector.detector}-${detector.description}`;
      if (!seenDetectors.has(detectorKey)) {
        seenDetectors.add(detectorKey);
        uniqueDetectors.push(detector);
      }
    });

    return `
      <div class="section">
        <h2>Contract Analyzed</h2>
        <p>${report.contract_analyzed}</p>
      </div>

      <div class="section">
        <h2>Contracts</h2>
        ${report.contracts
          ?.map(
            (contract) => `
          <div>
            <h3>${contract.name} Functions</h3>
            <ul>
              ${contract.functions
                ?.map(
                  (func) => `
                <li>
                  <strong>${func.name}</strong>
                  <ul>
                    <li>Reads: ${
                      func.state_variables_read?.join(', ') || 'None'
                    }</li>
                    <li>Writes: ${
                      func.state_variables_written?.join(', ') || 'None'
                    }</li>
                  </ul>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="section">
        <h2>Detectors (Total: ${uniqueDetectors.length})</h2>
        ${uniqueDetectors
          .map(
            (detector, index) => `
          <div class="detector">
            <p><strong>Issue #${index + 1}</strong></p>
            <p><strong>Detector:</strong> ${detector.detector}</p>
            <p><strong>Severity:</strong> <span class="severity-${detector.severity.toLowerCase()}">${
              detector.severity
            }</span></p>
            <p><strong>Description:</strong> ${detector.description}</p>
            <p><strong>Reference:</strong> <a href="${
              detector.reference
            }" target="_blank">${detector.reference}</a></p>
          </div>
        `
          )
          .join('')}
      </div>

      ${
        reportType === 'detailed'
          ? `
        <div class="section">
          <h2>Log Output</h2>
          <pre>${report.log_output}</pre>
        </div>
      `
          : ''
      }
    `;
  };

  const handleDownloadPDF = () => {
    if (report) {
      const reportContent = renderReport(report);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Contract Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #A31F1F; }
              h2 { color: #016fad; border-bottom: 2px solid #82c823; padding-bottom: 10px; }
              pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
              .section { margin-bottom: 20px; }
              .detector { margin-bottom: 15px; padding: 10px; border: 1px solid #016fad; border-radius: 5px; }
              .severity-high { color: #A31F1F; font-weight: bold; }
              .severity-medium { color: #FFA500; font-weight: bold; }
              .severity-low { color: #016fad; font-weight: bold; }
              .severity-informational { color: #82c823; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Contract Analysis Report</h1>
            ${reportContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Solidity Contract Analyzer</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Upload Solidity File:
            <input
              type='file'
              onChange={handleFileChange}
              accept='.sol'
              style={styles.fileInput}
            />
          </label>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Or Paste Solidity Code:
            <textarea
              value={code}
              onChange={handleCodeChange}
              rows='10'
              cols='50'
              placeholder='Paste your Solidity code here...'
              style={styles.textarea}
            />
          </label>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Select Compiler Version:
            <select
              value={compilerVersion}
              onChange={handleCompilerVersionChange}
              style={styles.select}
            >
              {compilerVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Select Report Type:
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              style={styles.select}
            >
              <option value='detailed'>Detailed Report</option>
              <option value='simple'>Simple Report</option>
            </select>
          </label>
        </div>
        <button type='submit' style={styles.button}>
          Analyze Contract
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {report && (
        <div style={styles.reportContainer}>
          <button onClick={handleDownloadPDF} style={styles.button}>
            Download Report as PDF
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
    color: '#016fad',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heading: {
    color: '#A31F1F',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  fileInput: {
    display: 'block',
    marginTop: '5px',
    padding: '10px',
    border: '1px solid #016fad',
    borderRadius: '5px',
    backgroundColor: '#f4f4f4',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #016fad',
    fontFamily: 'monospace',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #016fad',
    backgroundColor: '#f4f4f4',
  },
  button: {
    backgroundColor: '#82c823',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    alignSelf: 'flex-start',
  },
  error: {
    color: '#A31F1F',
    marginTop: '20px',
  },
  reportContainer: {
    marginTop: '20px',
  },
};

export default ContractAnalyzer;
