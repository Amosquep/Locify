"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function RegisterPage() {

  const router = useRouter();

  const onFinish = async (values: any) => {

    try {

      await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }
      );

      message.success("Usuario registrado exitosamente");

      router.push("/login");

    } catch (error) {

      console.error(error);

      message.error("No se pudo registrar el usuario");
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
          width: 450,
          borderRadius: 16,
        }}
      >
        <Title level={2}>
          Registro LOCIFY
        </Title>

        <Paragraph>
          Crea tu cuenta de conductor.
        </Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nombre completo"
            name="fullName"
            rules={[
              {
                required: true,
                message: "Ingrese el nombre",
              },
            ]}
          >
            <Input />
          </Form.Item>

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
            label="Teléfono"
            name="phone"
            rules={[
              {
                required: true,
                message: "Ingrese el teléfono",
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
            Registrarse
          </Button>
        </Form>
      </Card>
    </main>
  );
}