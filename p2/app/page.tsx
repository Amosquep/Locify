"use client";

import Link from "next/link";
import { Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 500, borderRadius: 16 }}>
        <Title level={2}>LOCIFY</Title>

        <Paragraph>Parquear nunca fue tan fácil.</Paragraph>

        <Link href="/login">
          <Button type="primary" size="large" block>
            Ingresar
          </Button>
        </Link>
      </Card>
    </main>
  );
}