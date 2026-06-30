"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import OperatorLayout from "../../components/OperatorLayout";

import { getToken } from "../../lib/auth";

const { Title, Paragraph } = Typography;

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [form] = Form.useForm();

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
  });

  const getHeaders = () => {

    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const loadUsers = async () => {

    try {

      setLoading(true);

      const response = await api.get("/users", {
        headers: getHeaders(),
      });

      setUsers(response.data);

    } catch (error) {

      console.error(error);

      message.error("No se pudieron cargar los usuarios");

    } finally {

      setLoading(false);
    }
  };

  const createUser = async (values: any) => {

    try {

      await api.post(
        "/users",
        {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role,
        },
        {
          headers: getHeaders(),
        }
      );

      message.success("Usuario creado");

      setOpenModal(false);

      form.resetFields();

      loadUsers();

    } catch (error) {

      console.error(error);

      message.error("No se pudo crear el usuario");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const columns = [
    {
      title: "Nombre",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Correo",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (value: string) => {

        let color = "blue";

        if (value === "SUPER_ADMIN") {
          color = "red";
        }

        if (value === "OPERATOR_ADMIN") {
          color = "green";
        }

        if (value === "OPERATOR_STAFF") {
          color = "orange";
        }

        return (
          <Tag color={color}>
            {value}
          </Tag>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={value === "ACTIVE" ? "green" : "red"}>
          {value}
        </Tag>
      ),
    },
  ];

  return (
    <OperatorLayout>

      <Space
        orientation="vertical"
        size="large"
        style={{ width: "100%" }}
      >

        <div>

          <Title level={2}>
            Usuarios
          </Title>

          <Paragraph>
            Administración de usuarios y operadores.
          </Paragraph>

        </div>

        <Card
          title="Usuarios registrados"
          extra={
            <Space>

              <Button
                icon={<ReloadOutlined />}
                onClick={loadUsers}
              >
                Actualizar
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenModal(true)}
              >
                Crear usuario
              </Button>

            </Space>
          }
        >

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 8 }}
          />

        </Card>

        <Modal
          title="Crear usuario"
          open={openModal}
          onCancel={() => setOpenModal(false)}
          footer={null}
        >

          <Form
            layout="vertical"
            form={form}
            onFinish={createUser}
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

            <Form.Item
              label="Rol"
              name="role"
              rules={[
                {
                  required: true,
                  message: "Seleccione el rol",
                },
              ]}
            >

              <Select
                options={[
                  {
                    label: "Administrador Operador",
                    value: "OPERATOR_ADMIN",
                  },
                  {
                    label: "Empleado Operador",
                    value: "OPERATOR_STAFF",
                  },
                  {
                    label: "Cliente",
                    value: "CLIENT",
                  },
                  {
                    label: "Soporte",
                    value: "SUPPORT",
                  },
                ]}
              />

            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<UserOutlined />}
              block
            >
              Crear usuario
            </Button>

          </Form>

        </Modal>

      </Space>

    </OperatorLayout>
  );
}