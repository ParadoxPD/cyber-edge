import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Constants from "../constants/constants";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
// @mui material components
// import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "pages/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

import Typography from "@mui/material/Typography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { position } from "stylis";

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [osType, setOSType] = useState("");
  const [ipAddr, setIP] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    } else {
      const fetchServers = async () => {
        const res = await axios.get(
          `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/guest-servers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setServers(res.data);
      };
      fetchServers();
    }
  }, []);
  console.log(search);

  return (
    <BasicLayout image={bgImage}>
      <DashboardNavbar setSearch={setSearch} name="Dashboard" />
      <MDBox
        sx={{
          display: "flex",
          alignContent: "flex-start",
          justifyContent: "flex-start",
          position: "absolute",
          top: "15%",
          left: "5%",
          height: "85%",
          overflowY: "auto",
          flexWrap: "wrap",
        }}
      >
        {servers
          .filter((server) => {
            let query =
              server.name +
              server.id +
              (server.os_type ? server.os_type : "Windows Maybe?") +
              (server.ip_address ? server.ip_address : "192.168.1.1");
            return query.toLowerCase().includes(search.toLowerCase());
          })
          .map((server) => {
            console.log(server);
            return (
              // <Grid key={server.id}>
              <Card
                sx={{
                  backdropFilter: "blur(80px)",
                  background: "transparent",
                  marginRight: "30px",
                  marginBottom: "20px",
                  position: "relative",
                  // display: "flex",
                  width: 300,
                  // height: 345,
                  transition: "all 0.2s ease-in",
                  ":hover": {
                    cursor: "pointer",
                    transform: "scale(1.02)",
                    boxShadow: 8,
                  },
                }}
                key={server.id}
                onClick={(e) => {
                  console.log("hehe");
                  navigate(`/server/${server.id}`);
                }}
              >
                <Button
                  key={server.id}
                  variant="contained"
                  sx={{
                    borderRadius: "50%",
                    height: "3rem",
                    minHeight: "3rem",
                    width: "2rem",
                    minWidth: "2rem",
                    position: "absolute",
                    bottom: "5%",
                    right: "5%",
                    transition: "all 0.3s ease-in-out",
                    ":hover": {
                      backgroundColor: "red",
                      transform: "scale(1.2)",
                    },
                  }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // console.log(e.currentTarget.parentElement);
                    // console.log(e.currentTarget.getAttribute("key"));
                    try {
                      const res = await axios.delete(
                        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/guest-servers`,

                        {
                          data: { server_id: server.id },
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );
                      // localStorage.setItem("token", res.data.token);
                      // navigate("/dashboard");
                      setOpen(false);
                      window.location.reload();
                    } catch (error) {
                      alert("Server Dead I guess");
                    }
                  }}
                >
                  <DeleteIcon color="white" />
                </Button>
                <CardMedia
                  sx={{ height: 140 }}
                  image="https://linuxiac.b-cdn.net/wp-content/uploads/2020/06/ubuntu-linux.jpg"
                  title="Linux"
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ color: "#ffffff" }}
                  >
                    {server.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ffffff" }}>
                    OS Type :
                    {server.os_type ? server.os_type : "Windows Maybe?"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#ffffffaa", marginTop: "0.3rem" }}
                  >
                    IP : {server.ip_address ? server.ip_address : "192.168.1.1"}
                  </Typography>
                </CardContent>
                {/* <CardActions></CardActions> */}
              </Card>
              // </Grid>
            );
          })}
      </MDBox>
      <Button
        variant="contained"
        sx={{
          borderRadius: "50%",
          height: "4rem",
          width: "4rem",
          position: "absolute",
          bottom: "5%",
          right: "5%",
          transition: "all 0.3s ease-in-out",
          ":hover": {
            transform: "scale(1.3) rotate(360deg)",
          },
        }}
        onClick={(e) => {
          setOpen(true);
        }}
      >
        <AddIcon
          color="white"
          sx={{
            height: "2rem",
            width: "2rem",
          }}
        />
      </Button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
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
            width: 400,
            backdropFilter: "blur(60px)",
            background: "transparent",
            p: 4,
          }}
        >
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Name"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="OS Type"
                  fullWidth
                  onChange={(e) => setOSType(e.target.value)}
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="IP Address"
                  fullWidth
                  onChange={(e) => setIP(e.target.value)}
                />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  type="submit"
                  color="info"
                  fullWidth
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await axios.post(
                        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/guest-servers`,
                        { name: name, os_type: osType, ip_address: ipAddr },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );
                      // localStorage.setItem("token", res.data.token);
                      // navigate("/dashboard");
                      setOpen(false);

                      console.log(res.data.server_key);
                      // window.location.reload();
                    } catch (error) {
                      alert("Server Dead I guess");
                    }
                  }}
                >
                  Add
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Modal>
    </BasicLayout>
  );
};

export default Dashboard;
