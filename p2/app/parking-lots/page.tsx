"use client";

import { useEffect, useState } from "react";
import OperatorLayout from "@/components/OperatorLayout";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;

type ParkingLot = {
  id: string;
  name: string;
  address: string;
  city?: string;
  totalSpaces: number;
  availableSpaces?: number;
  hourlyRate?: number;
  active?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ParkingLotsPage() {
  const [form] = Form.useForm();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingParkingLot, setEditingParkingLot] =
    useState<ParkingLot | null>(null);

  const getToken = () => localStorage.getItem("locify_token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const loadParkingLots = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/parking-lots`, {
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setParkingLots(data);
    } catch {
      message.error("Error cargando parqueaderos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParkingLots();
  }, []);

  const openCreateModal = () => {
    setEditingParkingLot(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (parkingLot: ParkingLot) => {
    setEditingParkingLot(parkingLot);
    form.setFieldsValue(parkingLot);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const isEditing = Boolean(editingParkingLot);

      const url = isEditing
        ? `${API_URL}/api/parking-lots/${editingParkingLot?.id}`
        : `${API_URL}/api/parking-lots`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error();
      }

      message.success(
        isEditing
          ? "Parqueadero actualizado correctamente"
          : "Parqueadero creado correctamente"
      );

      form.resetFields();
      setOpen(false);
      setEditingParkingLot(null);
      loadParkingLots();
    } catch {
      message.error("Error guardando parqueadero");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/parking-lots/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error();
      }

      message.success("Parqueadero eliminado correctamente");
      loadParkingLots();
    } catch {
      message.error("Error eliminando parqueadero");
    }
  };

  const columns: ColumnsType<ParkingLot> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Dirección",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      render: (city) => city || "No registrada",
    },
    {
      title: "Cupos",
      dataIndex: "totalSpaces",
      key: "totalSpaces",
      render: (_, record) =>
        `${record.availableSpaces ?? record.totalSpaces} / ${record.totalSpaces}`,
    },
    {
      title: "Tarifa hora",
      dataIndex: "hourlyRate",
      key: "hourlyRate",
      render: (value) =>
        value ? `$${Number(value).toLocaleString("es-CO")}` : "No definida",
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
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Editar
          </Button>

          <Popconfirm
            title="Eliminar parqueadero"
            description="¿Seguro que deseas eliminar este parqueadero?"
            okText="Sí, eliminar"
            cancelText="Cancelar"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <OperatorLayout>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Parqueaderos</Title>
          <Paragraph>
            Administra las sedes, cupos, tarifas y datos operativos de los
            parqueaderos registrados en LOCIFY.
          </Paragraph>
        </div>

        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Nuevo parqueadero
            </Button>

            <Button icon={<ReloadOutlined />} onClick={loadParkingLots}>
              Recargar
            </Button>
          </Space>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={parkingLots}
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Card>

        <Modal
          title={
            editingParkingLot
              ? "Editar parqueadero"
              : "Crear nuevo parqueadero"
          }
          open={open}
          onCancel={() => {
            setOpen(false);
            setEditingParkingLot(null);
            form.resetFields();
          }}
          onOk={handleSave}
          okText={editingParkingLot ? "Guardar cambios" : "Crear"}
          cancelText="Cancelar"
          confirmLoading={saving}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre del parqueadero"
              name="name"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input placeholder="Ej: Parqueadero Centro" />
            </Form.Item>

            <Form.Item
              label="Dirección"
              name="address"
              rules={[{ required: true, message: "Ingresa la dirección" }]}
            >
              <Input placeholder="Ej: Calle 10 # 20-30" />
            </Form.Item>

            <Form.Item label="Ciudad" name="city">
              <Input placeholder="Ej: Bogotá" />
            </Form.Item>

            <Form.Item
              label="Total de cupos"
              name="totalSpaces"
              rules={[
                { required: true, message: "Ingresa el total de cupos" },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Cupos disponibles" name="availableSpaces">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Tarifa por hora" name="hourlyRate">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) =>
                  Number(value?.replace(/\$\s?|\.|,/g, "") || 0)
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </OperatorLayout>
  );
}