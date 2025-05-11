"use client";
import React from "react";
import styled from "styled-components";

const TableLayout = ({ column, data }) => {
  return (
    <>
      <div className="overflow-x-auto">
        <Table className={` text-xs w-full`}>
          <thead>
            <tr>
              {column &&
                column.length > 0 &&
                column.map((item, index) => (
                  <th
                    key={index}
                    className="font-semibold p-3 border-0 text-left"
                  >
                    {item.head}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data.length > 0 &&
              data.map((rowData, rowIndex) => (
                <tr key={rowIndex}>
                  {column &&
                    column.length > 0 &&
                    column.map((item, colIndex) => {
                      if (item.component) {
                        return (
                          <td key={colIndex} className="border-0 p-3 fw-sbold">
                            {item.component(rowData, rowIndex, data)}
                          </td>
                        );
                      }

                      return (
                        <td key={colIndex} className="border-0 p-3 fw-sbold">
                          {rowData[item?.accessor]}
                        </td>
                      );
                    })}
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 14px;
  th {
    background: var(--backgroundColor2);
    color: #666666;
  }
  tr {
    > *:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    > *:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
  td {
    background: #000e0e;
    color: #fff;
    vertical-align: top;
  }
`;

export default TableLayout;
