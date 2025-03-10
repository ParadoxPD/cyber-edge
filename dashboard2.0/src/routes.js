

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportPage from "./pages/ReportPage";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
    {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        icon: <Icon fontSize="small">dashboard</Icon>,
        route: "/dashboard",
        component: <Dashboard />,
    },
    {
        type: "collapse",
        name: "Servers",
        key: "servers",
        icon: <Icon fontSize="small">Servers</Icon>,
        route: "/server/:serverId",
        component: <ReportPage />,
    },
    {
        type: "collapse",
        name: "Sign In",
        key: "sign-in",
        icon: <Icon fontSize="small">login</Icon>,
        route: "/",
        component: <Login />,
    },
];

export default routes;