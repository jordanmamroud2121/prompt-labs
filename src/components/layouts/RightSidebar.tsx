"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

// Mock data for history items
const mockHistoryItems = [
  {
    id: "1",
    prompt: "lorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsum",
    timestamp: new Date(new Date().setHours(10, 30)),
    date: "Today",
  },
  {
    id: "2",
    prompt: "lorem ipsumlorem ipsumlorem ipsum",
    timestamp: new Date(new Date().setHours(9, 15)),
    date: "Today",
  },
  {
    id: "3",
    prompt: "lorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsum",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    date: "Yesterday",
  },
];

export default function RightSidebar() {
  const [historyItems, setHistoryItems] = useState(mockHistoryItems);

  // Group history items by date
  const groupedHistory = historyItems.reduce((groups, item) => {
    const dateKey = item.date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, typeof mockHistoryItems>);

  // Format timestamp to display time only (HH:MM AM/PM)
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center space-x-2 text-lg font-medium text-gray-800">
        <h2>History</h2>
      </div>

      <div className="overflow-auto">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">{date}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 hover:border-gray-300"
                >
                  <div className="mb-1 text-xs text-gray-500">
                    <time>{formatTime(item.timestamp)}</time>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {item.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {historyItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <Clock className="mb-2 h-8 w-8" />
            <p className="text-sm">No history yet</p>
            <p className="text-xs">Your prompt history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
} 