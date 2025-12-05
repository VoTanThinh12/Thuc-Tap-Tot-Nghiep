// Format currency to Vietnamese format
export const formatCurrency = (amount) => {
  if (amount == null || amount === "") return "-";

  const number = Number(amount);
  if (isNaN(number)) return "-";

  // Format with thousands separator (dot for Vietnam)
  return new Intl.NumberFormat("vi-VN").format(number) + " VND";
};

// Format booking status to Vietnamese
export const formatBookingStatus = (status) => {
  const statusMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

// Format service status to Vietnamese
export const formatServiceStatus = (status) => {
  const statusMap = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
  };
  return statusMap[status] || status;
};

// Format field status to Vietnamese
export const formatFieldStatus = (status) => {
  const statusMap = {
    active: "Hoạt động",
    inactive: "Bảo trì",
    maintenance: "Bảo trì",
  };
  return statusMap[status] || status;
};

// Format category to Vietnamese
export const formatCategory = (category) => {
  const categoryMap = {
    equipment: "Đồ dùng củ bóng đá",
    beverage: "Nước uống & Đồ ăn",
    other: "Dịch vụ khác",
  };
  return categoryMap[category] || category;
};

// Get status class for badge styling
export const getStatusClass = (status) => {
  switch (status) {
    case "pending":
    case "inactive":
    case "maintenance":
      return "pending";
    case "confirmed":
    case "active":
      return "confirmed";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "";
  }
};
