"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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
  status: string;
};

type ParkingLot = {
  id: string;
  name: string;
  city: string;
  totalCapacity: number;
  status: string;
};

export default function DashboardPage() {
  const [inUseReservations, setInUseReservations] = useState<Reservation[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [inUseResponse, todayResponse, parkingLotsResponse] =
        await Promise.all([
          api.get("/reservations/in-use", { headers }),
          api.get("/reservations/today", { headers }),
          api.get("/parking-lots", { headers }),
        ]);

      setInUseReservations(inUseResponse.data);
      setTodayReservations(todayResponse.data);
      setParkingLots(parkingLotsResponse.data);
    } catch (error) {
      console.error(error);
      message.error("No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const reservationColumns = [
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
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "IN_USE" ? "blue" : "green"}>{status}</Tag>
      ),
    },
  ];

  const parkingLotColumns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Capacidad",
      dataIndex: "totalCapacity",
      key: "totalCapacity",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <OperatorLayout>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Dashboard Operador</Title>
          <Paragraph>Parquear nunca fue tan fácil.</Paragraph>
        </Col>

        <Col>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadDashboardData}
          >
            Actualizar
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Reservas en uso"
              value={inUseReservations.length}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Reservas de hoy"
              value={todayReservations.length}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Parqueaderos registrados"
              value={parkingLots.length}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="Reservas en uso">
        <Table
          rowKey="id"
          loading={loading}
          columns={reservationColumns}
          dataSource={inUseReservations}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card style={{ marginTop: 24 }} title="Reservas de hoy">
        <Table
          rowKey="id"
          loading={loading}
          columns={reservationColumns}
          dataSource={todayReservations}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card style={{ marginTop: 24 }} title="Parqueaderos">
        <Table
          rowKey="id"
          loading={loading}
          columns={parkingLotColumns}
          dataSource={parkingLots}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </OperatorLayout>
  );
}