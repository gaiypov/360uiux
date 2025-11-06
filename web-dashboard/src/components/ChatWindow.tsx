/**
 * 360° РАБОТА - Web Dashboard
 * Chat Window Component
 * Architecture v3: Chat with jobseeker including private resume videos
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Video, Clock, Check, CheckCheck } from 'lucide-react';
import { ResumeVideoViewer } from './ResumeVideoViewer';

interface ChatMessage {
  id: string;
  sender_type: 'jobseeker' | 'employer' | 'system';
  message_type: 'text' | 'video' | 'system';
  content?: string;
  video_id?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatWindowProps {
  applicationId: string;
  jobseekerName: string;
  vacancyTitle: string;
}

export function ChatWindow({
  applicationId,
  jobseekerName,
  vacancyTitle,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // TODO: Setup WebSocket for real-time updates
  }, [applicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    try {
      setLoading(true);

      const response = await fetch(`/api/chat/${applicationId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.messages || []);

      // Mark as read
      await fetch(`/api/chat/${applicationId}/read`, { method: 'PUT' });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      const response = await fetch(`/api/chat/${applicationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'text',
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  }

  function renderMessage(message: ChatMessage, index: number) {
    const showDate =
      index === 0 ||
      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

    const isEmployer = message.sender_type === 'employer';
    const isSystem = message.sender_type === 'system';

    return (
      <div key={message.id}>
        {/* Date separator */}
        {showDate && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-xs text-gray-500 font-medium">
              {formatDate(message.created_at)}
            </span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
        )}

        {/* System message */}
        {isSystem && (
          <div className="flex justify-center my-4">
            <div className="bg-gray-800/50 px-4 py-2 rounded-full">
              <p className="text-sm text-gray-400 text-center">{message.content}</p>
            </div>
          </div>
        )}

        {/* Video message */}
        {message.message_type === 'video' && !isSystem && (
          <div className={`flex ${isEmployer ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-md ${isEmployer ? 'ml-auto' : 'mr-auto'}`}>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">
                    Видео-резюме
                  </span>
                </div>
                {message.video_id && (
                  <ResumeVideoViewer
                    videoId={message.video_id}
                    applicationId={applicationId}
                  />
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{formatTime(message.created_at)}</span>
                  {isEmployer && (
                    <span className="flex items-center gap-1">
                      {message.is_read ? (
                        <CheckCheck className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text message */}
        {message.message_type === 'text' && !isSystem && (
          <div className={`flex ${isEmployer ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
              className={`max-w-md px-4 py-3 rounded-2xl ${
                isEmployer
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div
                className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                  isEmployer ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                <span>{formatTime(message.created_at)}</span>
                {isEmployer && (
                  <span className="ml-1">
                    {message.is_read ? (
                      <CheckCheck className="w-4 h-4 text-blue-200" />
                    ) : (
                      <Check className="w-4 h-4 text-blue-300" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-400">Загрузка чата...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div>
          <h3 className="font-semibold text-white">{jobseekerName}</h3>
          <p className="text-sm text-gray-400">{vacancyTitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Онлайн</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Нет сообщений</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Написать сообщение..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg font-medium text-white transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  );
}
