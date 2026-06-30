"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function LoginPage() {

  const router = useRouter();

  const onFinish = async (values: any) => {

    try {

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      message.success("Login exitoso");

      router.push("/dashboard");

    } catch (error) {

      console.error(error);

      message.error("Credenciales inválidas");
    }
  };

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
      <Card
        style={{
          width: 420,
          borderRadius: 16,
        }}
      >
        <Title level={2}>
          LOCIFY
        </Title>

        <Paragraph>
          Panel operador
        </Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Correo"
            name="email"
            rules={[
              {
                required: true,
                message: "Ingrese el correo",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              {
                required: true,
                message: "Ingrese la contraseña",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
          >
            Ingresar
          </Button>
        </Form>
      </Card>
    </main>
  );
}