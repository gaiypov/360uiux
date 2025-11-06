'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Play,
} from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';

type Message = {
  id: number;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'video';
  videoUrl?: string;
};

type Chat = {
  id: number;
  participant: {
    name: string;
    photo: string;
    profession: string;
    isOnline: boolean;
  };
  vacancy: {
    title: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  messages: Message[];
};

const mockChats: Chat[] = [
  {
    id: 1,
    participant: {
      name: 'Анна Иванова',
      photo: 'https://i.pravatar.cc/150?img=1',
      profession: 'Frontend Developer',
      isOnline: true,
    },
    vacancy: {
      title: 'Senior Frontend Developer',
    },
    lastMessage: {
      content: 'Спасибо! Когда можно подойти на собеседование?',
      timestamp: '14:35',
      isRead: false,
    },
    unreadCount: 2,
    messages: [
      {
        id: 1,
        senderId: 'employer',
        content: 'Здравствуйте! Посмотрел ваше резюме, очень понравилось.',
        timestamp: '14:30',
        isRead: true,
        type: 'text',
      },
      {
        id: 2,
        senderId: 'candidate',
        content: 'Добрый день! Спасибо большое!',
        timestamp: '14:32',
        isRead: true,
        type: 'text',
      },
      {
        id: 3,
        senderId: 'employer',
        content: 'Приглашаю вас на собеседование в четверг в 15:00',
        timestamp: '14:33',
        isRead: true,
        type: 'text',
      },
      {
        id: 4,
        senderId: 'candidate',
        content: 'Спасибо! Когда можно подойти на собеседование?',
        timestamp: '14:35',
        isRead: false,
        type: 'text',
      },
    ],
  },
  {
    id: 2,
    participant: {
      name: 'Дмитрий Петров',
      photo: 'https://i.pravatar.cc/150?img=12',
      profession: 'Backend Developer',
      isOnline: false,
    },
    vacancy: {
      title: 'Senior Backend Developer',
    },
    lastMessage: {
      content: 'Отправил вам видео-резюме',
      timestamp: 'Вчера',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 1,
        senderId: 'candidate',
        content: 'Здравствуйте! Откликнулся на вашу вакансию.',
        timestamp: 'Вчера 18:20',
        isRead: true,
        type: 'text',
      },
      {
        id: 2,
        senderId: 'candidate',
        content: 'Отправил вам видео-резюме',
        timestamp: 'Вчера 18:21',
        isRead: true,
        type: 'video',
        videoUrl: 'https://storage.yandex.net/videos/resume2.mp4',
      },
    ],
  },
  {
    id: 3,
    participant: {
      name: 'Елена Смирнова',
      photo: 'https://i.pravatar.cc/150?img=5',
      profession: 'UI/UX Designer',
      isOnline: true,
    },
    vacancy: {
      title: 'UI/UX Designer',
    },
    lastMessage: {
      content: 'Портфолио во вложении',
      timestamp: '2 дня назад',
      isRead: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 1,
        senderId: 'candidate',
        content: 'Добрый день! Заинтересовала ваша вакансия.',
        timestamp: '2 дня назад 10:15',
        isRead: true,
        type: 'text',
      },
      {
        id: 2,
        senderId: 'candidate',
        content: 'Портфолио во вложении',
        timestamp: '2 дня назад 10:16',
        isRead: true,
        type: 'text',
      },
    ],
  },
];

export default function ChatsPage() {
  const [chats, setChats] = useState(mockChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(chats[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: activeChat.messages.length + 1,
      senderId: 'employer',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
      type: 'text',
    };

    setActiveChat({
      ...activeChat,
      messages: [...activeChat.messages, newMessage],
    });

    setMessageText('');
  };

  const filteredChats = chats.filter((chat) =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] bg-[#0A0A0F] p-6">
      <div className="flex gap-6 h-full">
        {/* Chat List Sidebar */}
        <Card className="w-96 bg-[#121218] border-[#1A1A23] flex flex-col p-0">
          {/* Header */}
          <div className="p-6 border-b border-[#1A1A23]">
            <h2 className="text-2xl font-bold text-white mb-4">Чаты</h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="pl-10 bg-[#0A0A0F] border-[#1A1A23] text-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-4 border-b border-[#1A1A23] hover:bg-[#0A0A0F] transition-colors text-left ${
                  activeChat?.id === chat.id ? 'bg-[#0A0A0F]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={chat.participant.photo}
                      alt={chat.participant.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {chat.participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#121218] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {chat.participant.name}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2">
                        {chat.lastMessage.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-1 truncate">
                      {chat.participant.profession}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {chat.lastMessage.content}
                      </p>

                      {chat.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] text-white text-xs font-semibold rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Active Chat */}
        {activeChat ? (
          <Card className="flex-1 bg-[#121218] border-[#1A1A23] flex flex-col p-0">
            {/* Chat Header */}
            <div className="p-6 border-b border-[#1A1A23]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={activeChat.participant.photo}
                      alt={activeChat.participant.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {activeChat.participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#121218] rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {activeChat.participant.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activeChat.participant.profession} •{' '}
                      {activeChat.vacancy.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'employer'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-lg ${
                      message.senderId === 'employer'
                        ? 'bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8]'
                        : 'bg-[#0A0A0F]'
                    } rounded-2xl p-4`}
                  >
                    {message.type === 'text' ? (
                      <p className="text-white">{message.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden bg-black w-64 h-48">
                          <video
                            src={message.videoUrl}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                              <Play className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        </div>
                        <p className="text-white text-sm">
                          {message.content}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-xs text-white/70">
                        {message.timestamp}
                      </span>
                      {message.senderId === 'employer' &&
                        (message.isRead ? (
                          <CheckCheck className="w-4 h-4 text-white/70" />
                        ) : (
                          <Check className="w-4 h-4 text-white/70" />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-[#1A1A23]">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-[#0A0A0F] border-[#1A1A23] text-white"
                />

                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-[#8E7FFF] to-[#39E0F8] hover:opacity-90"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 bg-[#121218] border-[#1A1A23] flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl text-gray-400">Выберите чат</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
