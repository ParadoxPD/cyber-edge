import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Constants from "../constants/constants";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import logo from "assets/images/logos/Logo.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://${Constants.SERVER_IP}:${Constants.SERVER_PORT}/login`,
        { username, password }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // navigate("/dashboard");
    }
  }, []);

  return (
    <>
      <MDBox>
        <MDBox
          component="img"
          sx={{
            height: 64,
            position: "absolute",
            zIndex: "100",
            marginTop: "2%",
            marginLeft: "4%",
          }}
          alt="Your logo."
          src={logo}
        />
      </MDBox>

      <BasicLayout image={bgImage}>
        <Card
          sx={{
            backdropFilter: "blur(80px)",
            background: "transparent",
            display: "flex",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            // alignContent: "flex-start",
            // justifyContent: "flex-start",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "30%",
            minWidth: "400px",
            // height: "80%",
            // overflowY: "auto",
            flexWrap: "wrap",
            transform: "translate(-50%,-50%)",
          }}
        >
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            mx={2}
            mt={-3}
            p={2}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Sign in
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <MDInput
                  type="username"
                  label="Username"
                  fullWidth
                  onChange={(e) => setUsername(e.target.value)}
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="Password"
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
                />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  type="submit"
                  color="info"
                  fullWidth
                  onClick={handleLogin}
                >
                  sign in
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </BasicLayout>
    </>
  );
};
// <Container>
{
  /* <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h4">Admin Login</Typography>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="text"
          fullWidth
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Container> */
}

export default Login;
