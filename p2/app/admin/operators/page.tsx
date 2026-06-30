"use client";

import { useEffect, useState } from "react";
import OperatorLayout from "@/components/OperatorLayout";
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;

type Operator = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  parkingLotName?: string;
  active?: boolean;
};



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminOperatorsPage() {
  const [form] = Form.useForm();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem("locify_token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const loadOperators = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/admin/operators`, {
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setOperators(data);
    } catch {
      message.error("Error cargando operadores");
    } finally {
      setLoading(false);
    }
  };

  const loadParkingLots = async () => {
    try {
      const response = await fetch(`${API_URL}/api/parking-lots`, {
        headers: authHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      setParkingLots(data);
    } catch {
      setParkingLots([]);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const response = await fetch(`${API_URL}/api/admin/operators`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error();
      }

      message.success("Operador creado correctamente");
      form.resetFields();
      setOpen(false);
      loadOperators();
    } catch {
      message.error("Error creando operador");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Operator> = [
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
      render: (phone) => phone || "No registrado",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "OPERATOR_ADMIN" ? "blue" : "green"}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Parqueadero",
      dataIndex: "parkingLotName",
      key: "parkingLotName",
      render: (name) => name || "Sin asignar",
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      render: (active) =>
        active === false ? (
          <Tag color="red">Inactivo</Tag>
        ) : (
          <Tag color="green">Activo</Tag>
        ),
    },
  ];

  return (
    <OperatorLayout>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Administración de operadores</Title>
          <Paragraph>
            Crea y administra usuarios operadores para el control de cada sede o
            parqueadero.
          </Paragraph>
        </div>

        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Nuevo operador
            </Button>

            <Button icon={<ReloadOutlined />} onClick={loadOperators}>
              Recargar
            </Button>
          </Space>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={operators}
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Card>

        <Modal
          title="Crear operador"
          open={open}
          onCancel={() => setOpen(false)}
          onOk={handleCreate}
          okText="Crear"
          cancelText="Cancelar"
          confirmLoading={saving}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre completo"
              name="fullName"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input placeholder="Ej: Juan Pérez" />
            </Form.Item>

            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[
                { required: true, message: "Ingresa el correo" },
                { type: "email", message: "Correo inválido" },
              ]}
            >
              <Input placeholder="operador@locify.com" />
            </Form.Item>

            <Form.Item label="Teléfono" name="phone">
              <Input placeholder="3001234567" />
            </Form.Item>

            <Form.Item
              label="Rol"
              name="role"
              rules={[{ required: true, message: "Selecciona un rol" }]}
            >
              <Select
                placeholder="Selecciona un rol"
                options={[
                  {
                    label: "Administrador de operador",
                    value: "OPERATOR_ADMIN",
                  },
                  {
                    label: "Operador de sede",
                    value: "OPERATOR_STAFF",
                  },
                ]}
              />
            </Form.Item>

            

            <Form.Item
              label="Contraseña temporal"
              name="password"
              rules={[
                { required: true, message: "Ingresa una contraseña" },
              ]}
            >
              <Input.Password placeholder="Contraseña temporal" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </OperatorLayout>
  );
}