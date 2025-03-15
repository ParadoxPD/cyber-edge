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
import Modal from "@mui/material/Modal";
import FmdBadIcon from "@mui/icons-material/FmdBad";
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
  const [openPortModal, setOpenPortModal] = useState({
    state: false,
    content: "",
  });
  const [openPatchModal, setOpenPatchModal] = useState({
    state: false,
    content: "",
  });
  const [openSoftwareModal, setOpenSoftwareModal] = useState({
    state: false,
    content: "",
  });

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
      return "green";
    if (status.includes("Warning") || status.includes("Updates Available"))
      return "yellow";
    return "red";
  };

  console.log(openPortModal.content);

  return (
    <BasicLayout image={bgImage}>
      <DashboardNavbar setSearch={setSearch} name="Reports" />
      <Modal
        open={openPortModal.state}
        onClose={() => {
          setOpenPortModal({ state: false, content: openPortModal.content });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            backdropFilter: "blur(60px)",
            background: "transparent",
            p: 4,
          }}
        >
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <Typography
                  variant="h3"
                  color="White"
                  sx={{ textAlign: "center" }}
                >
                  Open Ports
                </Typography>
              </MDBox>
              <MDBox mb={2} sx={{ overflowY: "scroll", height: "28vh" }}>
                {openPortModal.content.length == 0
                  ? null
                  : openPortModal.content.map((elem, i) => {
                      return (
                        <Typography
                          variant="body1"
                          color="White"
                          key={i}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "80%",
                          }}
                        >
                          {elem.split(" ").map((col) => {
                            return (
                              <Typography
                                variant="body1"
                                color="White"
                                key={i}
                                sx={{}}
                              >
                                {col}
                              </Typography>
                            );
                          })}
                        </Typography>
                      );
                    })}
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  // type="submit"
                  color="info"
                  fullWidth
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenPortModal({ state: false, content: "" });
                  }}
                >
                  Close
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Modal>

      <Modal
        open={openPatchModal.state}
        onClose={() => {
          setOpenPatchModal({ state: false, content: openPatchModal.content });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            backdropFilter: "blur(60px)",
            background: "transparent",
            p: 4,
          }}
        >
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <Typography
                  variant="h3"
                  color="White"
                  sx={{ textAlign: "center" }}
                >
                  Patch Status
                </Typography>
              </MDBox>
              <MDBox>
                <MDBox
                  mb={2}
                  sx={{
                    // overflowY: "auto",
                    display: "flex",
                    // width: "50%",
                    // height: "200px",
                    marginLeft: "20px",
                  }}
                >
                  <FmdBadIcon
                    sx={{
                      fill: statusColor(openPatchModal.content),
                      transform: "scale(2)",
                    }}
                  />
                  {/* statusColor(openPatchModal.content) */}
                  <Typography
                    variant="body1"
                    color="White"
                    sx={{
                      marginLeft: "20px",
                    }}
                  >
                    {openPatchModal.content}
                  </Typography>
                </MDBox>
                {!openPatchModal.content.includes("Available") ? null : (
                  <MDInput
                    type="text"
                    // label="command"
                    fullWidth
                    // disabled
                    value={"Run sudo apt update && sudo apt upgrade -y"}
                    onClick={(e) => {
                      // console.log(e);
                      e.target.select();
                    }}
                  />
                )}
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  // type="submit"
                  color="info"
                  fullWidth
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenPatchModal({ state: false, content: "" });
                  }}
                >
                  Close
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Modal>

      <Modal
        open={openSoftwareModal.state}
        onClose={() => {
          setOpenSoftwareModal({
            state: false,
            content: openSoftwareModal.content,
          });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: "60%",
            width: "80%",
            backdropFilter: "blur(60px)",
            background: "transparent",
            p: 4,
          }}
        >
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <Typography
                  variant="h3"
                  color="White"
                  sx={{ textAlign: "center" }}
                >
                  Third Party Softwares
                </Typography>
              </MDBox>
              <MDBox mb={2} sx={{ overflowY: "scroll", height: "28vh" }}>
                {openSoftwareModal.content.length == 0
                  ? null
                  : openSoftwareModal.content.map((elem, i) => {
                      return (
                        <Typography variant="body1" color="White" key={i}>
                          {elem}
                        </Typography>
                      );
                    })}
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  // type="submit"
                  color="info"
                  fullWidth
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenSoftwareModal({ state: false, content: "" });
                  }}
                >
                  Close
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Modal>

      <MDBox
        sx={{
          display: "flex",
          alignContent: "flex-start",
          justifyContent: "flex-start",
          position: "absolute",
          top: "10%",
          height: "90%",
          width: "100%",
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
                        transform: "scale(1.02)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    {/* <CardActionArea
                      component={Link}
                      target="_blank"
                      to={`http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/view-report/${report.hardening_report_filename}`}
                    > */}
                    <CardContent>
                      <Typography variant="h5" sx={{ color: "#ffffffaa" }}>
                        Report {index + 1}
                      </Typography>
                      <Typography variant="body2" color="gray">
                        {formatTimestamp(report.timestamp)}
                      </Typography>

                      <MDBox mt={2}>
                        <MDBox
                          sx={{
                            backgroundColor: "#1E1E1E",
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: 3,
                            textAlign: "center",
                            margin: "20px 10px 20px 10px",
                            padding: "30px 30px 30px 30px",
                            ":hover": {
                              transform: "scale(1.02)",
                              boxShadow: 8,
                              cursor: "pointer",
                            },
                          }}
                          onClick={(e) => {
                            setOpenPortModal({
                              content: report.open_ports,
                              state: true,
                            });
                          }}
                        >
                          <Typography variant="body1" color="White">
                            Open Ports
                          </Typography>

                          <Typography variant="body2" color="white">
                            {report.open_ports.length}
                          </Typography>
                        </MDBox>

                        <MDBox
                          sx={{
                            backgroundColor: "#1E1E1E",
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: 3,
                            textAlign: "center",
                            margin: "20px 10px 20px 10px",
                            padding: "30px 30px 30px 30px",
                            ":hover": {
                              transform: "scale(1.02)",
                              boxShadow: 8,
                              cursor: "pointer",
                            },
                          }}
                          onClick={(e) => {
                            setOpenPatchModal({
                              content: report.patch_status,
                              state: true,
                            });
                          }}
                        >
                          <Typography variant="body1" color="White">
                            Patch Status
                          </Typography>

                          <Typography
                            variant="body2"
                            color="white"
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              marginTop: "10px",
                            }}
                          >
                            <FmdBadIcon
                              sx={{
                                fill: statusColor(report.patch_status),
                                marginRight: "3px",
                              }}
                            />
                            {report.patch_status}
                          </Typography>
                        </MDBox>

                        <MDBox
                          sx={{
                            backgroundColor: "#1E1E1E",
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: 3,
                            textAlign: "center",
                            margin: "20px 10px 20px 10px",
                            padding: "30px 30px 30px 30px",
                            ":hover": {
                              transform: "scale(1.02)",
                              boxShadow: 8,
                              cursor: "pointer",
                            },
                          }}
                          onClick={(e) => {
                            setOpenSoftwareModal({
                              content: report.third_party_software,
                              state: true,
                            });
                          }}
                        >
                          <Typography variant="body1" color="White">
                            Third Party Softwares
                          </Typography>

                          <Typography variant="body2" color="white">
                            {report.third_party_software.length}
                          </Typography>
                        </MDBox>
                        {[
                          // {
                          //   label: "Antivirus Status",
                          //   value: report.antivirus_status,
                          // },
                          // {
                          //   label: "Encryption Status",
                          //   value: report.encryption_status,
                          // },
                          // {
                          //   label: "Password Strength",
                          //   value: report.password_strength,
                          // },
                          // {
                          //   label: "Plaintext Passwords",
                          //   value: report.plaintext_passwords,
                          // },
                        ].map((item, i) => (
                          <Typography key={i} variant="body2" color="lightgray">
                            <strong>{item.label}:</strong> {item.value}
                          </Typography>
                        ))}
                      </MDBox>

                      <Link
                        target="_blank"
                        to={`http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/view-report/${report.hardening_report_filename}`}
                        sx={{
                          ":hover": {
                            cursor: "pointer",
                          },
                        }}
                      >
                        <Typography
                          variant="h2"
                          sx={{
                            marginTop: 2,
                            fontSize: "1.5rem",
                            color: "#4CAF50",
                            ":hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Click to view Hardening report
                        </Typography>
                      </Link>
                    </CardContent>
                    {/* </CardActionArea> */}
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
