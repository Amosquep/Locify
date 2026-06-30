"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  message,
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  CarOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { getToken, logout } from "@/lib/auth";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type OperatorLayoutProps = {
  children: ReactNode;
};

export default function OperatorLayout({ children }: OperatorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/reservations",
      icon: <CalendarOutlined />,
      label: "Reservas",
    },
    {
      key: "/parking-lots",
      icon: <CarOutlined />,
      label: "Parqueaderos",
    },
    {
      key: "/payments",
      icon: <CreditCardOutlined />,
      label: "Pagos",
    },
    {
      key: "/admin/operators",
      icon: <UserAddOutlined />,
      label: "Crear operadores",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
      message.success("Sesión cerrada");
      router.push("/login");
      return;
    }

    router.push(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} theme="dark">
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            color: "white",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          LOCIFY
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          }}
        >
          <Text strong>Panel operador</Text>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text>admin@locify.com</Text>
            <Avatar style={{ backgroundColor: "#1677ff" }}>L</Avatar>
          </div>
        </Header>

        <Content
          style={{
            padding: 32,
            background: "#f5f5f5",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}