import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../constants/constants";

const ReportPage = () => {
  const { serverId } = useParams();
  const [reports, setReports] = useState(null);
  const id = serverId;
  console.log(id);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await axios.get(
        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/reports/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(res);
      setReports(res.data);
    };
    fetchReport();
  }, [id]);

  if (!reports) return <p>Loading report...</p>;

  const statusColor = (status) => {
    if (status.includes("Up to date") || status.includes("Secure"))
      return "bg-green-500";
    if (status.includes("Warning") || status.includes("Updates Available"))
      return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {reports.map((report, idx) => (
        <div key={idx}>
          <h1 className="text-2xl font-bold">
            Security Report for {report.name}
          </h1>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {[
              { label: "Open Ports", value: report.open_ports },
              { label: "Patch Status", value: report.patch_status },
              { label: "Antivirus Status", value: report.antivirus_status },
              { label: "Encryption Status", value: report.encryption_status },
              { label: "Password Strength", value: report.password_strength },
              {
                label: "Third-Party Software",
                value: report.third_party_software,
              },
              {
                label: "Plaintext Passwords",
                value: report.plaintext_passwords,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-md ${statusColor(
                  item.value
                )}`}
              >
                <h2 className="text-lg font-semibold">{item.label}</h2>
                <p className="text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-semibold mt-6">Hardening Report</h2>
          <div className="mt-2 p-4 bg-gray-800 rounded-lg">
            <pre className="whitespace-pre-wrap">{report.hardening_report}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportPage;
