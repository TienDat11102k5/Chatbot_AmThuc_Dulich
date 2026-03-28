import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import chatService from '../../lib/chatService';

/**
 * ChatSidebar - Sidebar hiển thị danh sách chat sessions
 * 
 * Features:
 * - Hiển thị danh sách các đoạn chat cũ
 * - Button "New Chat" để tạo đoạn chat mới
 * - Click vào session để load lại conversation
 * - Highlight session đang active
 */
export default function ChatSidebar({ 
  userId, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat 
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load danh sách sessions khi component mount
  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await chatService.getUserSessions(userId);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    // Reload sessions sau khi tạo mới
    setTimeout(() => loadSessions(), 500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Đoạn chat mới</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Đang tải...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Chưa có đoạn chat nào
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare 
                    size={18} 
                    className={currentSessionId === session.id ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {session.title || 'Đoạn chat mới'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        {sessions.length} đoạn chat
      </div>
    </div>
  );
}
