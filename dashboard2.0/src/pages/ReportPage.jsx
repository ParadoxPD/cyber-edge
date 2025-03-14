import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../constants/constants";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import DashboardNavbar from "pages/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Box,
} from "@mui/material";

const ReportPage = () => {
  const { serverId } = useParams();
  const [reports, setReports] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const id = serverId;
  console.log(id);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    // console.log(date);

    return date
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true, // Use 24-hour format
      })
      .replace(",", ""); // Remove comma for cleaner format
  };

  useEffect(() => {
    const fetchReport = async () => {
      const reports_data = await axios.get(
        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/reports/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const hardening_reports = await axios.get(
        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/hardening-reports/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const result = {
        data: reports_data.data.map((rep) => {
          return {
            timestamp: rep.timestamp,
            hardening_report_filename: rep.hardening_report_filename,
            open_ports: rep.open_ports.split("\n").splice(2),
            patch_status: rep.patch_status,
            antivirus_status: rep.antivirus_status,
            encryption_status: rep.encryption_status,
            password_strength: rep.password_strength,
            third_party_software: rep.third_party_software
              .split("\n")
              .filter((element) => {
                return !(
                  element.toLowerCase().includes("linux") ||
                  element.toLowerCase().includes("apt") ||
                  element.toLowerCase().includes("conf") ||
                  element.toLowerCase().includes("lib")
                );
              })
              .map((element) => {
                return element.split("\t")[0];
              }),
            plaintext_passwords: rep.plaintext_passwords,
          };
        }),
        hardening_reports: hardening_reports.data.hardening_reports,
      };
      // console.log(
      //   "Ports : ",
      //   reports_data.data[0].open_ports.split("\n").splice(2)
      // );
      // console.log("Ports : ", reports_data.data[0].patch_status);
      // console.log(
      //   "Ports : ",
      //   result.data[0].third_party_software
      //     .split("\n")
      //     .filter((element) => {
      //       return !(
      //         element.toLowerCase().includes("linux") ||
      //         element.toLowerCase().includes("apt") ||
      //         element.toLowerCase().includes("conf") ||
      //         element.toLowerCase().includes("lib")
      //       );
      //     })
      //     .map((element) => {
      //       return element.split("\t")[0];
      //     })
      // );

      console.log(result);
      setReports(result);
      setLoading(false);
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
    <BasicLayout image={bgImage}>
      <DashboardNavbar setSearch={setSearch} name="Reports" />
      <MDBox
        sx={{
          display: "flex",
          alignContent: "flex-start",
          justifyContent: "flex-start",
          position: "absolute",
          top: "10%",
          left: "5%",
          height: "90%",
          width: "90%",
          overflowY: "auto",
          flexWrap: "wrap",
        }}
      >
        <MDBox maxWidth="lg" sx={{ marginTop: "30px" }}>
          {loading ? (
            <Box>
              <CircularProgress />
            </Box>
          ) : reports.length === 0 ? (
            <Typography
              variant="h6"
              sx={{ color: "#aaa", textAlign: "center" }}
            >
              No reports found.
            </Typography>
          ) : (
            <MDBox>
              {reports.data
                .filter((report, index) =>
                  (`Report ${index + 1}` + formatTimestamp(report.timestamp))
                    .toLowerCase()
                    .includes(search)
                )
                .map((report, index) => (
                  // <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    key={index}
                    sx={{
                      backdropFilter: "blur(200px)",
                      background: "transparent",
                      marginRight: "30px",
                      marginBottom: "20px",
                      marginLeft: "20px",
                      position: "relative",
                      // display: "flex",
                      // width: 300,
                      // height: 345,
                      transition: "all 0.2s ease-in",
                      ":hover": {
                        cursor: "pointer",
                        transform: "scale(1.02)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      target="_blank"
                      to={`http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/view-report/${report.hardening_report_filename}`}
                    >
                      <CardContent>
                        <Typography variant="h5" sx={{ color: "#ffffffaa" }}>
                          Report {index + 1}
                        </Typography>
                        <Typography variant="body2" color="gray">
                          {formatTimestamp(report.timestamp)}
                        </Typography>

                        <Box mt={2}>
                          {[
                            { label: "Open Ports", value: report.open_ports },
                            {
                              label: "Patch Status",
                              value: report.patch_status,
                            },
                            {
                              label: "Antivirus Status",
                              value: report.antivirus_status,
                            },
                            {
                              label: "Encryption Status",
                              value: report.encryption_status,
                            },
                            {
                              label: "Password Strength",
                              value: report.password_strength,
                            },
                            {
                              label: "Plaintext Passwords",
                              value: report.plaintext_passwords,
                            },
                          ].map((item, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              color="lightgray"
                            >
                              <strong>{item.label}:</strong> {item.value}
                            </Typography>
                          ))}
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            marginTop: 2,
                            fontSize: "0.9rem",
                            color: "#4CAF50",
                          }}
                        >
                          Click to view Hardening report
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                  // </Grid>
                ))}
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </BasicLayout>
  );
};

export default ReportPage;
