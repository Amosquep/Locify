"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CarOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import OperatorLayout from "../../components/OperatorLayout";
import { getToken } from "../../lib/auth";

const { Title, Paragraph } = Typography;

type Vehicle = {
  id: string;
  userId: string;
  userName: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  vehicleType: string;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
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

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await api.get("/vehicles", {
        headers: getHeaders(),
      });

      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error(error);
      message.error("No se pudieron cargar los vehículos");
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (values: any) => {
    try {
      await api.post(
        "/vehicles",
        {
          userId: values.userId,
          plate: values.plate,
          brand: values.brand,
          model: values.model,
          color: values.color,
          vehicleType: values.vehicleType,
        },
        {
          headers: getHeaders(),
        }
      );

      message.success("Vehículo registrado");
      setOpenModal(false);
      form.resetFields();
      loadVehicles();
    } catch (error) {
      console.error(error);
      message.error("No se pudo registrar el vehículo");
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await api.delete(`/vehicles/${id}`, {
        headers: getHeaders(),
      });

      message.success("Vehículo eliminado");
      loadVehicles();
    } catch (error) {
      console.error(error);
      message.error("No se pudo eliminar el vehículo");
    }
  };

  const searchByPlate = (value: string) => {
    const normalizedValue = value.toUpperCase().trim();

    if (!normalizedValue) {
      setFilteredVehicles(vehicles);
      return;
    }

    const filtered = vehicles.filter((vehicle) =>
      vehicle.plate.toUpperCase().includes(normalizedValue)
    );

    setFilteredVehicles(filtered);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const columns = [
    {
      title: "Placa",
      dataIndex: "plate",
      key: "plate",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Marca",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Modelo",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Tipo",
      dataIndex: "vehicleType",
      key: "vehicleType",
      render: (value: string) => (
        <Tag color={value === "CAR" ? "green" : "orange"}>{value}</Tag>
      ),
    },
    {
      title: "Usuario",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: Vehicle) => (
        <Space>
          <Popconfirm
            title="Eliminar vehículo"
            description="¿Seguro que deseas eliminar este vehículo?"
            onConfirm={() => deleteVehicle(record.id)}
            okText="Sí"
            cancelText="Cancelar"
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
          <Title level={2}>Vehículos</Title>

          <Paragraph>
            Gestión de vehículos registrados en LOCIFY.
          </Paragraph>
        </div>

        <Card
          title="Listado de vehículos"
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadVehicles}>
                Actualizar
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenModal(true)}
              >
                Registrar vehículo
              </Button>
            </Space>
          }
        >
          <Input
            placeholder="Buscar por placa..."
            style={{ width: 300, marginBottom: 16 }}
            onChange={(event) => searchByPlate(event.target.value)}
          />

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredVehicles}
            pagination={{ pageSize: 8 }}
          />
        </Card>

        <Modal
          title="Registrar vehículo"
          open={openModal}
          onCancel={() => setOpenModal(false)}
          footer={null}
        >
          <Form layout="vertical" form={form} onFinish={createVehicle}>
            <Form.Item
              label="User ID"
              name="userId"
              rules={[
                {
                  required: true,
                  message: "Ingrese el ID del usuario",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Placa"
              name="plate"
              rules={[
                {
                  required: true,
                  message: "Ingrese la placa",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Marca"
              name="brand"
              rules={[
                {
                  required: true,
                  message: "Ingrese la marca",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Modelo"
              name="model"
              rules={[
                {
                  required: true,
                  message: "Ingrese el modelo",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Color"
              name="color"
              rules={[
                {
                  required: true,
                  message: "Ingrese el color",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Tipo"
              name="vehicleType"
              rules={[
                {
                  required: true,
                  message: "Seleccione el tipo",
                },
              ]}
            >
              <Select
                options={[
                  {
                    label: "Carro",
                    value: "CAR",
                  },
                  {
                    label: "Moto",
                    value: "MOTORCYCLE",
                  },
                ]}
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<CarOutlined />} block>
              Guardar vehículo
            </Button>
          </Form>
        </Modal>
      </Space>
    </OperatorLayout>
  );
}