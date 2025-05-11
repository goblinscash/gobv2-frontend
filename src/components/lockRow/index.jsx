"use client";
import React from "react";
import styled from "styled-components";

const ListLayout = ({ column, data }) => {
  return (
    <>
      <div className="overflow-x-auto">
        <List className={` text-xs w-full`}>
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
        </List>
      </div>
    </>
  );
};

const List = styled.table`
  border-collapse: separate;
  border-spacing: 0 8px;
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

export default ListLayout;
