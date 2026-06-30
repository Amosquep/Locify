"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  LogoutOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import OperatorLayout from "../../components/OperatorLayout";
import { getToken } from "../../lib/auth";

const { Title, Paragraph } = Typography;

type Reservation = {
  id: string;
  reservationCode: string;
  userName: string;
  vehiclePlate: string;
  parkingLotName: string;
  startTime: string;
  endTime: string;
  actualCheckInTime: string | null;
  actualCheckOutTime: string | null;
  estimatedMinutes: number;
  actualMinutes: number | null;
  estimatedAmount: number;
  finalAmount: number | null;
  status: string;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
  });

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const loadReservations = async () => {
    try {
      setLoading(true);

      const response = await api.get("/reservations", {
        headers: getHeaders(),
      });

      setReservations(response.data);
    } catch (error) {
      console.error(error);
      message.error("No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (id: string) => {
    try {
      await api.put(`/reservations/${id}/check-in`, null, {
        headers: getHeaders(),
      });

      message.success("Check-in realizado");
      loadReservations();
    } catch (error) {
      console.error(error);
      message.error("No se pudo realizar el check-in");
    }
  };

  const checkOut = async (id: string) => {
    try {
      await api.put(`/reservations/${id}/check-out`, null, {
        headers: getHeaders(),
      });

      message.success("Check-out realizado");
      loadReservations();
    } catch (error) {
      console.error(error);
      message.error("No se pudo realizar el check-out");
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      await api.put(`/reservations/${id}/cancel`, null, {
        headers: getHeaders(),
      });

      message.success("Reserva cancelada");
      loadReservations();
    } catch (error) {
      console.error(error);
      message.error("No se pudo cancelar la reserva");
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "CONFIRMED") return "green";
    if (status === "IN_USE") return "blue";
    if (status === "COMPLETED") return "purple";
    if (status === "CANCELLED") return "red";
    if (status === "PENDING_PAYMENT") return "orange";
    return "default";
  };

  const columns = [
    {
      title: "Código",
      dataIndex: "reservationCode",
      key: "reservationCode",
    },
    {
      title: "Cliente",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Placa",
      dataIndex: "vehiclePlate",
      key: "vehiclePlate",
    },
    {
      title: "Parqueadero",
      dataIndex: "parkingLotName",
      key: "parkingLotName",
    },
    {
      title: "Inicio",
      dataIndex: "startTime",
      key: "startTime",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "Fin",
      dataIndex: "endTime",
      key: "endTime",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Valor estimado",
      dataIndex: "estimatedAmount",
      key: "estimatedAmount",
      render: (value: number) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }).format(value),
    },
    {
      title: "Valor final",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (value: number | null) =>
        value === null
          ? "-"
          : new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(value),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: Reservation) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={
              record.status !== "CONFIRMED" &&
              record.status !== "PENDING_PAYMENT"
            }
            onClick={() => checkIn(record.id)}
          >
            Check-in
          </Button>

          <Button
            icon={<LogoutOutlined />}
            disabled={record.status !== "IN_USE"}
            onClick={() => checkOut(record.id)}
          >
            Check-out
          </Button>

          <Button
            danger
            icon={<StopOutlined />}
            disabled={
              record.status === "CANCELLED" ||
              record.status === "COMPLETED" ||
              record.status === "IN_USE"
            }
            onClick={() => cancelReservation(record.id)}
          >
            Cancelar
          </Button>
        </Space>
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
          <Title level={2}>Reservas</Title>
          <Paragraph>
            Gestión operativa de reservas, check-in, check-out y cancelaciones.
          </Paragraph>
        </div>

        <Card
          title="Listado de reservas"
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadReservations}
            >
              Actualizar
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={reservations}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </Space>
    </OperatorLayout>
  );
}