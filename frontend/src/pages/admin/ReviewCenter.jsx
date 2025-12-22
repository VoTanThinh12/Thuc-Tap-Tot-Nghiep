import React, { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";

import AdminLayout from "../../components/admin/AdminLayout";
import ReviewManagement from "./ReviewManagement";
import PitchReviewStats from "./PitchReviewStats";

function ReviewCenter() {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "reviews")}
          className="mb-3"
        >
          <Tab eventKey="reviews" title="Đánh giá">
            <ReviewManagement />
          </Tab>
          <Tab eventKey="stats" title="Thống kê đánh giá">
            <PitchReviewStats />
          </Tab>
        </Tabs>
      </Container>
    </AdminLayout>
  );
}

export default ReviewCenter;
