import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { authAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const AccountPage = () => {
  const { refreshProfile } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getProfile();
        const u = res?.data?.user || {};
        setProfile({
          full_name: u.full_name || u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
        });
      } catch (e) {
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      });
      await refreshProfile();
      toast.success("Cập nhật thông tin thành công");
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setChangingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  return (
    <Container className="py-4 account-page">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Tài khoản của tôi</h2>
          <div className="text-muted">Quản lý thông tin cá nhân và đổi mật khẩu</div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Thông tin cá nhân</Card.Title>
              <Form onSubmit={handleSaveProfile}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, full_name: e.target.value }))
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={profile.email} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, address: e.target.value }))
                  }
                  />
                </Form.Group>

                <Button type="submit" variant="success" disabled={savingProfile}>
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Đổi mật khẩu</Card.Title>
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="success"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountPage;
