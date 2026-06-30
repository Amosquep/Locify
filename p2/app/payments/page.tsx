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
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import OperatorLayout from "../../components/OperatorLayout";
import { getToken } from "../../lib/auth";

const { Title, Paragraph } = Typography;

type Payment = {
  id: string;
  reservationId: string;
  reservationCode: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
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

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/payments", {
        headers: getHeaders(),
      });

      setPayments(response.data);
    } catch (error) {
      console.error(error);
      message.error("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (id: string) => {
    try {
      await api.put(`/payments/${id}/approve`, null, {
        headers: getHeaders(),
      });

      message.success("Pago aprobado");
      loadPayments();
    } catch (error) {
      console.error(error);
      message.error("No se pudo aprobar el pago");
    }
  };

  const rejectPayment = async (id: string) => {
    try {
      await api.put(`/payments/${id}/reject`, null, {
        headers: getHeaders(),
      });

      message.success("Pago rechazado");
      loadPayments();
    } catch (error) {
      console.error(error);
      message.error("No se pudo rechazar el pago");
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "APPROVED") return "green";
    if (status === "PENDING") return "orange";
    if (status === "REJECTED") return "red";
    if (status === "REFUNDED") return "blue";
    return "default";
  };

  const columns = [
    {
      title: "Reserva",
      dataIndex: "reservationCode",
      key: "reservationCode",
    },
    {
      title: "Método",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Valor",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }).format(value),
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
      title: "Referencia",
      dataIndex: "transactionReference",
      key: "transactionReference",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Fecha pago",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (value: string | null) =>
        value ? new Date(value).toLocaleString() : "-",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: Payment) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={record.status !== "PENDING"}
            onClick={() => approvePayment(record.id)}
          >
            Aprobar
          </Button>

          <Button
            danger
            icon={<CloseCircleOutlined />}
            disabled={record.status !== "PENDING"}
            onClick={() => rejectPayment(record.id)}
          >
            Rechazar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <OperatorLayout>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Pagos</Title>
          <Paragraph>
            Gestión de pagos, aprobación, rechazo y trazabilidad financiera.
          </Paragraph>
        </div>

        <Card
          title="Listado de pagos"
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadPayments}
            >
              Actualizar
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={payments}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Space>
    </OperatorLayout>
  );
}