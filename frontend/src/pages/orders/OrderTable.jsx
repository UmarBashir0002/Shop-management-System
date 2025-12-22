// src/pages/orders/OrderTable.jsx
import React from "react";
import Table from "../../components/common/Table";

/**
 * Simple wrapper so OrdersList can import a styled table if desired.
 * Accepts same props as Table.
 */
export default function OrderTable({ columns = [], data = [], isLoading = false, className = "" }) {
  return (
    <div className={className}>
      <Table columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
}
