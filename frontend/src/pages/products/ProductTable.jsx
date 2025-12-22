// src/pages/products/ProductTable.jsx
import React from "react";
import Table from "../../components/common/Table";

export default function ProductTable({ items = [], isLoading }) {
  const columns = [
    { title: "ID", key: "id" },
    { title: "Name", key: "name" },
    { title: "Brand", key: "brand" },
    { title: "Type", key: "type" },
    { title: "Qty", key: "quantity" },
  ];

  return <Table columns={columns} data={items} isLoading={isLoading} />;
}
