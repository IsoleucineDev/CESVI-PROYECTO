import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { ErrorBoundary } from "react-error-boundary";

// ANTD
import { Layout as AntLayout, Menu, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// iconos
import { Icon } from "@iconify/react";

// CONTEXT
import ThemeContext from "../../context/ThemContext";

// COMPONENTES
import HeaderComponent from "../Layout/Header";
import FooterComponent from "../Layout/Footer";

// servicios
import { DataMenu } from "./Services";

const { Sider, Content } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const { keycloak } = useKeycloak();

  const [loading, setloading] = useState(false);
  const [items, setItems] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const rootSubmenuKeys = [""];
  const [openKeys, setOpenKeys] = useState([""]);

  const { themeAntd, themeGral, msErrorApi, logoutOptions } = themeContext;

  const FILES_BASE_URL =
    process.env.REACT_APP_FILES_BASE_URL ||
    "http://localhost/ProyAgusto/FotosVin/Templet-BackEnd-main/public/";

  const [icono, setIcono] = useState("icono_cesvi");
  const [logo, setLogo] = useState("logo_cesvi");

  function ErrorFallback() {
    return (
      <div role="alert" style={{ margin: 20 }}>
        <p>Ocurrió un problema en el sistema, favor de dar click en Inicio para regresar</p>
        <button onClick={() => navigate("/Dashboard")}>Inicio</button>
      </div>
    );
  }

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const getItem = ({ label, key, icon, children, type, distColor, colorIcon }) => {
    return {
      key,
      icon: (
        <Icon
          icon={icon}
          style={{
            fontSize: distColor ? themeGral.Layout_sizeIconChildre : themeGral.Layout_sizeIcon,
            color: colorIcon,
          }}
        />
      ),
      children,
      label,
      type,
    };
  };

  const onTipoMenu = (e) => {
    if (e.key === "login") {
      keycloak.logout(process.env.REACT_APP_logoutOption);
    } else {
      // soporta keys con y sin slash inicial
      navigate(e.key.startsWith("/") ? e.key : `/${e.key}`);
    }
  };

  const ActualizaMenu = async (keycloakInst) => {
    await keycloakInst.loadUserInfo();
    const user_info = keycloakInst.userInfo;

    const user = {
      id_modulo: process.env.REACT_APP_Modulo,
      id_keycloak: user_info.sub,
      preferred_username: user_info.preferred_username,
      email: user_info.email,
      given_name: user_info.given_name,
      family_name: user_info.family_name,
      name: user_info.name,
      id_company: 1,
      rol: keycloakInst.resourceAccess
        ? keycloakInst.resourceAccess[process.env.REACT_APP_clientId]?.roles?.[0]
        : null,
    };

    const subject = keycloakInst.subject;
    const response = await DataMenu(setloading, msErrorApi, keycloakInst, logoutOptions, subject, user);

    setloading(true);

    let MenuItems = [];
    let SubMenu = [];

    if (response?.CodeActivacion === "") {
      navigate("/VerificacionUsuario");
    }

    switch (response?.data?.length) {
      default:
        setItems([]);
        response.data.forEach((row) => {
          const { label, ruta_route, icon, children, primary_color } = row;
          SubMenu = [];

          if (children.length > 0) {
            children.forEach((rowChild) => {
              SubMenu.push(
                getItem({
                  label: rowChild.label,
                  key: rowChild.ruta_route,
                  icon: rowChild.icon,
                  distColor: true,
                  colorIcon: primary_color,
                })
              );
            });
          }

          MenuItems.push(
            children.length > 0
              ? getItem({ label, key: ruta_route, icon, children: SubMenu, colorIcon: primary_color })
              : getItem({ label, key: ruta_route, icon, colorIcon: primary_color })
          );
        });

        setItems(MenuItems);
        setIcono(response.icono);
        setLogo(response.logo);
        break;
      case 0:
        break;
    }

    setCollapsed(true);
    setloading(false);
  };

  useEffect(() => {
    if (!!keycloak.authenticated) {
      ActualizaMenu(keycloak);
    }
  }, [keycloak]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        width={!collapsed ? 300 : 100}
        theme={themeAntd}
        collapsible
        style={{ height: "auto", boxShadow: "0px 20px 20px" }}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            display: collapsed && "flex",
            justifycontent: "center",
            alignitems: "center",
            margin: "18px",
            textAlign: "center",
            top: "90",
            marginBottom: "5px",
            borderRadius: !collapsed && "5px 30px 30px 5px",
          }}
        >
          {icono !== "icono_cesvi" && (
            <img
              src={!collapsed ? `${FILES_BASE_URL}${logo}` : `${FILES_BASE_URL}${icono}`}
              style={{
                maxWidth: !collapsed ? "250px" : "70px",
                maxHeight: !collapsed ? "80px" : "70px",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        <Spin spinning={loading} indicator={antIcon}>
          <Menu
            theme={themeAntd}
            mode="inline"
            defaultSelectedKeys={["DemosComponents"]}
            items={items}
            openKeys={openKeys}
            onOpenChange={(keys) => onOpenChange(keys)}
            onClick={(e) => onTipoMenu(e)}
          />
        </Spin>
      </Sider>

      <AntLayout className="site-layout">
        <HeaderComponent />
        <Content onClick={() => setCollapsed(true)}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </Content>
        <FooterComponent />
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
